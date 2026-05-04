// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt.utils');

// ─── Inscription ─────────────────────────────────────
const register = async ({ email, password, firstName, lastName, username }) => {
  // Vérifier si email existe déjà
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new AppError('Cet email est déjà utilisé', 400);

  // Vérifier si username existe déjà
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) throw new AppError('Ce nom d\'utilisateur est déjà pris', 400);

  // Hasher le mot de passe (12 rounds = bon équilibre sécurité/perf)
  const hashedPassword = await bcrypt.hash(password, 12);

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username: username.toLowerCase(),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  // Générer les tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Sauvegarder le refresh token en BDD
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return { user, accessToken, refreshToken };
};

// ─── Connexion ───────────────────────────────────────
const login = async ({ email, password }) => {
  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) throw new AppError('Email ou mot de passe incorrect', 401);
  if (!user.isActive) throw new AppError('Compte désactivé, contactez l\'admin', 403);

  // Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new AppError('Email ou mot de passe incorrect', 401);

  // Générer les tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Sauvegarder le refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Ne jamais renvoyer le mot de passe
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

// ─── Refresh Token ───────────────────────────────────
const refresh = async (refreshToken) => {
  if (!refreshToken) throw new AppError('Refresh token manquant', 401);

  // Vérifier le token JWT
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Refresh token invalide ou expiré', 401);
  }

  // Vérifier en BDD que le token existe et n'est pas expiré
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) throw new AppError('Refresh token révoqué', 401);
  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    throw new AppError('Refresh token expiré, veuillez vous reconnecter', 401);
  }

  // Générer un nouvel access token
  const accessToken = generateAccessToken(decoded.userId);

  return { accessToken };
};

// ─── Logout ──────────────────────────────────────────
const logout = async (refreshToken) => {
  if (!refreshToken) return;

  // Supprimer le refresh token de la BDD
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

// ─── Récupérer l'utilisateur connecté ────────────────
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      bio: true,
      avatar: true,
      coverImage: true,
      location: true,
      website: true,
      role: true,
      isVerified: true,
      createdAt: true,
      skills: true,
      experiences: true,
      educations: true,
      _count: {
        select: {
          posts: true,
          sentConnections: { where: { status: 'ACCEPTED' } },
        },
      },
    },
  });

  if (!user) throw new AppError('Utilisateur introuvable', 404);
  return user;
};

module.exports = { register, login, refresh, logout, getMe };