const { Doctor } = require('../models/Doctor');

async function requireApprovedDoctor(req, res, next) {
  const doctorId = req.auth && req.auth.role === 'doctor' ? req.auth.id : null;

  if (!doctorId) {
    res.status(403);
    return next(new Error('Forbidden'));
  }

  const doctor = await Doctor.findById(doctorId).select('status');
  if (!doctor) {
    res.status(401);
    return next(new Error('Doctor not found'));
  }

  if (doctor.status !== 'approved') {
    res.status(403);
    return next(new Error('Doctor is not approved'));
  }

  return next();
}

module.exports = { requireApprovedDoctor };
