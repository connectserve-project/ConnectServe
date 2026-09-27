const express = require('express');
const { body } = require('express-validator');
const {
  register,
  verifyRegistration,
  resendVerificationCode,
  login,
  getMe,
  refreshToken,
  updatePassword,
  updateEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { uploadDocument } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post(
  '/register',
  // Parses multipart/form-data when an org uploads a verification certificate;
  // has no effect on plain JSON registrations (e.g. volunteers).
  uploadDocument.single('certificate'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'organization']).withMessage('Role must be user or organization'),
    validate,
  ],
  register
);

router.post(
  '/verify-registration',
  [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('code').trim().isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
    validate,
  ],
  verifyRegistration
);

router.post(
  '/resend-verification',
  [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    validate,
  ],
  resendVerificationCode
);

router.post(
  '/login',
  [
    body('password').notEmpty().withMessage('Password is required'),
    body().custom((value) => {
      const input = value.identifier || value.email || '';
      if (!input.trim()) throw new Error('Email or mobile number is required');
      return true;
    }),
    validate,
  ],
  login
);

router.get('/me', protect, getMe);
router.post('/refresh-token', refreshToken);
router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate,
  ],
  updatePassword
);

router.put(
  '/email',
  protect,
  [
    body('newEmail').isEmail().withMessage('Please enter a valid email address'),
    body('password').notEmpty().withMessage('Current password is required'),
    validate,
  ],
  updateEmail
);


router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    validate,
  ],
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('resetCode').trim().isLength({ min: 6, max: 6 }).withMessage('Reset code must be 6 digits'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate,
  ],
  resetPassword
);

module.exports = router;
