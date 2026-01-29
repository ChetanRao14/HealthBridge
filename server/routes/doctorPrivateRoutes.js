const router = require('express').Router();

const { body } = require('express-validator');

const { getMe, updateMe, uploadDocuments, changePassword } = require('../controllers/doctorController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { upload } = require('../middlewares/upload');
const { validate } = require('../middlewares/validate');

router.get('/me', authenticate, requireRole('doctor'), getMe);
router.put('/me', authenticate, requireRole('doctor'), updateMe);

router.post(
  '/me/password',
  authenticate,
  requireRole('doctor'),
  [
    body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
    body('newPassword').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  changePassword
);

router.post(
  '/documents',
  authenticate,
  requireRole('doctor'),
  upload.fields([
    { name: 'medicalLicense', maxCount: 1 },
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
  ]),
  uploadDocuments
);

module.exports = router;
