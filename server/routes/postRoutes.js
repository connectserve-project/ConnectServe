const express = require('express');
const {
  createPost,
  getFeed,
  getExplorePosts,
  getPostById,
  toggleLikePost,
  addComment,
  deleteComment,
  deletePost,
  sharePost,
  reportPost,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', optionalAuth, getFeed);
router.get('/feed', optionalAuth, getFeed);
router.get('/explore', optionalAuth, getExplorePosts);
router.get('/:id', optionalAuth, getPostById);

router.post('/', protect, upload.single('media'), createPost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, toggleLikePost);
router.post('/:id/comments', protect, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);
router.post('/:id/share', protect, sharePost);
router.post('/:id/report', protect, reportPost);

module.exports = router;
