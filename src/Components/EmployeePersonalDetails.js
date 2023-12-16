import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import starImage from './star1.png';
import { UserContext } from '../App';
import '../App.css';

const EmployeePersonalDetails = () => {
  const { loggedInUser } = useContext(UserContext);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [employeeSkills, setEmployeeSkills] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/employees/${loggedInUser.id}`);
        setEmployeeDetails(response.data);
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    const fetchEmployeeSkills = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/employee-skills/employee/${loggedInUser.id}`);
        setEmployeeSkills(response.data.skills);
      } catch (error) {
        console.error('Error fetching employee skills:', error);
      }
    };

    const fetchAllSkills = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/employee-skills/all-skills');
        setAllSkills(response.data.map(skill => skill.skillName));
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };

    const fetchAllRatings = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/employees/all-ratings');
        setAllRatings(response.data.map(rating => rating.rating));
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    if (loggedInUser) {
      fetchEmployeeDetails();
      fetchEmployeeSkills();
      fetchAllSkills();
      fetchAllRatings();
    }
  }, [loggedInUser]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleEmployeesUnderMe = () => {
    navigate('/employees-under-manager');
  };

  const handleDeleteSkill = async (skillName) => {
    try {
      const skillsResponse = await axios.get('http://localhost:8080/api/employee-skills/all-skills');
      const skills = skillsResponse.data;

      const selectedSkill = skills.find((skill) => skill.skillName === skillName);

      if (!selectedSkill) {
        console.error('Error: Skill not found with name', skillName);
        return;
      }

      await axios.delete(`http://localhost:8080/api/employee-skills/${loggedInUser.id}/${selectedSkill.id}`);

      const response = await axios.get(`http://localhost:8080/api/employee-skills/employee/${loggedInUser.id}`);
      setEmployeeSkills(response.data.skills);
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const handleAddSkill = async () => {
    try {
      const skillId = allSkills.indexOf(selectedSkill) + 1;
      const ratingId = parseInt(selectedRating);

      await axios.post(`http://localhost:8080/api/employee-skills`, {
        employee: {
          id: loggedInUser.id,
        },
        skill: {
          id: skillId,
        },
        rating: {
          id: ratingId,
        },
      });

      const response = await axios.get(`http://localhost:8080/api/employee-skills/employee/${loggedInUser.id}`);
      setEmployeeSkills(response.data.skills);

      setSelectedSkill('');
      setSelectedRating('');
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const generateStarRating = (rating) => {
    return (
      <span style={{ whiteSpace: 'nowrap' }}>
        {Array.from({ length: rating }, (_, index) => (
          <img
            key={index}
            src={starImage}
            alt={`star-${index + 1}`}
            style={{ width: '15px', height: '15px', marginRight: '2px' }}
          />
        ))}
      </span>
    );
  };

  return (
    <div>
      <h2>Employee Personal Details</h2>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
      <button onClick={handleEmployeesUnderMe}>Employees Under Me</button>

      {employeeDetails && (
        <table>
          <thead>
            <tr>
              {/* header columns  */}
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Manager</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {/* column data  */}
              <td>{employeeDetails.id}</td>
              <td>{employeeDetails.employeeName}</td>
              <td>{employeeDetails.employeeEmail}</td>
              <td>{employeeDetails.manager ? employeeDetails.manager.employeeName : 'N/A'}</td>
              <td>{employeeDetails.team ? employeeDetails.team.teamName : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      )}

      <h2>Employee Skills</h2>
      {employeeSkills && (
        <table>
          <thead>
            <tr>
              <th>Skill Name</th>
              <th>Rating</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {employeeSkills.map((skill, index) => (
              <tr key={index}>
                <td>{skill.skillName}</td>
                <td>{generateStarRating(skill.rating)}</td>
                <td>
                  <button onClick={() => handleDeleteSkill(skill.skillName)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

<h2>Add Skill</h2>
      <div className="add-skill-rating-container-pp">
        <label>
          <p className='heading-para'></p>
          <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
            <option value="">Add Skill</option>
            {allSkills.map((skill, index) => (
              <option key={index} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </label>
        <label>
          <p className='heading-para'></p>
          <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
            <option value="">Add Rating</option>
            {allRatings.map((rating, index) => (
              <option key={index} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </label>
        <button className='pp-add-skill' type="button" onClick={handleAddSkill}>
          Add Skill
        </button>
      </div>
    </div>
  );
};

export default EmployeePersonalDetails;
