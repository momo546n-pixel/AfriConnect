// server.js
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const prisma = require('./src/config/database');
const { initSocket } = require('./src/socket/socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialiser Socket.io
const io = initSocket(server);

// Rendre io accessible dans les controllers si besoin
app.set('io', io);

const start = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connexion PostgreSQL établie');

    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`⚡ Socket.io activé`);
      console.log(`🌍 http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage :', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  server.close(() => process.exit(1));
});

start();
module.exports = server;