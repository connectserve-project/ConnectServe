const express = require('express');
const { body } = require('express-validator');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addEventReview,
  getPublicStats,
} = require('../controllers/eventController');
const {
  registerForEvent,
  getEventApplicants,
  scanAttendance,
} = require('../controllers/registrationController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getEvents);
router.get('/stats', getPublicStats);
router.get('/:id', optionalAuth, getEventById);


router.post(
  '/',
  protect,
  authorize('organization', 'admin'),
  upload.single('banner'),
  [
    body('title').trim().notEmpty().withMessage('Event title is required'),
    body('description').trim().notEmpty().withMessage('Event description is required'),
    body('date').notEmpty().withMessage('Event date is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    validate,
  ],
  createEvent
);

router.put('/:id', protect, authorize('organization', 'admin'), upload.single('banner'), updateEvent);
router.delete('/:id', protect, authorize('organization', 'admin'), deleteEvent);

// Volunteer Application & Applicants
router.post('/:id/register', protect, registerForEvent);
router.get('/:id/applicants', protect, authorize('organization', 'admin'), getEventApplicants);
router.post('/:eventId/attendance/scan', protect, authorize('organization', 'admin'), scanAttendance);

// Post-event reviews
router.post(
  '/:id/reviews',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Review comment is required'),
    validate,
  ],
  addEventReview
);

module.exports = router;
