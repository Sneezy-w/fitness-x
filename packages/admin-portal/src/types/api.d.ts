declare namespace API {
  export interface R<T> {
    data: T;
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
  }
}
