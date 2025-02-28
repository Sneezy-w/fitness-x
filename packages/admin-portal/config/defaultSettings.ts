import type { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // Daybreak Blue
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Fitness X Admin',
  pwa: true,
  logo: 'https://cdn.prod.website-files.com/6053b42fb638a363a757494b/60f0fe84e98f8f0e1a3d9724_favicon-fitness-webflow-template-brix-templates.svg',
  iconfontUrl: '',
  token: {
    // See TS declaration, see documentation for demo, modify styles through token
    //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
  },
};

export default Settings;
