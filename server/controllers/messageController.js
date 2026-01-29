const { Appointment } = require('../models/Appointment');
const { Message } = require('../models/Message');
const { asyncHandler } = require('../utils/asyncHandler');

async function ensureChatAllowed({ appointmentId, auth }) {
  const appt = await Appointment.findById(appointmentId);
  if (!appt) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  const isPatient = auth.role === 'patient' && String(appt.patient) === String(auth.id);
  const isDoctor = auth.role === 'doctor' && String(appt.doctor) === String(auth.id);

  if (!isPatient && !isDoctor) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  if (!['confirmed', 'completed'].includes(appt.status)) {
    const err = new Error('Chat is only available for confirmed appointments');
    err.statusCode = 400;
    throw err;
  }

  return appt;
}

const listMessages = asyncHandler(async (req, res) => {
  await ensureChatAllowed({ appointmentId: req.params.appointmentId, auth: req.auth });

  const messages = await Message.find({ appointment: req.params.appointmentId }).sort({ createdAt: 1 });
  res.json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  await ensureChatAllowed({ appointmentId: req.params.appointmentId, auth: req.auth });

  const senderModel = req.auth.role === 'patient' ? 'Patient' : 'Doctor';

  const msg = await Message.create({
    appointment: req.params.appointmentId,
    senderModel,
    sender: req.auth.id,
    senderRole: req.auth.role,
    text: req.body.text,
  });

  res.status(201).json(msg);
});

module.exports = { listMessages, sendMessage, ensureChatAllowed };
