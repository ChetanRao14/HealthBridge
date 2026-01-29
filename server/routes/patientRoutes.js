const router = require('express').Router();
const { body } = require('express-validator');

const { getMe, updateMe, changePassword } = require('../controllers/patientController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { validate } = require('../middlewares/validate');

router.get('/me', authenticate, requireRole('patient'), getMe);

router.put(
  '/me',
  authenticate,
  requireRole('patient'),
  [
    body('title').optional().isString().isLength({ max: 12 }).withMessage('Title must be valid'),
    body('name').optional().isString().isLength({ min: 2 }).withMessage('Name must be valid'),
    body('age').optional().isInt({ min: 0, max: 130 }).withMessage('Age must be valid'),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Gender must be valid'),
    body('dob').optional({ nullable: true }).isISO8601().withMessage('DOB must be valid'),
    body('phone').optional().isString().withMessage('Phone must be valid'),
    body('location').optional().isString().isLength({ max: 80 }).withMessage('Location must be valid'),
    body('locationState').optional().isString().isLength({ max: 80 }).withMessage('State must be valid'),
    body('locationCity').optional().isString().isLength({ max: 80 }).withMessage('City must be valid'),
  ],
  validate,
  updateMe
);

router.post(
  '/me/password',
  authenticate,
  requireRole('patient'),
  [
    body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
    body('newPassword').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  changePassword
);

module.exports = router;
