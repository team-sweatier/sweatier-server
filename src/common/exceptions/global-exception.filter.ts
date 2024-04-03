import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { TExceptionResponse, TResponse } from '../types/response.type';
import { ServiceException } from './service-exception';

@Catch(HttpException, ServiceException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | ServiceException, host: ArgumentsHost) {
    const errorResponse: TResponse<null> = {
      success: false,
      result: null,
      message: this.getMessage(exception),
    };

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    response.status(statusCode).json(errorResponse);
  }

  private getMessage(exception: HttpException | ServiceException) {
    if (exception instanceof ServiceException) return exception.message;

    const exceptionResponse = exception.getResponse() as TExceptionResponse;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message;

    return message;
  }
}
