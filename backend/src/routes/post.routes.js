// src/routes/post.routes.js
const router = require('express').Router();
const postController = require('../controllers/post.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Toutes les routes posts nécessitent d'être connecté
router.use(protect);

router.get('/feed',                    postController.getFeed);
router.get('/user/:username',          postController.getUserPosts);
router.post('/',    upload.array('images', 4), postController.createPost);
router.patch('/:id',                   postController.updatePost);
router.delete('/:id',                  postController.deletePost);
router.post('/:id/like',               postController.toggleLike);
router.get('/:id/comments',            postController.getComments);
router.post('/:id/comments',           postController.addComment);
router.delete('/comments/:id',         postController.deleteComment);

module.exports = router;