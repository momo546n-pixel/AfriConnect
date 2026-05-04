// src/services/message.service.js
const prisma = require('../config/database');
const AppError = require('../utils/AppError');

// ─── Envoyer un message ──────────────────────────────
const sendMessage = async (senderId, receiverId, content) => {
  if (!content?.trim()) throw new AppError('Message vide', 400);

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) throw new AppError('Destinataire introuvable', 404);

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      senderId,
      receiverId,
    },
    include: {
      sender: {
        select: {
          id: true, firstName: true,
          lastName: true, username: true, avatar: true,
        },
      },
      receiver: {
        select: {
          id: true, firstName: true,
          lastName: true, username: true, avatar: true,
        },
      },
    },
  });

  // Notification
  await prisma.notification.create({
    data: {
      type: 'MESSAGE',
      message: 'vous a envoyé un message',
      userId: receiverId,
      actorId: senderId,
      entityId: message.id,
    },
  });

  return message;
};

// ─── Historique conversation entre 2 users ───────────
const getConversation = async (userId, otherUserId, page = 1, limit = 30) => {
  const skip = (page - 1) * limit;

  const other = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!other) throw new AppError('Utilisateur introuvable', 404);

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId,      receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId      },
      ],
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    include: {
      sender: {
        select: {
          id: true, firstName: true,
          lastName: true, username: true, avatar: true,
        },
      },
    },
  });

  // Marquer les messages reçus comme lus
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: userId,
      read: false,
    },
    data: { read: true },
  });

  return {
    messages: messages.reverse(), // ordre chronologique
    otherUser: other,
  };
};

// ─── Liste de toutes les conversations ───────────────
const getConversations = async (userId) => {
  // Trouver tous les utilisateurs avec qui on a échangé
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: {
        select: {
          id: true, firstName: true,
          lastName: true, username: true, avatar: true,
        },
      },
      receiver: {
        select: {
          id: true, firstName: true,
          lastName: true, username: true, avatar: true,
        },
      },
    },
  });

  // Grouper par conversation (une entrée par interlocuteur)
  const conversationsMap = new Map();

  for (const msg of messages) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;

    if (!conversationsMap.has(otherId)) {
      conversationsMap.set(otherId, {
        user: otherUser,
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    // Compter les non lus
    if (msg.receiverId === userId && !msg.read) {
      conversationsMap.get(otherId).unreadCount++;
    }
  }

  return Array.from(conversationsMap.values());
};

// ─── Nombre de messages non lus ──────────────────────
const getUnreadCount = async (userId) => {
  const count = await prisma.message.count({
    where: { receiverId: userId, read: false },
  });
  return { unreadCount: count };
};

module.exports = {
  sendMessage, getConversation,
  getConversations, getUnreadCount,
};