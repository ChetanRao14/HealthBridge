const bcrypt = require('bcrypt');

const { Admin } = require('../models/Admin');
const { Doctor } = require('../models/Doctor');
const { Patient } = require('../models/Patient');
const { Appointment } = require('../models/Appointment');
const { Prescription } = require('../models/Prescription');
const { asyncHandler } = require('../utils/asyncHandler');
const { clearRefreshCookie } = require('../utils/jwt');

const getMe = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.auth.id).select('-passwordHash -refreshTokenHash');
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }
  res.json(admin);
});

const updateMe = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const ok = /^\S+@\S+\.\S+$/.test(email);
  if (!ok) {
    res.status(400);
    throw new Error('Invalid email');
  }

  const [a, p, d] = await Promise.all([
    Admin.findOne({ email, _id: { $ne: req.auth.id } }).select('_id').lean(),
    Patient.findOne({ email }).select('_id').lean(),
    Doctor.findOne({ email }).select('_id').lean(),
  ]);
  if (a || p || d) {
    res.status(400);
    throw new Error('Email already in use');
  }

  const admin = await Admin.findByIdAndUpdate(
    req.auth.id,
    { $set: { email } },
    { new: true, runValidators: true }
  ).select('-passwordHash -refreshTokenHash');

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  res.json(admin);
});

const listDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find().select('-passwordHash -refreshTokenHash').sort({ createdAt: -1 });
  res.json(doctors);
});

const approveDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'approved', rejectionReason: '' } },
    { new: true }
  ).select('-passwordHash -refreshTokenHash');

  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  res.json(doctor);
});

const rejectDoctor = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'rejected', rejectionReason: reason || 'Rejected by admin' } },
    { new: true }
  ).select('-passwordHash -refreshTokenHash');

  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  res.json(doctor);
});

const blockDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'blocked' } },
    { new: true }
  ).select('-passwordHash -refreshTokenHash');

  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  res.json(doctor);
});

const blockPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'blocked' } },
    { new: true }
  ).select('-passwordHash -refreshTokenHash');

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  res.json(patient);
});

const listPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find().select('-passwordHash -refreshTokenHash').sort({ createdAt: -1 });
  res.json(patients);
});

const listAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization')
    .sort({ createdAt: -1 });

  res.json(appointments);
});

const analytics = asyncHandler(async (req, res) => {
  const [totalPatients, totalDoctors, totalAppointments] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Appointment.countDocuments(),
  ]);

  res.json({
    totalPatients,
    totalDoctors,
    totalAppointments,
  });
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

  const admin = await Admin.findById(req.auth.id);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  const ok = await admin.comparePassword(currentPassword);
  if (!ok) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  admin.refreshTokenHash = null;
  await admin.save();

  clearRefreshCookie(res);
  res.json({ ok: true });
});

const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).select('-passwordHash -refreshTokenHash');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  res.json(doctor);
});

const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).select('-passwordHash -refreshTokenHash');
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json(patient);
});

const listDoctorPrescriptions = asyncHandler(async (req, res) => {
  const doctorId = req.params.id;

  const docs = await Prescription.find({ doctor: doctorId })
    .populate('patient', 'title name email')
    .populate('appointment', 'date timeSlot status')
    .sort({ createdAt: -1 });

  res.json(docs);
});

module.exports = {
  getMe,
  updateMe,
  listDoctors,
  getDoctorById,
  listDoctorPrescriptions,
  approveDoctor,
  rejectDoctor,
  blockDoctor,
  blockPatient,
  listPatients,
  getPatientById,
  listAppointments,
  analytics,
  changePassword,
};
