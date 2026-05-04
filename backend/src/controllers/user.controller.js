// src/controllers/user.controller.js
const userService = require('../services/user.service');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.params.username);
    res.json({ user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ message: 'Profil mis à jour', user });
  } catch (err) { next(err); }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next(new (require('../utils/AppError'))('Image requise', 400));
    const user = await userService.uploadAvatar(req.user.id, req.file.buffer);
    res.json({ message: 'Photo de profil mise à jour', user });
  } catch (err) { next(err); }
};

const uploadCover = async (req, res, next) => {
  try {
    if (!req.file) return next(new (require('../utils/AppError'))('Image requise', 400));
    const user = await userService.uploadCover(req.user.id, req.file.buffer);
    res.json({ message: 'Photo de couverture mise à jour', user });
  } catch (err) { next(err); }
};

const updateSkills = async (req, res, next) => {
  try {
    const skills = await userService.updateSkills(req.user.id, req.body.skills);
    res.json({ message: 'Compétences mises à jour', skills });
  } catch (err) { next(err); }
};

const addExperience = async (req, res, next) => {
  try {
    const experience = await userService.addExperience(req.user.id, req.body);
    res.status(201).json({ message: 'Expérience ajoutée', experience });
  } catch (err) { next(err); }
};

const deleteExperience = async (req, res, next) => {
  try {
    await userService.deleteExperience(req.user.id, req.params.id);
    res.json({ message: 'Expérience supprimée' });
  } catch (err) { next(err); }
};

const addEducation = async (req, res, next) => {
  try {
    const education = await userService.addEducation(req.user.id, req.body);
    res.status(201).json({ message: 'Formation ajoutée', education });
  } catch (err) { next(err); }
};

const deleteEducation = async (req, res, next) => {
  try {
    await userService.deleteEducation(req.user.id, req.params.id);
    res.json({ message: 'Formation supprimée' });
  } catch (err) { next(err); }
};

const searchUsers = async (req, res, next) => {
  try {
    const users = await userService.searchUsers(req.query.q || '', req.user.id);
    res.json({ users });
  } catch (err) { next(err); }
};

module.exports = {
  getProfile, updateProfile, uploadAvatar, uploadCover,
  updateSkills, addExperience, deleteExperience,
  addEducation, deleteEducation, searchUsers,
};