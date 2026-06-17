export class AppError extends Error {
  public readonly timestamp: Date;
  public readonly code?: string;
  
  constructor(message: string, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.code = code;
    // Restore prototype chain for ES5/TS compatibility when extending built-in Error
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Failed to connect to backend server. Please check if the server is running.') {
    super(message, 'NETWORK_ERROR');
  }
}

export class ApiError extends AppError {
  public readonly statusCode: number;
  
  constructor(message: string, statusCode: number, code?: string) {
    super(message, code || `API_ERROR_${statusCode}`);
    this.statusCode = statusCode;
  }
}

export class ApiValidationError extends AppError {
  public readonly errors?: Record<string, string[]>;
  
  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}
