const multer = require('multer');

// Memory storage keeps file buffers in memory for direct Cloudinary streaming
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, and GIF images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
  fileFilter,
});

// Separate instance for verification documents (NGO registration certificates etc.)
// Accepts images as well as PDF files.
const documentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, and PDF files are allowed.'), false);
  }
};

const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
  fileFilter: documentFileFilter,
});

// ---------------------------------------------------------------------------
// Media upload (posts + events): images AND videos (MP4, MOV, MKV, WEBM)
// ---------------------------------------------------------------------------
const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIMES = [
  'video/mp4',
  'video/quicktime',     // .mov
  'video/x-matroska',    // .mkv
  'video/webm',          // .webm
  'video/x-m4v',
];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.webm'];

const mediaFileFilter = (req, file, cb) => {
  const name = (file.originalname || '').toLowerCase();
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  const isImage = IMAGE_MIMES.includes(file.mimetype);
  // Some browsers send MKV/MOV as application/octet-stream or an empty type,
  // so the extension is accepted as a fallback.
  const isVideo =
    VIDEO_MIMES.includes(file.mimetype) ||
    (['application/octet-stream', ''].includes(file.mimetype) && VIDEO_EXTENSIONS.includes(ext));

  if (isImage || isVideo) {
    if (isVideo && !file.mimetype.startsWith('video/')) {
      // Normalise the mimetype so downstream code can detect videos reliably
      file.mimetype = ext === '.mov' ? 'video/quicktime' : ext === '.mkv' ? 'video/x-matroska' : ext === '.webm' ? 'video/webm' : 'video/mp4';
    }
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Allowed: JPEG, PNG, WEBP, GIF images and MP4, MOV, MKV, WEBM videos.'), false);
  }
};

const MAX_MEDIA_SIZE = 50 * 1024 * 1024; // 50 MB (images and videos)

const uploadMedia = multer({
  storage,
  limits: { fileSize: MAX_MEDIA_SIZE },
  fileFilter: mediaFileFilter,
});

module.exports = upload;
module.exports.uploadMedia = uploadMedia;
module.exports.MAX_MEDIA_SIZE = MAX_MEDIA_SIZE;
module.exports.uploadDocument = uploadDocument;
