/**
 * Centralized HTTP Status Codes
 * All HTTP status codes used across the application are defined here.
 * Never hardcode numeric status codes elsewhere — always import from this file.
 */
export const HttpStatus = {
  // 2xx — Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // 3xx — Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,

  // 4xx — Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx — Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];
