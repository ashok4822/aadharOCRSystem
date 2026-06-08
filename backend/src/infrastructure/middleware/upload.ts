import multer from 'multer';
import path from 'path';
import { config } from '../../config/config';
import { ServerMessages } from '../../config/messages';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedExtensions = /jpeg|jpg|png|webp/i;
  const mimetype = allowedExtensions.test(file.mimetype);
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error(ServerMessages.ERROR.ONLY_IMAGES_ALLOWED));
};

// Values sourced from central config (src/config/config.ts)
export const MAX_FILE_SIZE_BYTES = config.maxFileSizeBytes;
export const MAX_FILE_SIZE_MB = config.maxFileSizeMb;

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

