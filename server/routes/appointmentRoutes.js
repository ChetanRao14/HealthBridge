const router = require('express').Router();
const { body } = require('express-validator');

const {
  createAppointment,
  myAppointments,
  doctorAppointments,
  respondToAppointment,
  cancelAppointment,
  markCompleted,
  submitReview,
} = require('../controllers/appointmentController');

const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { requireApprovedDoctor } = require('../middlewares/requireApprovedDoctor');
const { validate } = require('../middlewares/validate');

router.post(
  '/',
  authenticate,
  requireRole('patient'),
  [
    body('doctorId').isString().notEmpty().withMessage('doctorId is required'),
    body('date').isString().notEmpty().withMessage('date is required'),
    body('timeSlot').isString().notEmpty().withMessage('timeSlot is required'),
  ],
  validate,
  createAppointment
);

router.get('/me', authenticate, requireRole('patient'), myAppointments);
router.get('/doctor', authenticate, requireRole('doctor'), requireApprovedDoctor, doctorAppointments);

router.patch(
  '/:id/respond',
  authenticate,
  requireRole('doctor'),
  requireApprovedDoctor,
  [body('action').isIn(['accept', 'reject']).withMessage('action must be accept or reject')],
  validate,
  respondToAppointment
);

router.patch('/:id/complete', authenticate, requireRole('doctor'), requireApprovedDoctor, markCompleted);

router.patch(
  '/:id/review',
  authenticate,
  requireRole('patient'),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
    body('review').optional().isString().isLength({ max: 500 }).withMessage('review is too long'),
  ],
  validate,
  submitReview
);
router.patch('/:id/cancel', authenticate, requireRole('patient'), cancelAppointment);

module.exports = router;
