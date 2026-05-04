// src/socket/socket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

// Map userId -> socketId (qui est en ligne)
const onlineUsers = new Map();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ─── Middleware auth Socket ────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Token manquant'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, firstName: true, lastName: true, username: true },
      });

      if (!user) return next(new Error('Utilisateur introuvable'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  // ─── Connexion ────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`🟢 ${socket.user.username} connecté (${socket.id})`);

    // Enregistrer l'utilisateur comme "en ligne"
    onlineUsers.set(userId, socket.id);

    // Informer les autres qu'il est en ligne
    socket.broadcast.emit('user:online', { userId });

    // Rejoindre sa salle personnelle
    socket.join(`user:${userId}`);

    // ─── Envoyer un message ────────────────────────
    socket.on('message:send', async (data) => {
      const { receiverId, content } = data;

      if (!content?.trim() || !receiverId) return;

      try {
        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            senderId: userId,
            receiverId,
          },
          include: {
            sender: {
              select: {
                id: true, firstName: true,
                lastName: true, username: true, avatar: true,
              },
            },
          },
        });

        // Envoyer au destinataire en temps réel
        io.to(`user:${receiverId}`).emit('message:receive', message);

        // Confirmer à l'expéditeur
        socket.emit('message:sent', message);

      } catch (err) {
        socket.emit('message:error', { error: 'Erreur envoi message' });
      }
    });

    // ─── Marquer comme lu ──────────────────────────
    socket.on('message:read', async ({ senderId }) => {
      await prisma.message.updateMany({
        where: {
          senderId,
          receiverId: userId,
          read: false,
        },
        data: { read: true },
      });

      // Informer l'expéditeur que ses messages ont été lus
      io.to(`user:${senderId}`).emit('message:read_ack', { readBy: userId });
    });

    // ─── Typing indicator ──────────────────────────
    socket.on('typing:start', ({ receiverId }) => {
      io.to(`user:${receiverId}`).emit('typing:start', { userId });
    });

    socket.on('typing:stop', ({ receiverId }) => {
      io.to(`user:${receiverId}`).emit('typing:stop', { userId });
    });

    // ─── Déconnexion ───────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔴 ${socket.user.username} déconnecté`);
      onlineUsers.delete(userId);
      socket.broadcast.emit('user:offline', { userId });
    });
  });

  return io;
};

// Vérifier si un user est en ligne
const isUserOnline = (userId) => onlineUsers.has(userId);

module.exports = { initSocket, isUserOnline };