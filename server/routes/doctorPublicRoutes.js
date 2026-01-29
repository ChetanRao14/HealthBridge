const router = require('express').Router();

const { listDoctors, getDoctorSlots, getDoctorReviews } = require('../controllers/doctorController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');

router.get('/', listDoctors);

router.get('/:doctorId/slots', getDoctorSlots);

router.get('/:doctorId/reviews', authenticate, requireRole('patient'), getDoctorReviews);

module.exports = router;
