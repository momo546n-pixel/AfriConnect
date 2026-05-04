// src/controllers/admin.controller.js
const prisma = require('../config/database');

const getStats = async (req, res, next) => {
  try {
    const [users, posts, connections, messages] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.connection.count({ where: { status: 'ACCEPTED' } }),
      prisma.message.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true, firstName: true, lastName: true,
        email: true, username: true, role: true,
        isActive: true, createdAt: true,
      },
    });

    res.json({ stats: { users, posts, connections, messages }, recentUsers });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;
    const search = req.query.search || '';

    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName:  { contains: search, mode: 'insensitive' } },
        { email:     { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true,
          email: true, username: true, role: true,
          isActive: true, isVerified: true, createdAt: true,
          _count: { select: { posts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true, firstName: true, lastName: true },
    });

    res.json({
      message: updated.isActive ? 'Compte réactivé' : 'Compte désactivé',
      user: updated,
    });
  } catch (err) { next(err); }
};

const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN', 'MODERATOR'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, role: true, firstName: true, lastName: true },
    });
    res.json({ message: 'Rôle mis à jour', user });
  } catch (err) { next(err); }
};

const deletePost = async (req, res, next) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: 'Publication supprimée par l\'admin' });
  } catch (err) { next(err); }
};

module.exports = { getStats, getAllUsers, toggleUserStatus, changeUserRole, deletePost };