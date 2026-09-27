const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key'
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[Cloudinary] Cloudinary SDK initialized successfully.');
} else {
  console.warn('[Cloudinary] Cloudinary credentials not detected or using placeholders. Using mock/inline fallback for uploads.');
}

/**
 * Uploads a file buffer directly to Cloudinary via upload_stream
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Target folder (e.g. 'connectserve/profiles', 'connectserve/posts', 'connectserve/events', 'connectserve/certificates')
 * @param {object} customOptions - Extra transformation/upload options
 * @returns {Promise<{ url: string, public_id: string, secure_url: string }>}
 */
const uploadToCloudinary = (buffer, folder = 'connectserve/general', customOptions = {}) => {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error('No file buffer provided for upload.'));
    }

    if (!isCloudinaryConfigured()) {
      // Offline fallback: create an optimized base64 data URI and simulated public_id
      const mimeType = customOptions.mimetype || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64Data}`;
      const mockPublicId = `${folder}/local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return resolve({
        url: dataUri,
        secure_url: dataUri,
        public_id: mockPublicId,
        format: mimeType.split('/')[1] || 'jpg',
        bytes: buffer.length,
      });
    }

    const defaultTransformations = [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 'auto', crop: 'limit' }
    ];

    const uploadOptions = {
      folder,
      resource_type: 'auto',
      transformation: customOptions.transformation || defaultTransformations,
      ...customOptions,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error('[Cloudinary Upload Error]', error);
        return reject(error);
      }
      resolve({
        url: result.url,
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      });
    });

    // Write buffer into stream
    const { Readable } = require('stream');
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(stream);
  });
};

/**
 * Deletes an asset from Cloudinary using its public_id
 * @param {string} public_id
 * @returns {Promise<object>}
 */
const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return null;
  if (public_id.startsWith('http') || public_id.includes('local_') || !isCloudinaryConfigured()) {
    return { result: 'ok (local/mock bypass)' };
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error(`[Cloudinary Delete Error] Failed to delete asset ${public_id}:`, error.message);
    return null;
  }
};

/**
 * Returns optimized responsive URL with transformations
 * @param {string} public_id
 * @param {object} options
 */
const getTransformedUrl = (public_id, options = {}) => {
  if (!isCloudinaryConfigured() || !public_id || public_id.includes('local_')) {
    return public_id;
  }
  return cloudinary.url(public_id, {
    fetch_format: 'auto',
    quality: 'auto',
    crop: 'fill',
    ...options,
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getTransformedUrl,
  isCloudinaryConfigured,
};
