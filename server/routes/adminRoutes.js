const router = require('express').Router();
const { body } = require('express-validator');

const {
  getMe,
  updateMe,
  changePassword,
  listDoctors,
  getDoctorById,
  listDoctorPrescriptions,
  approveDoctor,
  rejectDoctor,
  blockDoctor,
  blockPatient,
  listPatients,
  getPatientById,
  listAppointments,
  analytics,
} = require('../controllers/adminController');

const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { validate } = require('../middlewares/validate');

router.use(authenticate, requireRole('admin'));

router.get('/me', getMe);
router.put('/me', [body('email').isEmail().withMessage('Valid email is required')], validate, updateMe);

router.post(
  '/me/password',
  [
    body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
    body('newPassword').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  changePassword
);

router.get('/analytics', analytics);

router.get('/doctors', listDoctors);
router.get('/doctors/:id', getDoctorById);
router.get('/doctors/:id/prescriptions', listDoctorPrescriptions);
router.patch('/doctors/:id/approve', approveDoctor);
router.patch(
  '/doctors/:id/reject',
  [body('reason').optional().isString().isLength({ min: 2 }).withMessage('Reason must be valid')],
  validate,
  rejectDoctor
);
router.patch('/doctors/:id/block', blockDoctor);

router.get('/patients', listPatients);
router.get('/patients/:id', getPatientById);
router.patch('/patients/:id/block', blockPatient);

router.get('/appointments', listAppointments);

module.exports = router;
