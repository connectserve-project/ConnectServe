const express = require('express');
const {
  getMyRegistrations,
  updateApplicationStatus,
  markAttendance,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/my', protect, getMyRegistrations);
router.put('/:id/status', protect, authorize('organization', 'admin'), updateApplicationStatus);
router.post('/:id/attendance', protect, authorize('organization', 'admin'), markAttendance);

module.exports = router;
