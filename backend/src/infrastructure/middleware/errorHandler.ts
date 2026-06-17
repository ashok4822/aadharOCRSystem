import { Request, Response, NextFunction } from 'express';
import { MAX_FILE_SIZE_MB } from './upload';
import { config } from '../../config/config';
import { HttpStatus } from '../../config/httpStatus';
import { ServerMessages } from '../../config/messages';

// Type-safe helpers for accessing common error properties on `unknown` values
const getErrorProp = <T>(err: unknown, prop: string): T | undefined => {
  if (err !== null && typeof err === 'object' && prop in err) {
    return (err as Record<string, unknown>)[prop] as T;
  }
  return undefined;
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode =
    getErrorProp<number>(err, 'statusCode') ??
    getErrorProp<number>(err, 'status') ??
    HttpStatus.INTERNAL_SERVER_ERROR;
  let message =
    getErrorProp<string>(err, 'message') ?? ServerMessages.ERROR.INTERNAL_SERVER_ERROR;

  // Handle specific well-known errors (e.g., Multer limits or type errors)
  const errName = getErrorProp<string>(err, 'name');
  const errCode = getErrorProp<string>(err, 'code');
  if (errName === 'MulterError') {
    statusCode = HttpStatus.BAD_REQUEST;
    if (errCode === 'LIMIT_FILE_SIZE') {
      message = ServerMessages.ERROR.FILE_SIZE_LIMIT_EXCEEDED(MAX_FILE_SIZE_MB);
    }
  } else if (message === ServerMessages.ERROR.ONLY_IMAGES_ALLOWED) {
    statusCode = HttpStatus.BAD_REQUEST;
  }

  console.error(`[Error] ${req.method} ${req.url} - Status: ${statusCode} - Message: ${message}`);
  if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
    console.error(getErrorProp<string>(err, 'stack') ?? err);
  }

  res.status(statusCode).json({
    status: false,
    message,
    // Stack trace / error details only exposed in non-production environments
    error: config.isProduction ? undefined : message,
  });
};

