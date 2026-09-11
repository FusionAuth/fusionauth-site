import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="titlebar">
        <button className='button' onClick={() => navigate("/account")}>
          Login
        </button>
      </div>
      <div className='centerContainer'>
        <div>Log in to request your information</div>
      </div>
    </div>
  );
};
