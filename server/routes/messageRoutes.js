const router = require('express').Router({ mergeParams: true });
const { body } = require('express-validator');

const { listMessages, sendMessage } = require('../controllers/messageController');
const { authenticate } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');
const { validate } = require('../middlewares/validate');

router.get('/', authenticate, requireRole('patient', 'doctor'), listMessages);

router.post(
  '/',
  authenticate,
  requireRole('patient', 'doctor'),
  [body('text').isString().isLength({ min: 1, max: 2000 }).withMessage('text is required')],
  validate,
  sendMessage
);

module.exports = router;
