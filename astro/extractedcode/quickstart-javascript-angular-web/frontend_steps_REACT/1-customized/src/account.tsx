import { useNavigate } from 'react-router-dom';

export default function Account() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="titlebar">
        <button className='button' onClick={() => navigate("/")}>Logout</button>
      </div>
      <div className='centerContainer'>
        <p>User info will display here</p>
      </div>
    </div>
  );
}