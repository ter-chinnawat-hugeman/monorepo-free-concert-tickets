import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as any;
        
        if (responseObj.issues && Array.isArray(responseObj.issues) && responseObj.issues.length > 0) {
          const errorMessages = responseObj.issues.map((issue: any) => {
            const path = issue.path && issue.path.length > 0 
              ? issue.path.join('.') 
              : 'field';
            const fieldName = path.charAt(0).toUpperCase() + path.slice(1);
            return `${fieldName}: ${issue.message}`;
          });
          message = errorMessages.join('. ');
          error = 'Validation Error';
          status = HttpStatus.BAD_REQUEST;
        } else if (status === HttpStatus.BAD_REQUEST && responseObj.message === 'Validation failed') {
          message = 'Please check your input. Username must be at least 3 characters and password must be at least 6 characters.';
          error = 'Validation Error';
        } else {
          message = responseObj.message || message;
          error = responseObj.error || error;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name || 'Error';

      if (message.includes('not found')) {
        status = HttpStatus.NOT_FOUND;
      } else if (message.includes('already') || message.includes('duplicate')) {
        status = HttpStatus.CONFLICT;
      } else if (message.includes('required') || message.includes('invalid')) {
        status = HttpStatus.BAD_REQUEST;
      }
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
