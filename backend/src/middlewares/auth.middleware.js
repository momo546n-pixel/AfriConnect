// src/middlewares/auth.middleware.js
const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/jwt.utils');

// ─── Middleware protect (toutes les routes privées) ──
const protect = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Token d\'accès manquant', 401));
    }

    const token = authHeader.split(' ')[1];

    // Vérifier et décoder le token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token expiré', 401));
      }
      return next(new AppError('Token invalide', 401));
    }

    // Vérifier que l'utilisateur existe encore
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) return next(new AppError('Utilisateur introuvable', 401));
    if (!user.isActive) return next(new AppError('Compte désactivé', 403));

    // Attacher l'user à la requête pour les controllers suivants
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Middleware restrictTo (routes admin) ────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Accès refusé : permissions insuffisantes', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };