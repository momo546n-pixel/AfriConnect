// src/middlewares/upload.middleware.js
const multer = require('multer');
const AppError = require('../utils/AppError');

// Stocker en mémoire (on envoie directement à Cloudinary)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Seules les images sont autorisées', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;