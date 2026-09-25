/**
 * Deep recursive normalizer to ensure both `id` and `_id` are populated
 * on all models and nested object associations for 100% frontend contract compatibility.
 */
const normalizeIds = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(normalizeIds);
  }

  if (typeof obj === 'object') {
    // If it's a Buffer, Date, or non-plain object (except standard Object), return as is
    if (obj instanceof Date || Buffer.isBuffer(obj)) {
      return obj;
    }

    // Convert Sequelize instance to plain object if needed
    let item = typeof obj.toJSON === 'function' ? obj.toJSON() : { ...obj };

    // Set _id and id aliases
    const targetId = item._id !== undefined ? item._id : item.id;
    if (targetId !== undefined) {
      item._id = targetId;
      item.id = targetId;
    }

    const normalized = {};
    for (const key of Object.keys(item)) {
      normalized[key] = normalizeIds(item[key]);
    }
    return normalized;
  }

  return obj;
};

/**
 * Standard JSON response helper
 */
const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const normalizedData = data !== null ? normalizeIds(data) : null;
  const response = {
    success,
    message,
    ...(normalizedData !== null && { data: normalizedData }),
    ...(meta !== null && { meta }),
  };
  return res.status(statusCode).json(response);
};

const sendSuccess = (res, message = 'Success', data = null, meta = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data, meta);
};

const sendError = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

module.exports = {
  normalizeIds,
  sendResponse,
  sendSuccess,
  sendError,
};
