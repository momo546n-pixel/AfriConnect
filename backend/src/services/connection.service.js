// src/services/connection.service.js
const prisma = require('../config/database');
const AppError = require('../utils/AppError');

// ─── Envoyer une demande ─────────────────────────────
const sendRequest = async (senderId, receiverId) => {
  if (senderId === receiverId) {
    throw new AppError('Vous ne pouvez pas vous connecter à vous-même', 400);
  }

  // Vérifier que le destinataire existe
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) throw new AppError('Utilisateur introuvable', 404);

  // Vérifier si une connexion existe déjà
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (existing) {
    if (existing.status === 'ACCEPTED') throw new AppError('Vous êtes déjà connectés', 400);
    if (existing.status === 'PENDING')  throw new AppError('Demande déjà envoyée', 400);
    if (existing.status === 'BLOCKED')  throw new AppError('Action impossible', 400);
  }

  const connection = await prisma.connection.create({
    data: { senderId, receiverId, status: 'PENDING' },
    include: {
      receiver: {
        select: {
          id: true, firstName: true,
          lastName: true, username: true, avatar: true,
        },
      },
    },
  });

  // Notification pour le destinataire
  await prisma.notification.create({
    data: {
      type: 'CONNECTION_REQUEST',
      message: 'vous a envoyé une demande de connexion',
      userId: receiverId,
      actorId: senderId,
      entityId: connection.id,
    },
  });

  return connection;
};

// ─── Répondre à une demande ──────────────────────────
const respondToRequest = async (userId, connectionId, action) => {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) throw new AppError('Demande introuvable', 404);
  if (connection.receiverId !== userId) throw new AppError('Non autorisé', 403);
  if (connection.status !== 'PENDING') throw new AppError('Demande déjà traitée', 400);

  const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { status },
    include: {
      sender: {
        select: {
          id: true, firstName: true,
          lastName: true, username: true, avatar: true,
        },
      },
    },
  });

  // Notification si accepté
  if (status === 'ACCEPTED') {
    await prisma.notification.create({
      data: {
        type: 'CONNECTION_ACCEPTED',
        message: 'a accepté votre demande de connexion',
        userId: connection.senderId,
        actorId: userId,
        entityId: connectionId,
      },
    });
  }

  return updated;
};

// ─── Supprimer une connexion ─────────────────────────
const removeConnection = async (userId, connectionId) => {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) throw new AppError('Connexion introuvable', 404);

  if (connection.senderId !== userId && connection.receiverId !== userId) {
    throw new AppError('Non autorisé', 403);
  }

  await prisma.connection.delete({ where: { id: connectionId } });
};

// ─── Mes connexions acceptées ────────────────────────
const getMyConnections = async (userId) => {
  const connections = await prisma.connection.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: {
        select: {
          id: true, firstName: true, lastName: true,
          username: true, avatar: true, bio: true, location: true,
        },
      },
      receiver: {
        select: {
          id: true, firstName: true, lastName: true,
          username: true, avatar: true, bio: true, location: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Retourner l'autre personne (pas soi-même)
  return connections.map(c => ({
    connectionId: c.id,
    user: c.senderId === userId ? c.receiver : c.sender,
    connectedAt: c.updatedAt,
  }));
};

// ─── Demandes reçues en attente ──────────────────────
const getPendingRequests = async (userId) => {
  const requests = await prisma.connection.findMany({
    where: { receiverId: userId, status: 'PENDING' },
    include: {
      sender: {
        select: {
          id: true, firstName: true, lastName: true,
          username: true, avatar: true, bio: true, location: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map(r => ({
    connectionId: r.id,
    user: r.sender,
    sentAt: r.createdAt,
  }));
};

// ─── Demandes envoyées en attente ────────────────────
const getSentRequests = async (userId) => {
  const requests = await prisma.connection.findMany({
    where: { senderId: userId, status: 'PENDING' },
    include: {
      receiver: {
        select: {
          id: true, firstName: true, lastName: true,
          username: true, avatar: true, bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map(r => ({
    connectionId: r.id,
    user: r.receiver,
    sentAt: r.createdAt,
  }));
};

// ─── Statut de connexion entre deux users ────────────
const getConnectionStatus = async (userId, targetId) => {
  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId: userId,   receiverId: targetId },
        { senderId: targetId, receiverId: userId   },
      ],
    },
  });

  if (!connection) return { status: 'NONE' };

  return {
    status: connection.status,
    connectionId: connection.id,
    isSender: connection.senderId === userId,
  };
};

module.exports = {
  sendRequest, respondToRequest, removeConnection,
  getMyConnections, getPendingRequests, getSentRequests,
  getConnectionStatus,
};