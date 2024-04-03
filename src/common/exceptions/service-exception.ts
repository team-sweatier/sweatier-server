import { ErrorCodes } from './error-codes';

export class ServiceException extends Error {
  private readonly statusCode: number;

  constructor(errorCode: ErrorCodes) {
    super(errorCode.message);
    this.statusCode = errorCode.statusCode;
  }

  getStatus() {
    return this.statusCode;
  }
}
