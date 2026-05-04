// src/controllers/message.controller.js
const messageService = require('../services/message.service');

const sendMessage = async (req, res, next) => {
  try {
    const message = await messageService.sendMessage(
      req.user.id, req.params.userId, req.body.content
    );
    res.status(201).json({ message: 'Message envoyé', data: message });
  } catch (err) { next(err); }
};

const getConversation = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 30;
    const result = await messageService.getConversation(
      req.user.id, req.params.userId, page, limit
    );
    res.json(result);
  } catch (err) { next(err); }
};

const getConversations = async (req, res, next) => {
  try {
    const conversations = await messageService.getConversations(req.user.id);
    res.json({ conversations });
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await messageService.getUnreadCount(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = {
  sendMessage, getConversation,
  getConversations, getUnreadCount,
};