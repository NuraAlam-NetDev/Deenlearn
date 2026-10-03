import crypto from 'crypto';
import cloudinary, { cloudinaryConfigured } from '../config/cloudinary.js';
import { detectFileType } from '../utils/fileType.js';
import { httpError } from '../utils/httpError.js';

const RESOURCE_TYPE = { image: 'image', pdf: 'raw', audio: 'video' }; // Cloudinary treats audio as "video"
const KIND_LABEL = {
  image: 'images (JPG, PNG, WEBP, GIF)',
  pdf: 'PDF files',
  audio: 'audio (MP3, WAV, OGG, M4A)',
};

// multer decodes file names as latin1, which garbles Bengali/Arabic names. Repair if needed.
function fixFileName(name = 'file') {
  let fixed = name;
  if (!/[^\x00-\xff]/.test(name)) {
    const decoded = Buffer.from(name, 'latin1').toString('utf8');
    if (!decoded.includes('\uFFFD')) fixed = decoded;
  }
  return fixed.replace(/[\\/\r\n]/g, '_').slice(0, 200) || 'file';
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
  });
}

// Validates the real file type, uploads to Cloudinary, returns attachment-shaped metadata.
// allow: e.g. ['image'] or ['image', 'pdf', 'audio']
export async function uploadFile(file, { folder, allow = ['image', 'pdf', 'audio'] }) {
  if (!file) {
    throw httpError(400, 'No file uploaded. Send it as multipart/form-data in the field "file".');
  }

  const detected = detectFileType(file.buffer);
  if (!detected || !allow.includes(detected.kind)) {
    throw httpError(415, `Unsupported file type. Allowed: ${allow.map((k) => KIND_LABEL[k]).join(', ')}.`);
  }

  const resourceType = RESOURCE_TYPE[detected.kind];
  // Raw files (PDF) keep their extension inside the public_id so the URL ends in .pdf
  const publicId = crypto.randomUUID() + (detected.kind === 'pdf' ? '.pdf' : '');

  let result;
  try {
    result = await uploadBuffer(file.buffer, {
      folder,
      public_id: publicId,
      resource_type: resourceType,
      overwrite: false,
    });
  } catch (err) {
    console.error('Cloudinary upload failed:', err?.message || err);
    throw httpError(502, 'File storage error, please try again.');
  }

  return {
    name: fixFileName(file.originalname),
    url: result.secure_url,
    type: detected.mime,
    size: file.size,
    kind: detected.kind,
    publicId: result.public_id,
    resourceType,
  };
}

// Best-effort cleanup: never throws (a failed delete must not break the request)
export async function deleteAssets(items = []) {
  if (!cloudinaryConfigured) return;
  const list = items.filter((i) => i?.publicId);
  const results = await Promise.allSettled(
    list.map((i) =>
      cloudinary.uploader.destroy(i.publicId, { resource_type: i.resourceType || 'image', invalidate: true })
    )
  );
  results.forEach((r) => {
    if (r.status === 'rejected') console.error('Cloudinary delete failed:', r.reason?.message || r.reason);
  });
}
