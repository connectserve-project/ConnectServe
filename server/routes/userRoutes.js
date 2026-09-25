const express = require('express');
const {
  getProfile,
  updateProfile,
  toggleFollowUser,
  getLeaderboard,
  searchUsers,
  deleteAccount,
  getMyQrCode,
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/me/qrcode', protect, getMyQrCode);
router.get('/leaderboard', getLeaderboard);
router.get('/search', searchUsers);
router.get('/:idOrUsername', optionalAuth, getProfile);

router.put(
  '/profile',
  protect,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'verificationDocument', maxCount: 1 },
  ]),
  updateProfile
);

router.delete('/profile', protect, deleteAccount);

router.post('/:id/follow', protect, toggleFollowUser);

module.exports = router;
