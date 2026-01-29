const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    senderModel: { type: String, enum: ['Patient', 'Doctor'], required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
    senderRole: { type: String, enum: ['patient', 'doctor'], required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

messageSchema.index({ appointment: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
