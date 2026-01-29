const bcrypt = require('bcrypt');

const { Admin } = require('../models/Admin');
const { Doctor } = require('../models/Doctor');
const { Patient } = require('../models/Patient');
const { asyncHandler } = require('../utils/asyncHandler');
const { clearRefreshCookie } = require('../utils/jwt');

function computeAgeFromDob(dob) {
  if (!(dob instanceof Date) || Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

const getMe = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.auth.id).select('-passwordHash -refreshTokenHash');
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json(patient);
});

const updateMe = asyncHandler(async (req, res) => {
  const updates = {};

  const allowed = ['title', 'name', 'email', 'age', 'gender', 'dob', 'phone', 'location', 'locationCountry', 'locationState', 'locationCity', 'address', 'medicalHistory'];
  for (const k of allowed) {
    if (typeof req.body[k] !== 'undefined') updates[k] = req.body[k];
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'title')) {
    updates.title = String(updates.title || '').trim();
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'email')) {
    updates.email = String(updates.email || '').trim().toLowerCase();
    const ok = /^\S+@\S+\.\S+$/.test(updates.email);
    if (!ok) {
      res.status(400);
      throw new Error('Invalid email');
    }

    const [p, d, a] = await Promise.all([
      Patient.findOne({ email: updates.email, _id: { $ne: req.auth.id } }).select('_id').lean(),
      Doctor.findOne({ email: updates.email }).select('_id').lean(),
      Admin.findOne({ email: updates.email }).select('_id').lean(),
    ]);
    if (p || d || a) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'locationState')) {
    updates.locationState = String(updates.locationState || '').trim();
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'locationCountry')) {
    updates.locationCountry = String(updates.locationCountry || '').trim().toUpperCase();
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'locationCity')) {
    updates.locationCity = String(updates.locationCity || '').trim();
    if (!Object.prototype.hasOwnProperty.call(updates, 'location')) {
      updates.location = updates.locationCity;
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'location')) {
    updates.location = String(updates.location || '').trim();
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'dob')) {
    const d = updates.dob ? new Date(updates.dob) : null;
    updates.dob = d && !Number.isNaN(d.getTime()) ? d : null;
    const age = updates.dob ? computeAgeFromDob(updates.dob) : null;
    if (age !== null) updates.age = age;
  }

  const patient = await Patient.findByIdAndUpdate(req.auth.id, { $set: updates }, { new: true, runValidators: true })
    .select('-passwordHash -refreshTokenHash');

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  res.json(patient);
});

const changePassword = asyncHandler(async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || '');
  const newPassword = String(req.body?.newPassword || '');

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current password and new password are required');
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const patient = await Patient.findById(req.auth.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const ok = await patient.comparePassword(currentPassword);
  if (!ok) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  patient.passwordHash = await bcrypt.hash(newPassword, 10);
  patient.refreshTokenHash = null;
  await patient.save();

  clearRefreshCookie(res);
  res.json({ ok: true });
});

module.exports = { getMe, updateMe, changePassword };
