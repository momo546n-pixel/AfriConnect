// src/routes/auth.routes.js
const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// ─── Règles de validation ────────────────────────────
const registerRules = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Mot de passe minimum 8 caractères'),
  body('firstName').notEmpty().withMessage('Prénom requis'),
  body('lastName').notEmpty().withMessage('Nom requis'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username : 3-30 caractères, lettres/chiffres/underscore'),
];

const loginRules = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

// ─── Endpoints ───────────────────────────────────────
router.post('/register', registerRules, validate, authController.register);
router.post('/login',    loginRules,    validate, authController.login);
router.post('/refresh',  authController.refresh);
router.post('/logout',   authController.logout);
router.get('/me',        protect,       authController.getMe);

module.exports = router;