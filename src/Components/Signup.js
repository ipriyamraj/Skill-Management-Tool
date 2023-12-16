import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  const teamOptions = [
    { label: 'Leadership', value: '1' },
    { label: 'Product', value: '2' },
    { label: 'Engineering', value: '3' },
    { label: 'HR', value: '4' },
    { label: 'Admin', value: '5' },
  ];

  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/employees/signup', {
        employeeName: name,
        employeeEmail: email,
        password: password,
        team: {
          id: parseInt(selectedTeam)
        }
      });

      console.log(response.data);


      setName('');
      setEmail('');
      setPassword('');
      setSelectedTeam('');
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <div data-testid="pa">
      <h1 className='main-heading'>Skill Management Tool</h1>
      <h2>Sign Up Page</h2>
      <form onSubmit={handleSignUp}>
        <div className="input">
          <input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="input">
          <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input">
          <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="input">
          <select value={selectedTeam} onChange={handleTeamChange}>
            <option value="" disabled>Select Team</option>
            {teamOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default Signup;
