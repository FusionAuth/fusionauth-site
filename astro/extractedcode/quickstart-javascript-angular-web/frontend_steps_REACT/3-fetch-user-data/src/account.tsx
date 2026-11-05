import { useNavigate } from 'react-router-dom';
import { useFusionAuth } from '@fusionauth/react-sdk';
import { useEffect, useState } from 'react';

export default function Account() {
  const navigate = useNavigate();

  // use fusionauth SDK methods to handle authentication, logout, and user data fetching
  const { isLoggedIn, isFetchingUserInfo, startLogout, userInfo } = useFusionAuth();
  const [newUserInfo, setNewUserInfo] = useState({'given_name': '', 'family_name': '', 'birthdate': ''});

  // if user is not authenticated, redirect them back to the login page
  useEffect(() => { if (!isLoggedIn) navigate("/"); }, [isLoggedIn, navigate]);

  async function getUserInfo() {
    const response = await fetch('http://localhost:9011/app/me', {
      'method': 'GET',
      'credentials': 'include',
      'headers': { 'Accept': 'application/json' }
    });
    const info = await response.json();
    setNewUserInfo(info);
  }

  if (!isLoggedIn || isFetchingUserInfo) return null;

  return (
    <div>
      <div className="titlebar">
        <span className='white'>{userInfo?.email}</span>
        <button className='button' onClick={() => startLogout()}>Logout</button>
      </div>
      <div className='centerContainer'>
        <div className="userInfoGrid">
          <div>Name:</div>
          <div>{newUserInfo?.given_name} {newUserInfo?.family_name}</div>
          <div>Birthdate:</div>
          <div>{newUserInfo?.birthdate}</div>
        </div>
        <br />
        <div>
          <button className="button" onClick={getUserInfo}>Show your info</button>
        </div>
      </div>
    </div>
  );
}