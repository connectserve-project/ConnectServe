import { chatService } from '../services/chatService';

const MB = 1024 * 1024;

export const ATTACHMENT_LIMITS = {
  image: 50 * MB,
  video: 100 * MB,
  document: 500 * MB,
};

export const ATTACHMENT_LABELS = { image: 'Photo', video: 'Video', document: 'Document' };

export const formatFileSize = (bytes = 0) => {
  if (bytes >= 1024 * MB) return `${(bytes / (1024 * MB)).toFixed(1)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

// Returns an error message, or null when the file is OK
export const validateAttachment = (file, type) => {
  if (!file) return 'No file selected.';
  if (type === 'image' && !file.type.startsWith('image/')) return 'Please choose an image file.';
  if (type === 'video' && !file.type.startsWith('video/')) return 'Please choose a video file.';
  if (file.size > ATTACHMENT_LIMITS[type]) {
    return `${ATTACHMENT_LABELS[type]} must be smaller than ${ATTACHMENT_LIMITS[type] / MB} MB.`;
  }
  return null;
};

const CHUNK_SIZE = 20 * MB; // files above this are sent in chunks (Cloudinary needs chunking above 100 MB)

const postToCloudinary = (url, formData, headers, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded);
    };
    xhr.onload = () => {
      let body = {};
      try { body = JSON.parse(xhr.responseText); } catch (_) { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new Error(body?.error?.message || 'Upload failed.'));
    };
    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.send(formData);
  });

/**
 * Uploads a chat attachment straight to Cloudinary (never through our server).
 * @param {File} file
 * @param {'image'|'video'|'document'} type
 * @param {(percent:number)=>void} onProgress
 * @returns {Promise<{url, public_id, type, name, size}>}
 */
export const uploadChatFile = async (file, type, onProgress = () => {}) => {
  const sigRes = await chatService.getUploadSignature(type, file.size);
  const { signature, timestamp, folder, apiKey, cloudName, resourceType } = sigRes.data;
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const buildForm = (blob) => {
    const fd = new FormData();
    fd.append('file', blob, file.name);
    fd.append('api_key', apiKey);
    fd.append('timestamp', timestamp);
    fd.append('signature', signature);
    fd.append('folder', folder);
    return fd;
  };

  let result;
  if (file.size <= CHUNK_SIZE) {
    result = await postToCloudinary(endpoint, buildForm(file), {}, (loaded) =>
      onProgress(Math.min(99, Math.round((loaded / file.size) * 100)))
    );
  } else {
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    let start = 0;
    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const base = start;
      result = await postToCloudinary(
        endpoint,
        buildForm(chunk),
        {
          'X-Unique-Upload-Id': uploadId,
          'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
        },
        (loaded) => onProgress(Math.min(99, Math.round(((base + loaded) / file.size) * 100)))
      );
      start = end;
    }
  }

  onProgress(100);
  return {
    url: result.secure_url,
    public_id: result.public_id,
    type,
    name: file.name,
    size: file.size,
  };
};
