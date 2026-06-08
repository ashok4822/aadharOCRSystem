import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { MAX_FILE_SIZE_MB } from './upload';
import { config } from '../../config/config';
import { HttpStatus } from '../../config/httpStatus';
import { ServerMessages } from '../../config/messages';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || ServerMessages.ERROR.INTERNAL_SERVER_ERROR;

  // Handle specific well-known errors (e.g., Multer limits or type errors)
  if (err.name === 'MulterError') {
    statusCode = HttpStatus.BAD_REQUEST;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = ServerMessages.ERROR.FILE_SIZE_LIMIT_EXCEEDED(MAX_FILE_SIZE_MB);
    }
  } else if (message === ServerMessages.ERROR.ONLY_IMAGES_ALLOWED) {
    statusCode = HttpStatus.BAD_REQUEST;
  }

  console.error(`[Error] ${req.method} ${req.url} - Status: ${statusCode} - Message: ${message}`);
  if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
    console.error(err.stack || err);
  }

  res.status(statusCode).json({
    status: false,
    message,
    // Stack trace / error details only exposed in non-production environments
    error: config.isProduction ? undefined : message,
  });
};

