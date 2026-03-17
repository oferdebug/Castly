/**
 * Multer Upload Configuration — Podcast Service
 *
 * Defines file upload middleware for handling inbound audio files.
 *
 * Architecture Overview:
 * - Uses in-memory storage to buffer the file before streaming to S3
 * - Validates MIME type at upload time to reject non-audio files early
 * - File size is capped at 500MB to align with max episode duration limits
 *
 * Supported Formats:
 * - audio/mpeg (MP3)
 * - audio/wav (WAV)
 * - audio/mp4 / audio/x-m4a (M4A)
 *
 * Note:
 * - For large files, consider switching to disk storage + streaming to avoid
 *   memory pressure in production environments with concurrent uploads
 */


import multer from 'multer';

const ALLOWED_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3, WAV, and M4A are allowed.'));
    }
  },
});
