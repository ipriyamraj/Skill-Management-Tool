import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../App';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setLoggedInUser } = useContext(UserContext);
  const [userData, setUserData] = useState(null);

  // to fetch user data from the backend server
  const fetchUserData = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/employees/login', {
        employeeEmail: email,
        password: password,
      });

      // set the logged-in user in context
      setLoggedInUser(response.data.employee);

      // check employeee's team and redirect accordingly
      if (response.data.team.teamName === 'Leadership' || response.data.team.teamName === 'HR') {
        navigate('/all-employee-details');
      } else {
        navigate('/employee-personal-details');
      }

      // to set user data in local state for further reference
      setUserData(response.data);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchUserData();
  };

  return (
    <div data-testid="p-1">
      <h1 className='main-heading'>Skill Management Tool</h1>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input">
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Submit</button>
      </form>
      <p>
        Don't have an account? <Link to="/">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
