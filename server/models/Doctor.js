const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const fileSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const documentsSchema = new mongoose.Schema(
  {
    medicalLicense: { type: fileSchema, default: () => ({}) },
    degreeCertificate: { type: fileSchema, default: () => ({}) },
    governmentId: { type: fileSchema, default: () => ({}) },
  },
  { _id: false }
);

const dateSlotsSchema = new mongoose.Schema(
  {
    date: { type: String, trim: true, required: true },
    slots: [{ type: String, trim: true }],
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
    dob: { type: Date, default: null },
    age: { type: Number, min: 0, max: 130, default: null },
    clinicLocation: { type: String, trim: true, default: '', index: true },
    clinicCountry: { type: String, trim: true, default: '', index: true },
    clinicState: { type: String, trim: true, default: '', index: true },
    clinicCity: { type: String, trim: true, default: '', index: true },
    clinicAddress: { type: String, trim: true, default: '' },
    specialization: { type: String, required: true, trim: true, index: true },
    experienceYears: { type: Number, min: 0, max: 80, default: 0, index: true },
    consultationFees: { type: Number, min: 0, default: 0 },
    availableDays: [{ type: Number, min: 0, max: 6 }],
    availableSlots: [{ type: String, trim: true }],
    availableSlotsByDate: { type: [dateSlotsSchema], default: [] },
    ratingAvg: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'blocked'], default: 'pending', index: true },
    rejectionReason: { type: String, default: '' },
    documents: { type: documentsSchema, default: () => ({}) },
    role: { type: String, default: 'doctor', enum: ['doctor'] },
    refreshTokenHash: { type: String, default: null },
  },
  { timestamps: true }
);

doctorSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = { Doctor };
