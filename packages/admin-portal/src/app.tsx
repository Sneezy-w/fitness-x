// Runtime configuration

import {
  AvatarDropdown,
  AvatarName,
} from '@/components/RightContent/AvatarDropdown';
import { auth } from '@/services/auth';
import { ProSettings } from '@ant-design/pro-components';
import { history, RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { Auth0UserProfile } from 'auth0-js';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
// Global initialization data configuration, used for Layout user information and permission initialization
// More information in the documentation: https://umijs.org/docs/api/runtime-config#getinitialstate

const loginPath = '/login';
const callbackPath = '/callback';

export async function getInitialState(): Promise<{
  name: string;
  settings: Partial<ProSettings>;
  currentUser: Auth0UserProfile | null;
}> {
  let currentUser: Auth0UserProfile | null = null;
  try {
    currentUser = await auth.getCurrentUser();
  } catch (error) {
    console.error(error);
  }

  // webAuth.client.userInfo(auth.getAccessToken(), (err, user) => {
  //   if (err) {
  //     console.error(err);
  //   }
  //   currentUser = user;
  // });

  return {
    name: '@umijs/max',
    settings: defaultSettings as Partial<ProSettings>,
    currentUser,
  };
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
  //setInitialState,
}) => {
  return {
    //logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    avatarProps: {
      src:
        initialState?.currentUser?.picture ||
        'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    onPageChange: () => {
      const { location } = history;
      // let currentUser: Auth0UserProfile | null = null;
      // try {
      //   currentUser = await auth.getCurrentUser();
      // } catch (error) {
      //   console.error(error);
      // }

      //console.log('currentUser', currentUser);
      // If not logged in, redirect to login
      if (
        !auth.isAuthenticated() &&
        location.pathname !== loginPath &&
        location.pathname !== callbackPath
      ) {
        history.push(loginPath);
      }
    },
    ...initialState?.settings,
  };
};

/**
 * @name request configuration, can configure error handling
 * It provides a unified network request and error handling scheme based on axios and ahooks' useRequest.
 * @doc https://umijs.org/docs/max/request#configuration
 */
export const request: RequestConfig = {
  ...errorConfig,
  baseURL:
    process.env.NODE_ENV === 'production' ? process.env.API_BASE_URL : '',
};

// export function rootContainer(container: any) {
//   return React.createElement(ThemeProvider, null, container);
// }
