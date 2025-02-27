import { ErrorShowType } from '../enums/error-show-type.enum';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}
