import { auth } from '@/services/auth';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { Helmet } from '@umijs/max';
import { Form, message, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import Settings from '../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

// const LoginMessage: React.FC<{
//   content: string;
// }> = ({ content }) => {
//   return (
//     <Alert
//       style={{
//         marginBottom: 24,
//       }}
//       message={content}
//       type="error"
//       showIcon
//     />
//   );
// };

const Login: React.FC = () => {
  //const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  // const [resetEmailStatus, setResetEmailStatus] = useState<{
  //   status?: 'ok' | 'error';
  //   message?: string;
  // }>({});
  const [form] = Form.useForm();
  //const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      await auth.login(values.username!, values.password!);

      // if (result.status === 'ok' && result.user) {
      //   // Update initialState with the Firestore user data
      //   flushSync(() => {
      //     setInitialState((s: any) => ({
      //       ...s,
      //       currentUser: result.user,
      //     }));
      //   });

      //   const defaultLoginSuccessMessage = 'Login successful!';
      //   message.success(defaultLoginSuccessMessage);

      //   const urlParams = new URL(window.location.href).searchParams;
      //   history.push(urlParams.get('redirect') ?? '/');
      //   return;
      // }

      // // Handle login error
      // message.error(result.message ?? 'Login failed');
      //setUserLoginState({ status: 'error' });
      message.success('Login successful!');
      // Auth0 will handle the redirect automatically
    } catch (error) {
      const defaultLoginFailureMessage = 'Login failed, please try again!';
      message.error(defaultLoginFailureMessage);
    }
  };

  // const handleForgotPassword = async () => {
  //   try {
  //     const values = await form.validateFields(['username']);
  //     const email = values.username;

  //     if (!email) {
  //       message.error('Please enter your email!');
  //       return;
  //     }

  //     const result = await resetPassword(email);
  //     setResetEmailStatus(result);

  //     if (result.status === 'ok') {
  //       message.success(result.message);
  //     } else {
  //       message.error(result.message);
  //     }
  //   } catch (error) {
  //     // This means validation failed
  //     form.validateFields(['username']);
  //   }
  // };

  //const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          Login
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          form={form}
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          // logo={<img alt="logo" src="/logo.svg" />}
          title="Fitness X Admin"
          // subTitle={intl.formatMessage({
          //   id: 'pages.layouts.userLayout.title',
          // })}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: 'Login',
              },
            ]}
          />

          {/* {status === 'error' && loginType === 'account' && (
            <LoginMessage
              content={'Account or password error (admin/ant.design)'}
            />
          )} */}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'Email'}
                rules={[
                  {
                    required: true,
                    message: 'Email is required',
                  },
                  {
                    type: 'email',
                    message: 'Invalid email',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'Password'}
                rules={[
                  {
                    required: true,
                    message: 'Please input your password!',
                  },
                ]}
              />
            </>
          )}

          <div
            style={{
              marginBottom: 24,
            }}
          >
            {/* <ProFormCheckbox noStyle name="autoLogin">
              {'Auto Login'}
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
              onClick={(e) => {
                e.preventDefault();
                handleForgotPassword();
              }}
            >
              {'Forgot Password'}
            </a> */}
          </div>

          {/* {resetEmailStatus.status === 'error' && (
            <Alert
              style={{
                marginBottom: 24,
              }}
              message={resetEmailStatus.message}
              type="error"
              showIcon
            />
          )} */}
        </LoginForm>
      </div>
    </div>
  );
};

export default Login;
