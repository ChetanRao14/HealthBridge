const bcrypt = require('bcrypt');

const { Admin } = require('../models/Admin');
const { Doctor } = require('../models/Doctor');
const { Patient } = require('../models/Patient');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require('../utils/jwt');

function getModelByRole(role) {
  if (role === 'patient') return Patient;
  if (role === 'doctor') return Doctor;
  if (role === 'admin') return Admin;
  return null;
}

function getSafeUser(role, doc) {
  if (!doc) return null;

  if (role === 'patient') {
    return {
      id: doc._id,
      role,
      name: doc.name,
      email: doc.email,
      status: doc.status,
    };
  }

  if (role === 'doctor') {
    return {
      id: doc._id,
      role,
      name: doc.name,
      email: doc.email,
      status: doc.status,
      specialization: doc.specialization,
      experienceYears: doc.experienceYears,
      consultationFees: doc.consultationFees,
    };
  }

  return {
    id: doc._id,
    role,
    email: doc.email,
  };
}

function computeAgeFromDob(dob) {
  if (!(dob instanceof Date) || Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

async function ensureEmailNotTaken(email) {
  const [p, d, a] = await Promise.all([
    Patient.findOne({ email }).select('_id').lean(),
    Doctor.findOne({ email }).select('_id').lean(),
    Admin.findOne({ email }).select('_id').lean(),
  ]);

  return !(p || d || a);
}

async function issueTokensForDoc({ role, doc, res, Model }) {
  const accessToken = signAccessToken({ sub: doc._id, role });
  const refreshToken = signRefreshToken({ sub: doc._id, role });

  doc.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await doc.save();

  setRefreshCookie(res, refreshToken);

  return accessToken;
}

const registerPatient = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    title,
    phone,
    gender,
    dob,
    age,
    locationCountry,
    locationState,
    locationCity,
  } = req.body;

  const emailNorm = String(email || '').trim().toLowerCase();

  const ok = await ensureEmailNotTaken(emailNorm);
  if (!ok) {
    res.status(409);
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const dobDate = dob ? new Date(dob) : null;
  const dobSafe = dobDate && !Number.isNaN(dobDate.getTime()) ? dobDate : null;
  const computedAge = dobSafe ? computeAgeFromDob(dobSafe) : null;
  const parsedAge = typeof age === 'undefined' ? null : Number(age);
  const ageSafe = computedAge !== null ? computedAge : (Number.isFinite(parsedAge) ? parsedAge : undefined);

  const locationCitySafe = String(locationCity || '').trim();

  const patient = await Patient.create({
    name,
    email: emailNorm,
    passwordHash,
    title: typeof title === 'undefined' ? undefined : String(title || '').trim(),
    phone: typeof phone === 'undefined' ? undefined : String(phone || '').trim(),
    gender: String(gender || 'prefer_not_to_say').trim() || 'prefer_not_to_say',
    dob: dobSafe,
    age: ageSafe,
    locationCountry: typeof locationCountry === 'undefined' ? undefined : String(locationCountry || '').trim().toUpperCase(),
    locationState: typeof locationState === 'undefined' ? undefined : String(locationState || '').trim(),
    locationCity: locationCitySafe,
    location: locationCitySafe,
  });

  const accessToken = await issueTokensForDoc({ role: 'patient', doc: patient, res, Model: Patient });

  res.status(201).json({
    accessToken,
    user: getSafeUser('patient', patient),
  });
});

const loginPatient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const emailNorm = String(email || '').trim().toLowerCase();

  const patient = await Patient.findOne({ email: emailNorm });
  if (!patient) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (patient.status === 'blocked') {
    res.status(403);
    throw new Error('Account blocked');
  }

  const ok = await patient.comparePassword(password);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const accessToken = await issueTokensForDoc({ role: 'patient', doc: patient, res, Model: Patient });

  res.json({ accessToken, user: getSafeUser('patient', patient) });
});

const registerDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    specialization,
    title,
    phone,
    gender,
    dob,
    age,
    experienceYears,
    consultationFees,
    clinicCountry,
    clinicState,
    clinicCity,
    clinicAddress,
  } = req.body;

  const emailNorm = String(email || '').trim().toLowerCase();

  const ok = await ensureEmailNotTaken(emailNorm);
  if (!ok) {
    res.status(409);
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const dobDate = dob ? new Date(dob) : null;
  const dobSafe = dobDate && !Number.isNaN(dobDate.getTime()) ? dobDate : null;
  const computedAge = dobSafe ? computeAgeFromDob(dobSafe) : null;
  const parsedAge = typeof age === 'undefined' ? null : Number(age);
  const ageSafe = computedAge !== null ? computedAge : (Number.isFinite(parsedAge) ? parsedAge : undefined);

  const exp = typeof experienceYears === 'undefined' ? undefined : Number(experienceYears);
  const fees = typeof consultationFees === 'undefined' ? undefined : Number(consultationFees);

  const clinicCitySafe = typeof clinicCity === 'undefined' ? '' : String(clinicCity || '').trim();

  const doctor = await Doctor.create({
    name,
    email: emailNorm,
    passwordHash,
    specialization,
    title: typeof title === 'undefined' ? undefined : String(title || '').trim(),
    phone: typeof phone === 'undefined' ? undefined : String(phone || '').trim(),
    gender: typeof gender === 'undefined' ? undefined : String(gender || '').trim(),
    dob: dobSafe,
    age: ageSafe,
    experienceYears: Number.isFinite(exp) ? exp : undefined,
    consultationFees: Number.isFinite(fees) ? fees : undefined,
    clinicCountry: typeof clinicCountry === 'undefined' ? undefined : String(clinicCountry || '').trim().toUpperCase(),
    clinicState: typeof clinicState === 'undefined' ? undefined : String(clinicState || '').trim(),
    clinicCity: clinicCitySafe,
    clinicLocation: clinicCitySafe,
    clinicAddress: typeof clinicAddress === 'undefined' ? undefined : String(clinicAddress || '').trim(),
    status: 'pending',
  });

  const accessToken = await issueTokensForDoc({ role: 'doctor', doc: doctor, res, Model: Doctor });

  res.status(201).json({ accessToken, user: getSafeUser('doctor', doctor) });
});

const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const emailNorm = String(email || '').trim().toLowerCase();

  const doctor = await Doctor.findOne({ email: emailNorm });
  if (!doctor) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (doctor.status === 'blocked') {
    res.status(403);
    throw new Error('Account blocked');
  }

  const ok = await doctor.comparePassword(password);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const accessToken = await issueTokensForDoc({ role: 'doctor', doc: doctor, res, Model: Doctor });

  res.json({ accessToken, user: getSafeUser('doctor', doctor) });
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const emailNorm = String(email || '').trim().toLowerCase();

  const admin = await Admin.findOne({ email: emailNorm });
  if (!admin) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const ok = await admin.comparePassword(password);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const accessToken = signAccessToken({ sub: admin._id, role: 'admin' });
  const refreshToken = signRefreshToken({ sub: admin._id, role: 'admin' });

  admin.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await admin.save();

  setRefreshCookie(res, refreshToken);

  res.json({ accessToken, user: getSafeUser('admin', admin) });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies && req.cookies.refreshToken ? req.cookies.refreshToken : null;
  if (!token) {
    res.status(401);
    throw new Error('Missing refresh token');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (e) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  const role = decoded.role;
  const Model = getModelByRole(role);
  if (!Model) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  const doc = await Model.findById(decoded.sub);
  if (!doc || !doc.refreshTokenHash) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  const ok = await bcrypt.compare(token, doc.refreshTokenHash);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  const accessToken = await issueTokensForDoc({ role, doc, res, Model });

  res.json({ accessToken, user: getSafeUser(role, doc) });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies && req.cookies.refreshToken ? req.cookies.refreshToken : null;

  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      const Model = getModelByRole(decoded.role);
      if (Model) {
        await Model.findByIdAndUpdate(decoded.sub, { $set: { refreshTokenHash: null } });
      }
    } catch (e) {
    }
  }

  clearRefreshCookie(res);
  res.json({ ok: true });
});

module.exports = {
  registerPatient,
  loginPatient,
  registerDoctor,
  loginDoctor,
  loginAdmin,
  refresh,
  logout,
};
