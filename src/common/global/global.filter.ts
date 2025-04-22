import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from 'src/common/services/logger.service';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    
    // Get the actual message from the exception response (if any)
    const exceptionResponse = exception.getResponse();
    const message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : (exceptionResponse as any).message || 'Something went wrong. Please try again later.';

    // Log the error message for internal tracking
    this.logger.error(`Exception: ${message}`, exception.stack);

    // Return the error response to the client with the proper status code and message
    response.status(status).json({
      success: false,
      statusCode: status,
      message: message,
    });
  }
}
