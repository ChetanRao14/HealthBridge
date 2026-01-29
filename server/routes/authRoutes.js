const router = require('express').Router();
const { body } = require('express-validator');

const {
  registerPatient,
  loginPatient,
  registerDoctor,
  loginDoctor,
  loginAdmin,
  refresh,
  logout,
} = require('../controllers/authController');
const { validate } = require('../middlewares/validate');

router.post(
  '/patient/register',
  [
    body('name').isString().isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('title').optional().isString(),
    body('phone').optional().isString(),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
    body('dob').optional({ nullable: true }).isString(),
    body('age').optional().isInt({ min: 0, max: 130 }),
    body('locationCountry').optional().isString(),
    body('locationState').optional().isString(),
    body('locationCity').optional().isString(),
  ],
  validate,
  registerPatient
);

router.post(
  '/patient/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').isString().notEmpty().withMessage('Password is required')],
  validate,
  loginPatient
);

router.post(
  '/doctor/register',
  [
    body('name').isString().isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('specialization').isString().notEmpty().withMessage('Specialization is required'),
    body('title').optional().isString(),
    body('phone').optional().isString(),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
    body('dob').optional({ nullable: true }).isString(),
    body('age').optional().isInt({ min: 0, max: 130 }),
    body('experienceYears').optional().isInt({ min: 0, max: 80 }),
    body('consultationFees').optional().isInt({ min: 0 }),
    body('clinicCountry').optional().isString(),
    body('clinicState').optional().isString(),
    body('clinicCity').optional().isString(),
    body('clinicAddress').optional().isString(),
  ],
  validate,
  registerDoctor
);

router.post(
  '/doctor/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').isString().notEmpty().withMessage('Password is required')],
  validate,
  loginDoctor
);

router.post(
  '/admin/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').isString().notEmpty().withMessage('Password is required')],
  validate,
  loginAdmin
);

router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
