import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from '../exceptions/api.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (exception instanceof ApiException) {
      response.status(status).json({
        success: false,
        data: null,
        errorCode: exception.getErrorCode(),
        errorMessage: exception.getResponse(),
        showType: exception.getShowType(),
      });
    } else {
      response.status(status).json({
        success: false,
        data: null,
        errorCode: status,
        errorMessage:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : 'An error occurred',
      });
    }
  }
}
