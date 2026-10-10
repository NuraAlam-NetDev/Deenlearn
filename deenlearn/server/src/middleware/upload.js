import multer from 'multer';
import { cloudinaryConfigured } from '../config/cloudinary.js';
import { httpError } from '../utils/httpError.js';

export const MAX_FILE_MB = Number(process.env.MAX_FILE_MB || 10);

// Files are kept in memory only long enough to stream them to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: 1, fields: 5 },
});

export const uploadSingle = upload.single('file');

export function requireUploads(_req, _res, next) {
  if (!cloudinaryConfigured) {
    return next(httpError(503, 'File uploads are not configured on the server'));
  }
  next();
}
