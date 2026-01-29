const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, trim: true, default: '' },
    village: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    age: { type: Number, min: 0, max: 130 },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    dob: { type: Date, default: null },
    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '', index: true },
    locationCountry: { type: String, trim: true, default: '', index: true },
    locationState: { type: String, trim: true, default: '', index: true },
    locationCity: { type: String, trim: true, default: '', index: true },
    address: { type: addressSchema, default: () => ({}) },
    medicalHistory: { type: String, default: '' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    role: { type: String, default: 'patient', enum: ['patient'] },
    refreshTokenHash: { type: String, default: null },
  },
  { timestamps: true }
);

patientSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

const Patient = mongoose.model('Patient', patientSchema);

module.exports = { Patient };
