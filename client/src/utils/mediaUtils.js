export const MAX_MEDIA_SIZE_MB = 50;
export const MAX_MEDIA_SIZE = MAX_MEDIA_SIZE_MB * 1024 * 1024;

export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'mkv', 'webm'];

// Value for <input type="file" accept="...">
export const MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/x-matroska,video/webm,.mp4,.mov,.mkv,.webm';

const getExt = (file) => (file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '');

export const isVideoFile = (file) =>
  !!file && (file.type.startsWith('video/') || VIDEO_EXTENSIONS.includes(getExt(file)));

export const isImageFile = (file) =>
  !!file && file.type.startsWith('image/') && ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);

/** Returns an error message, or null when the file is acceptable. */
export const validateMediaFile = (file) => {
  if (!file) return 'No file selected.';
  if (!isImageFile(file) && !isVideoFile(file)) {
    return 'Unsupported file. Use JPG, PNG, WEBP, GIF images or MP4, MOV, MKV, WEBM videos.';
  }
  if (file.size > MAX_MEDIA_SIZE) {
    return `File is too large. Maximum size is ${MAX_MEDIA_SIZE_MB} MB.`;
  }
  return null;
};
