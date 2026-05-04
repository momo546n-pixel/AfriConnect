// src/routes/admin.routes.js
const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/stats',                    adminController.getStats);
router.get('/users',                    adminController.getAllUsers);
router.patch('/users/:id/toggle',       adminController.toggleUserStatus);
router.patch('/users/:id/role',         adminController.changeUserRole);
router.delete('/posts/:id',             adminController.deletePost);

module.exports = router;