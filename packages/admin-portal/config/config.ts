// https://umijs.org/config/
import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV = 'dev' } = process.env;

/**
 * @name Using public path
 * @description The path during deployment. If deployed in a non-root directory, this variable needs to be configured
 * @doc https://umijs.org/docs/api/config#publicpath
 */
const PUBLIC_PATH: string = '/';

export default defineConfig({
  /**
   * @name Enable hash mode
   * @description Makes the build output include hash suffixes. Usually used for incremental releases and avoiding browser cache loading.
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,

  publicPath: PUBLIC_PATH,

  /**
   * @name Compatibility settings
   * @description Setting ie11 compatibility may not be perfect, you need to check all dependencies you use
   * @doc https://umijs.org/docs/api/config#targets
   */
  // targets: {
  //   ie: 11,
  // },
  /**
   * @name Route configuration, files not included in routes will not be compiled
   * @description Only supports configuration of path, component, routes, redirect, wrappers, title
   * @doc https://umijs.org/docs/guides/routes
   */
  // umi routes: https://umijs.org/docs/routing
  routes,
  /**
   * @name Theme configuration
   * @description Although it's called theme, it's just variable settings for less
   * @doc antd theme settings https://ant.design/docs/react/customize-theme-cn
   * @doc umi theme configuration https://umijs.org/docs/api/config#theme
   */
  theme: {
    // If you don't want configProvide to dynamically set the theme, set this to default
    // Only set to variable, can use configProvide to dynamically set the main color
    'root-entry-name': 'variable',
  },
  /**
   * @name moment internationalization configuration
   * @description If you don't require internationalization, open it to reduce the js package size
   * @doc https://umijs.org/docs/api/config#ignoremomentlocale
   */
  ignoreMomentLocale: true,
  /**
   * @name Proxy configuration
   * @description Allows your local server to proxy to your server, so you can access server data
   * @see Note: This proxy can only be used during local development, it cannot be used after build
   * @doc Proxy introduction https://umijs.org/docs/guides/proxy
   * @doc Proxy configuration https://umijs.org/docs/api/config#proxy
   */
  proxy: proxy[REACT_APP_ENV as keyof typeof proxy],
  /**
   * @name Quick hot update configuration
   * @description A good hot update component, state can be retained when updating
   */
  fastRefresh: true,
  //============== The following are max plugin configuration ===============
  /**
   * @name Data flow plugin
   * @@doc https://umijs.org/docs/max/data-flow
   */
  model: {},
  /**
   * A global initial data flow, can be used to share data between plugins
   * @description Can be used to store some global data, such as user information, or some global status. The global initial state is created at the very beginning of the Umi project.
   * @doc https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
   */
  initialState: {
    loading: '@/components/Loading',
  },
  /**
   * @name layout plugin
   * @doc https://umijs.org/docs/max/layout-menu
   */
  title: 'Fitness X Admin',
  layout: {
    locale: true,
    ...defaultSettings,
  },

  // /**
  //  * @name Internationalization plugin
  //  * @doc https://umijs.org/docs/max/i18n
  //  */
  locale: {
    // default zh-CN
    default: 'en-US',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
    baseSeparator: '-',
  },
  /**
   * @name antd plugin
   * @description Built-in babel import plugin
   * @doc https://umijs.org/docs/max/antd#antd
   */
  antd: {},
  /**
   * @name Network request configuration
   * @description It provides a unified network request and error handling scheme based on axios and ahooks' useRequest.
   * @doc https://umijs.org/docs/max/request
   */
  request: {},
  /**
   * @name Permission plugin
   * @description Permission plugin based on initialState, must first open initialState
   * @doc https://umijs.org/docs/max/access
   */
  access: {},

  //================ pro plugin configuration =================
  presets: ['umi-presets-pro'],
  /**
   * @name openAPI plugin configuration
   * @description Based on the openapi specification to generate serve andmock, can reduce a lot of boilerplate code
   * @doc https://pro.ant.design/zh-cn/docs/openapi/
   */
  /**
   * @name Whether to enable mako
   * @description Use mako for rapid development
   * @doc https://umijs.org/docs/api/config#mako
   */
  ...(REACT_APP_ENV === 'dev' ? { mako: {} } : {}),
  esbuildMinifyIIFE: true,
  requestRecord: {},
  define: {
    'process.env.API_BASE_URL': process.env.API_BASE_URL,
    'process.env.AUTH0_DOMAIN': process.env.AUTH0_DOMAIN,
    'process.env.AUTH0_CLIENT_ID': process.env.AUTH0_CLIENT_ID,
    'process.env.AUTH0_AUDIENCE': process.env.AUTH0_AUDIENCE,
  },
});
