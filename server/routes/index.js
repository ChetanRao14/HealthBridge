const router = require('express').Router();

const authRoutes = require('./authRoutes');
const patientRoutes = require('./patientRoutes');
const doctorPublicRoutes = require('./doctorPublicRoutes');
const doctorPrivateRoutes = require('./doctorPrivateRoutes');
const adminRoutes = require('./adminRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const messageRoutes = require('./messageRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');

router.get('/', (req, res) => {
  res.json({ ok: true });
});

router.use('/auth', authRoutes);

router.use('/patients', patientRoutes);

router.use('/doctors', doctorPublicRoutes);
router.use('/doctor', doctorPrivateRoutes);

router.use('/admin', adminRoutes);

router.use('/appointments', appointmentRoutes);
router.use('/appointments/:appointmentId/messages', messageRoutes);
router.use('/appointments/:appointmentId/prescription', prescriptionRoutes);

module.exports = router;
