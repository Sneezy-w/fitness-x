import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorShowType } from '../enums/error-show-type.enum';

export interface ApiErrorResponse {
  success: boolean;
  data: null;
  errorCode: string | number;
  errorMessage: string;
  showType: ErrorShowType;
  [key: string]: any;
}

export class ApiException extends HttpException {
  private readonly errorCode: number;
  //private readonly errorMessage: string;
  private readonly errorShowType: ErrorShowType;

  constructor(
    message: string,
    errorCode: number = 10000,
    showType: ErrorShowType = ErrorShowType.ERROR_MESSAGE,
  ) {
    super(message, HttpStatus.OK);

    this.errorCode = errorCode;
    //this.errorMessage = message;
    this.errorShowType = showType;
  }

  getErrorCode(): number {
    return this.errorCode;
  }

  getShowType(): ErrorShowType {
    return this.errorShowType;
  }

  // getErrorMessage(): string {
  //   return this.errorMessage;
  // }
}
