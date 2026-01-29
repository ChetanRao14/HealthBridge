const { Appointment } = require('../models/Appointment');
const { Doctor } = require('../models/Doctor');
const { asyncHandler } = require('../utils/asyncHandler');

function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, timeSlot, patientNotes } = req.body;

  const doctor = await Doctor.findById(doctorId).select('status availableDays availableSlots availableSlotsByDate');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  if (doctor.status !== 'approved') {
    res.status(400);
    throw new Error('Doctor is not available for booking');
  }

  const normalizedDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? `${date}T00:00:00`
    : date;
  const dt = new Date(normalizedDate);
  if (!isValidDate(dt)) {
    res.status(400);
    throw new Error('Invalid date');
  }

  const startOfSelected = new Date(dt);
  startOfSelected.setHours(0, 0, 0, 0);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (startOfSelected < startOfToday) {
    res.status(400);
    throw new Error('You cannot book an appointment for a previous date');
  }

  const dateKey = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : (() => {
      const d = new Date(dt);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 10);
    })();

  const dateWise = Array.isArray(doctor.availableSlotsByDate) ? doctor.availableSlotsByDate : [];
  const entry = dateWise.find((e) => String(e.date) === String(dateKey));
  const dateSlots = entry && Array.isArray(entry.slots) ? entry.slots : [];
  const hasDateSlots = dateSlots.length > 0;
  if (hasDateSlots) {
    if (!dateSlots.includes(timeSlot)) {
      res.status(400);
      throw new Error('Time slot not available for the selected date');
    }
  } else {
    const defaultSlots = Array.isArray(doctor.availableSlots) ? doctor.availableSlots : [];
    if (defaultSlots.length === 0) {
      res.status(400);
      throw new Error('Doctor has no slots for the selected date');
    }
    if (!defaultSlots.includes(timeSlot)) {
      res.status(400);
      throw new Error('Time slot not available');
    }

    if (doctor.availableDays && doctor.availableDays.length > 0) {
      const day = dt.getDay();
      if (!doctor.availableDays.includes(day)) {
        res.status(400);
        throw new Error('Doctor not available on this day');
      }
    }
  }

  if (timeSlot && startOfSelected.getTime() === startOfToday.getTime()) {
    const m = String(timeSlot).match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
    if (m) {
      const endH = Number(m[3]);
      const endM = Number(m[4]);
      if (Number.isFinite(endH) && Number.isFinite(endM)) {
        const now = new Date();
        const slotEnd = new Date(now);
        slotEnd.setHours(endH, endM, 0, 0);
        if (now >= slotEnd) {
          res.status(400);
          throw new Error('Selected time slot is already completed for today');
        }
      }
    }
  }

  const appointment = await Appointment.create({
    patient: req.auth.id,
    doctor: doctorId,
    date: dt,
    timeSlot,
    patientNotes: patientNotes || '',
    status: 'pending',
  });

  res.status(201).json(appointment);
});

const myAppointments = asyncHandler(async (req, res) => {
  const appts = await Appointment.find({ patient: req.auth.id })
    .populate('doctor', 'name specialization experienceYears consultationFees ratingAvg ratingCount')
    .sort({ date: -1 });

  res.json(appts);
});

const doctorAppointments = asyncHandler(async (req, res) => {
  const appts = await Appointment.find({ doctor: req.auth.id })
    .populate('patient', 'title name age gender dob phone locationState locationCity location medicalHistory')
    .sort({ date: -1 });

  res.json(appts);
});

const respondToAppointment = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;

  const appt = await Appointment.findById(req.params.id);
  if (!appt) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (String(appt.doctor) !== String(req.auth.id)) {
    res.status(403);
    throw new Error('Forbidden');
  }

  if (appt.status !== 'pending') {
    res.status(400);
    throw new Error('Appointment cannot be updated');
  }

  if (action === 'accept') {
    appt.status = 'confirmed';
    appt.rejectionReason = '';
  } else if (action === 'reject') {
    appt.status = 'rejected';
    appt.rejectionReason = reason || 'Rejected by doctor';
  } else {
    res.status(400);
    throw new Error('Invalid action');
  }

  await appt.save();
  res.json(appt);
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (String(appt.patient) !== String(req.auth.id)) {
    res.status(403);
    throw new Error('Forbidden');
  }

  if (!['pending', 'confirmed'].includes(appt.status)) {
    res.status(400);
    throw new Error('Appointment cannot be cancelled');
  }

  appt.status = 'cancelled';
  await appt.save();
  res.json(appt);
});

const markCompleted = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (String(appt.doctor) !== String(req.auth.id)) {
    res.status(403);
    throw new Error('Forbidden');
  }

  if (appt.status !== 'confirmed') {
    res.status(400);
    throw new Error('Only confirmed appointments can be completed');
  }

  appt.status = 'completed';
  await appt.save();
  res.json(appt);
});

const submitReview = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (String(appt.patient) !== String(req.auth.id)) {
    res.status(403);
    throw new Error('Forbidden');
  }

  if (appt.status !== 'completed') {
    res.status(400);
    throw new Error('You can only review a completed appointment');
  }

  const rating = Number(req.body.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('rating must be between 1 and 5');
  }

  const review = String(req.body.review || '').trim();
  if (review.length > 500) {
    res.status(400);
    throw new Error('review is too long');
  }

  appt.patientRating = rating;
  appt.patientReview = review;
  appt.reviewedAt = new Date();
  await appt.save();

  const agg = await Appointment.aggregate([
    { $match: { doctor: appt.doctor, patientRating: { $gte: 1 } } },
    { $group: { _id: '$doctor', avg: { $avg: '$patientRating' }, count: { $sum: 1 } } },
  ]);

  const avg = agg && agg[0] && typeof agg[0].avg === 'number' ? agg[0].avg : 0;
  const count = agg && agg[0] && typeof agg[0].count === 'number' ? agg[0].count : 0;

  await Doctor.findByIdAndUpdate(appt.doctor, {
    $set: {
      ratingAvg: Math.round(avg * 10) / 10,
      ratingCount: count,
    },
  });

  res.json(appt);
});

module.exports = {
  createAppointment,
  myAppointments,
  doctorAppointments,
  respondToAppointment,
  cancelAppointment,
  markCompleted,
  submitReview,
};
