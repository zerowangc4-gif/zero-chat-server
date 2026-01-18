export class AppError extends Error {
  public code: number;
  public readonly isOperational: boolean;
  constructor(code: number, message: string, isOperational = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
