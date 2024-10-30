import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Response } from 'express';

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();
    const { message, error } = (exceptionResponse as any) || {};

    if (Array.isArray(message)) {
      const formattedErrors = message.join(', ');

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
        message: formattedErrors,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
        message: error || exception.message || 'Unexpected error',
      });
    }
  }
}
