const { Appointment } = require('../models/Appointment');
const { Prescription } = require('../models/Prescription');
const { asyncHandler } = require('../utils/asyncHandler');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');

const uploadPrescription = asyncHandler(async (req, res) => {
  const appointmentId = req.params.appointmentId;

  const appt = await Appointment.findById(appointmentId);
  if (!appt) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (String(appt.doctor) !== String(req.auth.id)) {
    res.status(403);
    throw new Error('Forbidden');
  }

  if (!['confirmed', 'completed'].includes(appt.status)) {
    res.status(400);
    throw new Error('Prescription can be uploaded only after confirmation');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Missing file');
  }

  const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'healthbridge/prescriptions',
    resource_type: 'auto',
  });

  const doc = await Prescription.findOneAndUpdate(
    { appointment: appointmentId },
    {
      $set: {
        appointment: appointmentId,
        patient: appt.patient,
        doctor: appt.doctor,
        file: { url: uploaded.secure_url, publicId: uploaded.public_id },
        notes: req.body.notes || '',
      },
    },
    { new: true, upsert: true }
  );

  res.json(doc);
});

const getPrescription = asyncHandler(async (req, res) => {
  const appointmentId = req.params.appointmentId;

  const appt = await Appointment.findById(appointmentId);
  if (!appt) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const isPatient = req.auth.role === 'patient' && String(appt.patient) === String(req.auth.id);
  const isDoctor = req.auth.role === 'doctor' && String(appt.doctor) === String(req.auth.id);

  if (!isPatient && !isDoctor) {
    res.status(403);
    throw new Error('Forbidden');
  }

  const doc = await Prescription.findOne({ appointment: appointmentId });
  if (!doc) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  res.json(doc);
});

module.exports = { uploadPrescription, getPrescription };
