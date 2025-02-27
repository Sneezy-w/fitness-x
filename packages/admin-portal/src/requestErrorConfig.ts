import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { auth } from './services/auth';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
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
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
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
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
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
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        if (error.name === 'ReturnToLoginError') {
          auth.logout();
        } else {
          // 发送请求时出了点问题
          message.error('Request error, please retry.');
        }
      }
    },
  },

  // 请求拦截器
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

      // 拦截请求配置，进行个性化处理。
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

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      // const { data } = response as unknown as ResponseStructure;

      // if (data?.success === false) {
      //   message.error('请求失败！');
      // }
      return response;
    },
  ],
};
