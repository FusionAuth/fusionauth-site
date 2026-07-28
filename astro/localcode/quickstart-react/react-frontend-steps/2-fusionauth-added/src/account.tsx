import { useNavigate } from 'react-router-dom';
import { useFusionAuth } from '@fusionauth/react-sdk';
import { useEffect } from 'react';

export default function Account() {
  const navigate = useNavigate();

  // use fusionauth SDK methods to handle authentication and logout
  const { isLoggedIn, isFetchingUserInfo, startLogout, userInfo } = useFusionAuth();
  
  // if user is not authenticated, redirect them back to the login page
  useEffect(() => { if (!isLoggedIn) navigate("/"); }, [isLoggedIn, navigate]);

  if (!isLoggedIn || isFetchingUserInfo) return null;
  
  return (
    <div>
      <div className="titlebar">
        <span className='white'>{userInfo?.email}</span>
        <button className='button' onClick={() => startLogout()}>Logout</button>
      </div>
      <div className='centerContainer'>
        <p>User info will display here</p>
      </div>
    </div>
  );
}