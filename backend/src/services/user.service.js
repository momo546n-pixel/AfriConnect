// src/services/user.service.js
const prisma = require('../config/database');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// ─── Voir un profil public ───────────────────────────
const getProfile = async (username) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      bio: true,
      avatar: true,
      coverImage: true,
      location: true,
      website: true,
      isVerified: true,
      createdAt: true,
      skills: { select: { id: true, name: true } },
      experiences: {
        orderBy: { startDate: 'desc' },
        select: {
          id: true, title: true, company: true,
          location: true, startDate: true, endDate: true,
          current: true, description: true,
        },
      },
      educations: {
        orderBy: { startDate: 'desc' },
        select: {
          id: true, school: true, degree: true,
          field: true, startDate: true, endDate: true, current: true,
        },
      },
      _count: {
        select: {
          posts: true,
          sentConnections: { where: { status: 'ACCEPTED' } },
        },
      },
    },
  });

  if (!user) throw new AppError('Profil introuvable', 404);
  return user;
};

// ─── Modifier son profil ─────────────────────────────
const updateProfile = async (userId, data) => {
  const allowedFields = [
    'firstName', 'lastName', 'bio',
    'location', 'website', 'phoneNumber',
  ];

  // Filtrer uniquement les champs autorisés
  const updateData = {};
  allowedFields.forEach(field => {
    if (data[field] !== undefined) updateData[field] = data[field];
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true, firstName: true, lastName: true,
      username: true, bio: true, avatar: true,
      coverImage: true, location: true, website: true,
    },
  });

  return user;
};

// ─── Upload avatar ───────────────────────────────────
const uploadAvatar = async (userId, fileBuffer) => {
  // Convertir le buffer en base64
  const base64 = fileBuffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64}`;

  // Uploader sur Cloudinary
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'africonnect/avatars',
    public_id: `avatar_${userId}`,
    overwrite: true,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  // Sauvegarder l'URL en BDD
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: result.secure_url },
    select: { id: true, avatar: true },
  });

  return user;
};

// ─── Upload cover image ──────────────────────────────
const uploadCover = async (userId, fileBuffer) => {
  const base64 = fileBuffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'africonnect/covers',
    public_id: `cover_${userId}`,
    overwrite: true,
    transformation: [
      { width: 1200, height: 400, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { coverImage: result.secure_url },
    select: { id: true, coverImage: true },
  });

  return user;
};

// ─── Gérer les compétences ───────────────────────────
const updateSkills = async (userId, skills) => {
  // Supprimer toutes les compétences existantes
  await prisma.skill.deleteMany({ where: { userId } });

  // Recréer avec les nouvelles (max 20)
  const skillsData = skills.slice(0, 20).map(name => ({
    name: name.trim(),
    userId,
  }));

  await prisma.skill.createMany({ data: skillsData });

  return prisma.skill.findMany({ where: { userId } });
};

// ─── Ajouter une expérience ──────────────────────────
const addExperience = async (userId, data) => {
  const experience = await prisma.experience.create({
    data: {
      ...data,
      userId,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
  return experience;
};

// ─── Supprimer une expérience ────────────────────────
const deleteExperience = async (userId, experienceId) => {
  const experience = await prisma.experience.findUnique({
    where: { id: experienceId },
  });

  if (!experience) throw new AppError('Expérience introuvable', 404);
  if (experience.userId !== userId) throw new AppError('Non autorisé', 403);

  await prisma.experience.delete({ where: { id: experienceId } });
};

// ─── Ajouter une formation ───────────────────────────
const addEducation = async (userId, data) => {
  const education = await prisma.education.create({
    data: {
      ...data,
      userId,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });
  return education;
};

// ─── Supprimer une formation ─────────────────────────
const deleteEducation = async (userId, educationId) => {
  const education = await prisma.education.findUnique({
    where: { id: educationId },
  });

  if (!education) throw new AppError('Formation introuvable', 404);
  if (education.userId !== userId) throw new AppError('Non autorisé', 403);

  await prisma.education.delete({ where: { id: educationId } });
};

// ─── Rechercher des utilisateurs ────────────────────
const searchUsers = async (query, currentUserId) => {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: currentUserId } },
        { isActive: true },
        {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName:  { contains: query, mode: 'insensitive' } },
            { username:  { contains: query, mode: 'insensitive' } },
            { bio:       { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: {
      id: true, firstName: true, lastName: true,
      username: true, avatar: true, bio: true, location: true,
    },
    take: 20,
  });

  return users;
};

module.exports = {
  getProfile, updateProfile, uploadAvatar, uploadCover,
  updateSkills, addExperience, deleteExperience,
  addEducation, deleteEducation, searchUsers,
};