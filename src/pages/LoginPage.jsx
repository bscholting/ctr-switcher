import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage({ setUser }) {
    useEffect(() => {
      /* Load Google's Identity Services script */
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }, []);
  
    const handleGoogleLogin = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'openid profile email https://www.googleapis.com/auth/youtube.force-ssl',
        callback: (tokenResponse) => {
          console.log('Access Token:', tokenResponse.access_token);
          localStorage.setItem('access_token', tokenResponse.access_token);
          fetchUserInfo(tokenResponse.access_token);
        },
      });
  
      client.requestAccessToken();
    };
  
    const fetchUserInfo = async (accessToken) => {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      const user = await res.json();
      console.log('User Info:', user);
      setUser(user);
      localStorage.setItem('ctr_user', JSON.stringify(user));
    };
  
    return (
      <div className="p-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">CTR Switcher</h1>
        <p className="text-gray-600 mb-6">Sign in with Google to get started</p>
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    );
  }
