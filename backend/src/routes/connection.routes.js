// src/routes/connection.routes.js
const router = require('express').Router();
const connectionController = require('../controllers/connection.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/',                              connectionController.getMyConnections);
router.get('/pending',                       connectionController.getPendingRequests);
router.get('/sent',                          connectionController.getSentRequests);
router.get('/status/:userId',                connectionController.getConnectionStatus);
router.post('/request/:userId',              connectionController.sendRequest);
router.patch('/:connectionId/respond',       connectionController.respondToRequest);
router.delete('/:connectionId',              connectionController.removeConnection);

module.exports = router;