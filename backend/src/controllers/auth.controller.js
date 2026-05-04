// src/controllers/auth.controller.js
const authService = require('../services/auth.service');

// ─── Inscription ─────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;
    const result = await authService.register({
      email, password, firstName, lastName, username,
    });

    res.status(201).json({
      message: 'Compte créé avec succès ! Bienvenue sur AfriConnect 🌍',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Connexion ───────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.json({
      message: 'Connexion réussie !',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Refresh Token ───────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);

    res.json({
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Logout ──────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);

    res.json({ message: 'Déconnexion réussie' });
  } catch (err) {
    next(err);
  }
};

// ─── Profil connecté ─────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, getMe };