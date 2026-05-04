// src/controllers/post.controller.js
const postService = require('../services/post.service');

const createPost = async (req, res, next) => {
  try {
    const files = req.files || [];
    const post = await postService.createPost(req.user.id, req.body, files);
    res.status(201).json({ message: 'Publication créée !', post });
  } catch (err) { next(err); }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(req.user.id, req.params.id, req.body);
    res.json({ message: 'Publication mise à jour', post });
  } catch (err) { next(err); }
};

const deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.user.id, req.params.id, req.user.role);
    res.json({ message: 'Publication supprimée' });
  } catch (err) { next(err); }
};

const getFeed = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await postService.getFeed(req.user.id, page, limit);
    res.json(result);
  } catch (err) { next(err); }
};

const getUserPosts = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const posts = await postService.getUserPosts(
      req.params.username, req.user.id, page, limit
    );
    res.json({ posts });
  } catch (err) { next(err); }
};

const toggleLike = async (req, res, next) => {
  try {
    const result = await postService.toggleLike(req.user.id, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
};

const addComment = async (req, res, next) => {
  try {
    const comment = await postService.addComment(
      req.user.id, req.params.id, req.body.content
    );
    res.status(201).json({ message: 'Commentaire ajouté', comment });
  } catch (err) { next(err); }
};

const deleteComment = async (req, res, next) => {
  try {
    await postService.deleteComment(req.user.id, req.params.id, req.user.role);
    res.json({ message: 'Commentaire supprimé' });
  } catch (err) { next(err); }
};

const getComments = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const comments = await postService.getComments(req.params.id, page, limit);
    res.json({ comments });
  } catch (err) { next(err); }
};

module.exports = {
  createPost, updatePost, deletePost,
  getFeed, getUserPosts,
  toggleLike, addComment, deleteComment, getComments,
};