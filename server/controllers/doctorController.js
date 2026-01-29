const bcrypt = require('bcrypt');

const { Admin } = require('../models/Admin');
const { Doctor } = require('../models/Doctor');
const { Appointment } = require('../models/Appointment');
const { Patient } = require('../models/Patient');
const { asyncHandler } = require('../utils/asyncHandler');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const { clearRefreshCookie } = require('../utils/jwt');

function isDateKey(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function todayKeyLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function computeAgeFromDob(dob) {
  if (!(dob instanceof Date) || Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

const getMe = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.auth.id).select('-passwordHash -refreshTokenHash');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  res.json(doctor);
});

const updateMe = asyncHandler(async (req, res) => {
  const updates = {};
  const allowed = [
    'title',
    'name',
    'email',
    'phone',
    'gender',
    'dob',
    'age',
    'clinicLocation',
    'clinicCountry',
    'clinicState',
    'clinicCity',
    'clinicAddress',
    'specialization',
    'experienceYears',
    'consultationFees',
    'availableDays',
    'availableSlots',
    'availableSlotsByDate',
  ];
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

    const [d, p, a] = await Promise.all([
      Doctor.findOne({ email: updates.email, _id: { $ne: req.auth.id } }).select('_id').lean(),
      Patient.findOne({ email: updates.email }).select('_id').lean(),
      Admin.findOne({ email: updates.email }).select('_id').lean(),
    ]);
    if (d || p || a) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'gender')) {
    updates.gender = String(updates.gender || '').trim();
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'dob')) {
    const d = updates.dob ? new Date(updates.dob) : null;
    updates.dob = d && !Number.isNaN(d.getTime()) ? d : null;
    const age = updates.dob ? computeAgeFromDob(updates.dob) : null;
    if (age !== null) updates.age = age;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'age')) {
    const n = Number(updates.age);
    updates.age = Number.isFinite(n) ? n : null;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'clinicLocation')) {
    updates.clinicLocation = String(updates.clinicLocation || '').trim();
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'clinicState')) {
    updates.clinicState = String(updates.clinicState || '').trim();
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'clinicCountry')) {
    updates.clinicCountry = String(updates.clinicCountry || '').trim().toUpperCase();
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'clinicCity')) {
    updates.clinicCity = String(updates.clinicCity || '').trim();
    if (!Object.prototype.hasOwnProperty.call(updates, 'clinicLocation')) {
      updates.clinicLocation = updates.clinicCity;
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'clinicAddress')) {
    updates.clinicAddress = String(updates.clinicAddress || '').trim();
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'experienceYears')) {
    const n = Number(updates.experienceYears);
    updates.experienceYears = Number.isFinite(n) ? n : 0;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'consultationFees')) {
    const n = Number(updates.consultationFees);
    updates.consultationFees = Number.isFinite(n) ? n : 0;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'availableDays')) {
    let days = updates.availableDays;
    if (typeof days === 'string') {
      try {
        days = JSON.parse(days);
      } catch (e) {
        days = days.split(',').map((s) => s.trim());
      }
    }

    if (!Array.isArray(days)) days = [];

    const normalized = Array.from(
      new Set(
        days
          .map((d) => Number(d))
          .filter((d) => Number.isFinite(d) && d >= 0 && d <= 6)
      )
    ).sort((a, b) => a - b);

    updates.availableDays = normalized;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'availableSlots')) {
    let slots = updates.availableSlots;
    if (typeof slots === 'string') {
      try {
        slots = JSON.parse(slots);
      } catch (e) {
        slots = slots.split(',').map((s) => s.trim());
      }
    }

    if (!Array.isArray(slots)) slots = [];

    const normalized = Array.from(
      new Set(slots.map((s) => String(s).trim()).filter(Boolean))
    );

    updates.availableSlots = normalized;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'availableSlotsByDate')) {
    const todayKey = todayKeyLocal();
    const now = new Date();

    let entries = updates.availableSlotsByDate;
    if (typeof entries === 'string') {
      try {
        entries = JSON.parse(entries);
      } catch (e) {
        entries = [];
      }
    }

    if (!Array.isArray(entries)) entries = [];

    const map = new Map();
    for (const raw of entries) {
      const date = raw && raw.date ? String(raw.date).trim() : '';
      if (!isDateKey(date)) continue;

      let slots = raw && raw.slots ? raw.slots : [];
      if (typeof slots === 'string') {
        try {
          slots = JSON.parse(slots);
        } catch (e) {
          slots = slots.split(',').map((s) => s.trim());
        }
      }

      if (!Array.isArray(slots)) slots = [];
      let normalizedSlots = Array.from(new Set(slots.map((s) => String(s).trim()).filter(Boolean)));

      if (date === todayKey) {
        normalizedSlots = normalizedSlots.filter((s) => {
          const m = String(s).match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
          if (!m) return true;
          const endH = Number(m[3]);
          const endM = Number(m[4]);
          if (!Number.isFinite(endH) || !Number.isFinite(endM)) return true;
          const end = new Date(now);
          end.setHours(endH, endM, 0, 0);
          return now < end;
        });
      }

      if (normalizedSlots.length === 0) continue;

      map.set(date, normalizedSlots);
    }

    updates.availableSlotsByDate = Array.from(map.entries())
      .map(([date, slots]) => ({ date, slots }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  const doctor = await Doctor.findByIdAndUpdate(req.auth.id, { $set: updates }, { new: true, runValidators: true })
    .select('-passwordHash -refreshTokenHash');

  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  res.json(doctor);
});

const listDoctors = asyncHandler(async (req, res) => {
  const { specialization, minExperience, availabilityDay, location, country, state, city } = req.query;

  const q = { status: 'approved' };
  if (specialization) q.specialization = new RegExp(String(specialization), 'i');
  if (country) {
    const c = String(country).trim().toUpperCase();
    if (c === 'IN') {
      q.$or = [
        { clinicCountry: new RegExp(`^${c}$`, 'i') },
        { clinicCountry: { $in: [null, ''] } },
      ];
    } else {
      q.clinicCountry = new RegExp(`^${c}$`, 'i');
    }
  }
  if (state) q.clinicState = new RegExp(`^${String(state).trim()}$`, 'i');
  if (city) q.clinicCity = new RegExp(`^${String(city).trim()}$`, 'i');
  if (!state && !city && location) q.clinicLocation = new RegExp(`^${String(location).trim()}$`, 'i');
  if (minExperience) q.experienceYears = { $gte: Number(minExperience) };
  if (availabilityDay !== undefined && availabilityDay !== null && availabilityDay !== '') {
    q.availableDays = { $in: [Number(availabilityDay)] };
  }

  const doctors = await Doctor.find(q)
    .select('name specialization experienceYears consultationFees availableDays availableSlots status ratingAvg ratingCount clinicLocation clinicCountry clinicState clinicCity clinicAddress')
    .sort({ experienceYears: -1 });

  res.json(doctors);
});

const getDoctorReviews = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId).select('name specialization ratingAvg ratingCount status');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  if (doctor.status !== 'approved') {
    res.status(400);
    throw new Error('Doctor is not available');
  }

  const reviews = await Appointment.find({ doctor: doctorId, patientRating: { $gte: 1 } })
    .select('patientRating patientReview reviewedAt createdAt')
    .populate('patient', 'title name')
    .sort({ reviewedAt: -1, createdAt: -1 })
    .limit(50);

  res.json({ doctor, reviews });
});

const getDoctorSlots = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!isDateKey(String(date || ''))) {
    res.status(400);
    throw new Error('Invalid date');
  }

  const doctor = await Doctor.findById(doctorId).select('status availableSlots availableSlotsByDate');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  if (doctor.status !== 'approved') {
    res.status(400);
    throw new Error('Doctor is not available for booking');
  }

  const dateWise = Array.isArray(doctor.availableSlotsByDate) ? doctor.availableSlotsByDate : [];
  const entry = dateWise.find((e) => String(e.date) === String(date));
  const dateSlots = entry && Array.isArray(entry.slots) ? entry.slots : [];
  if (dateSlots.length > 0) {
    res.json({ mode: 'date', slots: dateSlots });
    return;
  }

  const slots = Array.isArray(doctor.availableSlots) ? doctor.availableSlots : [];
  res.json({ mode: 'default', slots });
});

const uploadDocuments = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.auth.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  const files = req.files || {};

  const map = [
    { field: 'medicalLicense', path: 'documents.medicalLicense', folder: 'healthbridge/doctor_docs' },
    { field: 'degreeCertificate', path: 'documents.degreeCertificate', folder: 'healthbridge/doctor_docs' },
    { field: 'governmentId', path: 'documents.governmentId', folder: 'healthbridge/doctor_docs' },
  ];

  for (const item of map) {
    const fileArr = files[item.field];
    if (!fileArr || !fileArr[0]) continue;

    const file = fileArr[0];

    const uploaded = await uploadBufferToCloudinary(file.buffer, {
      folder: item.folder,
      resource_type: 'auto',
    });

    doctor.set(item.path, { url: uploaded.secure_url, publicId: uploaded.public_id });
  }

  if (doctor.status === 'rejected') {
    doctor.status = 'pending';
    doctor.rejectionReason = '';
  }

  await doctor.save();

  res.json({ ok: true, doctor: await Doctor.findById(doctor._id).select('-passwordHash -refreshTokenHash') });
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

  const doctor = await Doctor.findById(req.auth.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  const ok = await doctor.comparePassword(currentPassword);
  if (!ok) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  doctor.passwordHash = await bcrypt.hash(newPassword, 10);
  doctor.refreshTokenHash = null;
  await doctor.save();

  clearRefreshCookie(res);
  res.json({ ok: true });
});

module.exports = {
  getMe,
  updateMe,
  listDoctors,
  getDoctorSlots,
  getDoctorReviews,
  uploadDocuments,
  changePassword,
};
