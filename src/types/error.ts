export class AppError extends Error {
  public code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
