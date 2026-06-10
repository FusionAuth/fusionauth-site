import { useNavigate } from 'react-router-dom';
import { useFusionAuth } from '@fusionauth/react-sdk';
import { useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();

  const { isLoggedIn, startLogin, startLogout, userInfo } = useFusionAuth();
  useEffect(() => {
    // Post-authentication redirect to account page
    if (isLoggedIn && sessionStorage.getItem('justLoggedIn') === 'true') {
      sessionStorage.removeItem('justLoggedIn');
      navigate("/account");
    }
  }, [isLoggedIn, navigate]);

  return (
    // show logout button for authenticated users, login button for all others
    <div>
      <div className="titlebar">
        {isLoggedIn ? (
          <>
          <span className='white'>{userInfo?.email}</span>
          <button className='button' onClick={() => startLogout()}>Logout</button>
          </>
        ) : (
          <button
            className='button'
            onClick={() => {
              sessionStorage.setItem('justLoggedIn', 'true');
              startLogin();
            }}
          >
            Login
          </button>
        )}
      </div>
      <div className='centerContainer'>
        <div>Log in to request your information</div>
      </div>
    </div>
  );
};
