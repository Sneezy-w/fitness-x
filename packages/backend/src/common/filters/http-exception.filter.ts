import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { ErrorShowType } from '../enums/error-show-type.enum';
import { Response } from 'express';
import { ApiException } from '../exceptions/api.exception';
//import { ValidationError } from 'class-validator';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    console.error(exception);

    if (exception instanceof ApiException) {
      return response.status(status).json({
        success: false,
        data: null,
        errorCode: exception.getErrorCode(),
        errorMessage: exception.getResponse(),
        showType: exception.getShowType(),
      });
    }

    if (exception instanceof BadRequestException) {
      let errorMessages: string[] = [];
      const responseData = exception.getResponse();
      if (typeof responseData === 'string') {
        errorMessages = [responseData];
      } else {
        const { message } = responseData as { message?: string | string[] };
        if (Array.isArray(message)) {
          errorMessages = message.map((item) => item.toString());
        } else {
          errorMessages = [message?.toString() ?? 'An error occurred'];
        }
      }
      //const errorMessages = exception.getResponse()?.message as string[];
      return response.status(status).json({
        success: false,
        data: null,
        errorCode: 12000,
        errorMessage: errorMessages.join(', ') || 'An error occurred',
        showType: ErrorShowType.ERROR_MESSAGE,
      });
    }

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
