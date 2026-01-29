const router = require('express').Router({ mergeParams: true });

const { uploadPrescription, getPrescription } = require('../controllers/prescriptionController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { requireApprovedDoctor } = require('../middlewares/requireApprovedDoctor');
const { upload } = require('../middlewares/upload');

router.get('/', authenticate, requireRole('patient', 'doctor'), getPrescription);

router.post(
  '/',
  authenticate,
  requireRole('doctor'),
  requireApprovedDoctor,
  upload.single('file'),
  uploadPrescription
);

module.exports = router;
