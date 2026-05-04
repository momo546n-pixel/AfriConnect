// src/services/recommendation.service.js
const prisma = require('../config/database');

// ─── Suggérer des profils ─────────────────────────────
const suggestUsers = async (userId, limit = 10) => {
  // Récupérer les IDs déjà connectés ou en attente
  const existing = await prisma.connection.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    select: { senderId: true, receiverId: true },
  });

  const excludeIds = new Set([userId]);
  existing.forEach(c => {
    excludeIds.add(c.senderId);
    excludeIds.add(c.receiverId);
  });

  // Récupérer le profil de l'utilisateur pour matcher les compétences
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { skills: true },
  });

  const mySkillNames = currentUser?.skills.map(s => s.name) || [];

  // Chercher des utilisateurs avec des compétences similaires
  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludeIds) },
      isActive: true,
    },
    include: {
      skills: true,
      _count: {
        select: {
          sentConnections: { where: { status: 'ACCEPTED' } },
        },
      },
    },
    take: 50,
  });

  // Scorer chaque candidat
  const scored = candidates.map(user => {
    let score = 0;

    // +2 points par compétence commune
    const commonSkills = user.skills.filter(s =>
      mySkillNames.includes(s.name)
    ).length;
    score += commonSkills * 2;

    // +1 point si même localisation
    if (user.location && currentUser?.location &&
        user.location.toLowerCase().includes(
          currentUser.location.toLowerCase().split(',')[0]
        )) {
      score += 1;
    }

    // +1 point si profil complété (bio + avatar)
    if (user.bio) score += 1;
    if (user.avatar) score += 1;

    return { ...user, score };
  });

  // Trier par score puis par nombre de connexions
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b._count.sentConnections - a._count.sentConnections;
  });

  return scored.slice(0, limit).map(({ score, skills, ...user }) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
      commonSkills: user.skills?.filter(s =>
        mySkillNames.includes(s.name)
      ).map(s => s.name),
    connectionsCount: user._count.sentConnections,
  }));
};

// ─── Suggérer des posts ───────────────────────────────
const suggestPosts = async (userId, limit = 5) => {
  // Posts populaires des 7 derniers jours que l'user n'a pas likés
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const posts = await prisma.post.findMany({
    where: {
      visibility: 'PUBLIC',
      authorId: { not: userId },
      createdAt: { gte: sevenDaysAgo },
      likes: { none: { userId } },
    },
    include: {
      author: {
        select: {
          id: true, firstName: true, lastName: true,
          username: true, avatar: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: [
      { likes: { _count: 'desc' } },
      { comments: { _count: 'desc' } },
    ],
    take: limit,
  });

  return posts;
};

module.exports = { suggestUsers, suggestPosts };