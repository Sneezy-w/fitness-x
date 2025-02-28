import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { auth } from './services/auth';

// Error handling solution: Error types
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// Response data format agreed with the backend
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

async function calculateSha256(data: any): Promise<string> {
  const msgUint8 = new TextEncoder().encode(JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * @name Error handling
 * Pro's built-in error handling, you can make your own changes here
 * @doc https://umijs.org/docs/max/request#configuration
 */
export const errorConfig: RequestConfig = {
  // Error handling: umi@3's error handling solution.
  errorConfig: {
    // Error throwing
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // Throw custom error
      }
    },
    // Error receiving and handling
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // Errors thrown by our errorThrower.
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage || 'Request error');
          }
        }
      } else if (error.response) {
        // Axios's error
        // The request was successful and the server also responded with a status code, but the status code is out of the 2xx range
        //message.error(`Response status:${error.response.status}`);
        //console.log(error.response);
        if (error.response.status === 401 && !opts?.skipLogout) {
          // message.error("Login expired, please login again.");
          // clearSessionToken();
          // history.push(loginPath);
          //handleLoginExpired();
          auth.logout();
          return;
        }
        const errorInfo: ResponseStructure | undefined = error.response.data;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          //console.log("errorInfo", errorInfo);
          //console.log("error", error);
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(
                errorMessage ||
                  error.message ||
                  error.msg ||
                  error.response?.message ||
                  error.response?.msg ||
                  'Request error, please retry.',
              );
          }
        }
      } else if (error.request) {
        // The request has been successfully initiated, but no response has been received
        // `error.request` is an instance of XMLHttpRequest in the browser,
        // and an instance of http.ClientRequest in node.js
        message.error('None response! Please retry.');
      } else {
        if (error.name === 'ReturnToLoginError') {
          auth.logout();
        } else {
          // Something went wrong when sending the request
          message.error('Request error, please retry.');
        }
      }
    },
  },

  // Request interceptor
  requestInterceptors: [
    async (config: RequestOptions) => {
      //console.log("requestInterceptor", config);
      // Intercept request configuration for personalized processing.
      //const url = config?.url?.concat('?token = 123');
      if (
        config.method?.toLowerCase() === 'put' ||
        config.method?.toLowerCase() === 'post'
      ) {
        const contentSha256 = await calculateSha256(config.data);
        config.headers = {
          ...config.headers,
          'x-amz-content-sha256': contentSha256,
        };
      }

      // Intercept request configuration for personalized processing.
      //const headers = config.headers;
      //const isToken = headers?.['isToken'];
      //if (isToken !== false) {
      const token = auth.getAccessToken();
      if (token) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      } else {
        const needLoginError = new Error('Please login.');

        needLoginError.name = 'ReturnToLoginError';

        throw needLoginError;
      }
      //}

      // const url = config?.url?.concat('?token = 123');
      return { ...config };
    },
  ],

  // Response interceptor
  responseInterceptors: [
    (response) => {
      // Intercept response data for personalized processing
      // const { data } = response as unknown as ResponseStructure;

      // if (data?.success === false) {
      //   message.error('Request failed!');
      // }
      return response;
    },
  ],
};
