import auth0, { Auth0UserProfile } from 'auth0-js';

// Auth0 Configuration
export const webAuth = new auth0.WebAuth({
  domain: process.env.AUTH0_DOMAIN || '',
  clientID: process.env.AUTH0_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/callback`,
  responseType: 'token id_token',
  scope: 'openid profile email',
  audience: process.env.AUTH0_AUDIENCE || '',
});

export const auth = {
  login(username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      webAuth.login(
        {
          realm: 'Username-Password-Authentication', // Specify auth0 database connection
          username,
          password,
        },
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        },
      );
    });
  },

  logout() {
    // Clear locally stored tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');

    // Redirect to Auth0 logout page
    webAuth.logout({
      returnTo: window.location.origin + '/login',
    });
  },

  handleAuthentication(): Promise<void> {
    return new Promise((resolve, reject) => {
      webAuth.parseHash((err, authResult) => {
        if (err) {
          reject(err);
          return;
        }
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          resolve();
        }
      });
    });
  },

  setSession(authResult: auth0.Auth0DecodedHash) {
    // Set token expiration time
    const expiresAt = JSON.stringify(
      (authResult.expiresIn || 0) * 1000 + new Date().getTime(),
    );

    localStorage.setItem('access_token', authResult.accessToken || '');
    localStorage.setItem('id_token', authResult.idToken || '');
    localStorage.setItem('expires_at', expiresAt);
  },

  isAuthenticated(): boolean {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '0');
    return new Date().getTime() < expiresAt;
  },

  getAccessToken(): string {
    return localStorage.getItem('access_token') || '';
  },

  async getCurrentUser(): Promise<Auth0UserProfile | null> {
    return new Promise((resolve, reject) => {
      const idToken = localStorage.getItem('id_token');
      if (!idToken) {
        resolve(null);
        return;
      }

      webAuth.client.userInfo(this.getAccessToken(), (err, user) => {
        if (err) {
          reject(null);
          return;
        }
        resolve(user);
      });
    });
  },
};
