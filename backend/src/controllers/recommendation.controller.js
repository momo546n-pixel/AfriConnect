// src/controllers/recommendation.controller.js
const recommendationService = require('../services/recommendation.service');

const suggestUsers = async (req, res, next) => {
  try {
    const users = await recommendationService.suggestUsers(req.user.id);
    res.json({ users });
  } catch (err) { next(err); }
};

const suggestPosts = async (req, res, next) => {
  try {
    const posts = await recommendationService.suggestPosts(req.user.id);
    res.json({ posts });
  } catch (err) { next(err); }
};

module.exports = { suggestUsers, suggestPosts };