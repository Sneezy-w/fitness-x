/**
 * @name UMI route configuration
 * @description Only supports configuration of path, component, routes, redirect, wrappers, name, icon
 * @param path  path only supports two types of placeholder configurations: the first is the dynamic parameter in the form of :id, and the second is the * wildcard, which can only appear at the end of the route string.
 * @param component Configure the React component path used for rendering after location and path match. It can be an absolute path or a relative path. If it is a relative path, it will start from src/pages.
 * @param routes Configure sub-routes, usually used when adding layout components to multiple paths.
 * @param redirect Configure route redirection
 * @param wrappers Configure wrapper components for route components. Through wrapper components, more functionality can be combined into the current route component. For example, it can be used for route-level permission verification.
 * @param name Configure the title of the route. By default, it reads the value of menu.xxxx in the internationalization file menu.ts. If name is configured as login, it will read the value of menu.login in menu.ts as the title.
 * @param icon Configure the icon of the route. Refer to https://ant.design/components/icon-cn for values. Note to remove style suffixes and case sensitivity. For example, if you want to configure the icon as <StepBackwardOutlined />, the value should be stepBackward or StepBackward. If you want to configure the icon as <UserOutlined />, the value should be user or User.
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/',
    redirect: '/home',
  },
  {
    name: 'Home',
    path: '/home',
    component: './Home',
  },
  {
    name: 'login',
    path: '/login',
    component: './Login',
    layout: false,
  },
  {
    name: 'Members',
    path: '/members',
    component: './Members',
  },
  {
    name: 'Membership Types',
    path: '/membership-types',
    component: './MembershipTypes',
  },
  // {
  //   name: 'Membership Subscriptions',
  //   path: '/membership-subscriptions',
  //   component: './MembershipSubscriptions',
  // },

  {
    name: 'Trainers',
    path: '/trainers',
    component: './Trainers',
  },

  {
    name: 'Classes',
    path: '/classes',
    component: './Classes',
  },
  {
    name: 'Schedules',
    path: '/schedules',
    component: './Schedules',
  },
  // {
  //   name: 'Bookings',
  //   path: '/bookings',
  //   component: './Bookings',
  // },
  // {
  //   name: 'Access',
  //   path: '/access',
  //   component: './Access',
  // },
  // {
  //   name: 'Table',
  //   path: '/table',
  //   component: './Table',
  // },
  {
    path: '/callback',
    component: './Callback',
    layout: false,
  },
];
