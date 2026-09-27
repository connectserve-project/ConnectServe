const { Certificate, Event, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const findCertificateByIdOrMongoId = async (id, options = {}) => {
  if (typeof id === 'number' || !isNaN(Number(id))) {
    const cert = await Certificate.findByPk(id, options);
    if (cert) return cert;
  }
  return await Certificate.findOne({ where: { mongoId: String(id) }, ...options });
};

// @desc    Get all certificates earned by logged in user
// @route   GET /api/certificates/my
// @access  Private
const getMyCertificates = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const certificates = await Certificate.findAll({
      where: { userId },
      order: [['issueDate', 'DESC']],
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location', 'category', 'banner'] },
        { model: User, as: 'organization', attributes: ['id', 'name', 'username', 'avatar', 'orgDetails'] },
      ],
    });

    return sendSuccess(res, 'My certificates fetched.', { certificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify certificate by unique certificateCode
// @route   GET /api/certificates/verify/:code
// @access  Public
const verifyCertificate = async (req, res, next) => {
  try {
    const { code } = req.params;
    const certificate = await Certificate.findOne({
      where: {
        certificateCode: code.toUpperCase().trim(),
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'username', 'avatar'] },
        { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location', 'category'] },
        { model: User, as: 'organization', attributes: ['id', 'name', 'username', 'avatar', 'orgDetails'] },
      ],
    });

    if (!certificate) {
      return sendError(res, 'Certificate not found or invalid certificate code.', 404);
    }

    return sendSuccess(res, 'Certificate verified successfully.', { certificate });
  } catch (error) {
    next(error);
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private (Owner or Admin)
const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await findCertificateByIdOrMongoId(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'username', 'avatar'] },
        { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location', 'category'] },
        { model: User, as: 'organization', attributes: ['id', 'name', 'username', 'avatar', 'orgDetails'] },
      ],
    });

    if (!certificate) {
      return sendError(res, 'Certificate not found.', 404);
    }

    const currentUserId = req.user ? (req.user.id || req.user._id) : null;
    const currentUserRole = req.user ? req.user.role : null;

    if (String(certificate.userId) !== String(currentUserId) && currentUserRole !== 'admin') {
      return sendError(res, 'Access denied. Certificates are visible only to the owner.', 403);
    }

    return sendSuccess(res, 'Certificate loaded.', { certificate });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCertificates,
  verifyCertificate,
  getCertificateById,
};
