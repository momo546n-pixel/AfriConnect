// src/routes/user.routes.js
const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Routes publiques
router.get('/search',        protect, userController.searchUsers);
router.get('/:username',     userController.getProfile);

// Routes privées (nécessitent d'être connecté)
router.patch('/profile/update',               protect, userController.updateProfile);
router.post('/profile/avatar',                protect, upload.single('avatar'), userController.uploadAvatar);
router.post('/profile/cover',                 protect, upload.single('cover'),  userController.uploadCover);
router.put('/profile/skills',                 protect, userController.updateSkills);
router.post('/profile/experience',            protect, userController.addExperience);
router.delete('/profile/experience/:id',      protect, userController.deleteExperience);
router.post('/profile/education',             protect, userController.addEducation);
router.delete('/profile/education/:id',       protect, userController.deleteEducation);

module.exports = router;