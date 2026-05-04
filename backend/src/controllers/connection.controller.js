// src/controllers/connection.controller.js
const connectionService = require('../services/connection.service');

const sendRequest = async (req, res, next) => {
  try {
    const connection = await connectionService.sendRequest(
      req.user.id, req.params.userId
    );
    res.status(201).json({ message: 'Demande de connexion envoyée', connection });
  } catch (err) { next(err); }
};

const respondToRequest = async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' ou 'reject'
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action invalide (accept ou reject)' });
    }
    const connection = await connectionService.respondToRequest(
      req.user.id, req.params.connectionId, action
    );
    const msg = action === 'accept' ? 'Connexion acceptée !' : 'Demande refusée';
    res.json({ message: msg, connection });
  } catch (err) { next(err); }
};

const removeConnection = async (req, res, next) => {
  try {
    await connectionService.removeConnection(req.user.id, req.params.connectionId);
    res.json({ message: 'Connexion supprimée' });
  } catch (err) { next(err); }
};

const getMyConnections = async (req, res, next) => {
  try {
    const connections = await connectionService.getMyConnections(req.user.id);
    res.json({ connections, total: connections.length });
  } catch (err) { next(err); }
};

const getPendingRequests = async (req, res, next) => {
  try {
    const requests = await connectionService.getPendingRequests(req.user.id);
    res.json({ requests, total: requests.length });
  } catch (err) { next(err); }
};

const getSentRequests = async (req, res, next) => {
  try {
    const requests = await connectionService.getSentRequests(req.user.id);
    res.json({ requests, total: requests.length });
  } catch (err) { next(err); }
};

const getConnectionStatus = async (req, res, next) => {
  try {
    const status = await connectionService.getConnectionStatus(
      req.user.id, req.params.userId
    );
    res.json(status);
  } catch (err) { next(err); }
};

module.exports = {
  sendRequest, respondToRequest, removeConnection,
  getMyConnections, getPendingRequests, getSentRequests,
  getConnectionStatus,
};