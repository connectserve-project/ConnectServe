const express = require('express');
const {
  getMyCertificates,
  verifyCertificate,
  getCertificateById,
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my', protect, getMyCertificates);
router.get('/verify/:code', verifyCertificate);
router.get('/:id', protect, getCertificateById);

module.exports = router;
