import Loading from '@/components/Loading';
import { auth } from '@/services/auth';
import { history, useModel } from '@umijs/max';
import { message } from 'antd';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
const Callback: React.FC = () => {
  const { setInitialState } = useModel('@@initialState');

  useEffect(() => {
    auth
      .handleAuthentication()
      .then(async () => {
        flushSync(async () => {
          const currentUser = await auth.getCurrentUser();
          //console.log('currentUser', currentUser);
          setInitialState((s: any) => ({
            ...s,
            currentUser: currentUser,
          }));
        });
        message.success('Successfully logged in!');
        history.push('/'); // Redirect to home page after successful login
      })
      .catch((error) => {
        message.error('Authentication failed');
        console.error('Authentication error:', error);
        history.push('/login');
      });
  }, []);

  return <Loading />;
};

export default Callback;
