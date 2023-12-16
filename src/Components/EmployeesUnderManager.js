import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import starImage from './star1.png';

const EmployeesUnderManager = () => {
  const { loggedInUser } = useContext(UserContext);
  const [employeesUnderManager, setEmployeesUnderManager] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [selectedSkillRatingPairs, setSelectedSkillRatingPairs] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [showAddOptions, setShowAddOptions] = useState({});
  const [showUpdateOptions, setShowUpdateOptions] = useState({});
  const [showDeleteOptions, setShowDeleteOptions] = useState({});
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const handlePersonalDetails = () => {
    navigate('/employee-personal-details');
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

  const fetchEmployeesUnderManager = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/employees/employeesUnderManager/${loggedInUser.id}`);
      setEmployeesUnderManager(response.data);
    } catch (error) {
      console.error('Error fetching employees under manager:', error);
    }
  };

  useEffect(() => {
    if (loggedInUser && loggedInUser.id) {
      fetchAllSkills();
      fetchAllRatings();
      fetchEmployeesUnderManager();
    }
  }, [loggedInUser]);

  const handleAddSkill = async (employeeId) => {
    try {
      const skillId = allSkills.indexOf(selectedSkill) + 1;
      const ratingId = parseInt(selectedRating);

      await axios.post(`http://localhost:8080/api/employee-skills`, {
        employee: {
          id: employeeId,
        },
        skill: {
          id: skillId,
        },
        rating: {
          id: ratingId,
        },
      });

      filterEmployees();
      fetchEmployeesUnderManager();
      setSelectedSkill('');
      setSelectedRating('');
    } catch (error) {
      console.error('Error adding skill:', error);
    } finally {
      setShowAddOptions({ ...showAddOptions, [employeeId]: false });
    }
  };

  const handleDeleteSkill = async (employeeId, skillName) => {
    try {
      const lowerCaseSkills = allSkills.map(skill => skill.toLowerCase());
      const lowerCaseSkillName = skillName.toLowerCase();
      const skillIndex = lowerCaseSkills.indexOf(lowerCaseSkillName);

      if (skillIndex !== -1) {
        const skillId = skillIndex + 1;
        await axios.delete(`http://localhost:8080/api/employee-skills/${employeeId}/${skillId}`);
        fetchEmployeesUnderManager();
        filterEmployees();
      } else {
        console.error('Skill not found:', skillName);
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    } finally {
      setShowDeleteOptions({ ...showDeleteOptions, [employeeId]: false });
    }
  };

  const handleUpdateRating = async (employeeId, skillName, newRatingId) => {
    try {
      const skillId = allSkills.indexOf(skillName) + 1;
      await axios.put(`http://localhost:8080/api/employee-skills/updateRating/${employeeId}/${skillId}?ratingId=${newRatingId}`);
      fetchEmployeesUnderManager();
      filterEmployees();
    } catch (error) {
      console.error('Error updating rating:', error);
    } finally {
      setShowUpdateOptions({ ...showUpdateOptions, [employeeId]: false });
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

  const filterEmployees = () => {
    const newFilteredEmployees = employeesUnderManager.filter((employee) => {
      const employeeSkills = Object.keys(employee.skillsAndRatings || {});
      const employeeRatings = Object.values(employee.skillsAndRatings || {});

      return selectedSkillRatingPairs.every(({ skill, rating }) => {
        const skillIndex = allSkills.indexOf(skill);
        const employeeRating = employeeSkills.includes(skill)
          ? parseInt(employeeRatings[employeeSkills.indexOf(skill)])
          : 0;

        return skillIndex !== -1 && employeeRating >= parseInt(rating);
      });
    });

    setEmployeesUnderManager(newFilteredEmployees);
  };

  const clearFilters = () => {
    setSelectedSkillRatingPairs([]);
    setSelectedSkill('');
    setSelectedRating('');
    fetchEmployeesUnderManager();
  };

  return (
    <div>
      <h2>Employees Under Your Management</h2>
      <button className='logout-btn' onClick={handleLogout}>
        Logout
      </button>
      <button onClick={handlePersonalDetails}>
        Personal Details
      </button>
      <div>
        <h3 className='title-selection'>FILTER SEARCH</h3>
        {selectedSkillRatingPairs.map((pair, index) => (
          <div key={index} className="skill-rating-pair">
            <label>
              <p className='skill-name'>----- {pair.skill} -----</p>
              <select
                className='filter-skill-rating'
                value={pair.rating}
                onChange={(e) => {
                  const updatedPairs = [...selectedSkillRatingPairs];
                  updatedPairs[index].rating = e.target.value;
                  setSelectedSkillRatingPairs(updatedPairs);
                }}
              >
                <option value="">Any Rating</option>
                {allRatings.map((rating, ratingIndex) => (
                  <option key={ratingIndex} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
        <div className="skill-rating-container">
          <label>
            <p className="title-selection"></p>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="">Select Skill</option>
              {allSkills.map((skill, skillIndex) => (
                <option key={skillIndex} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </label>
          <label>
            <p className="title-selection"></p>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
            >
              <option value="">Select Rating</option>
              {allRatings.map((rating, ratingIndex) => (
                <option key={ratingIndex} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </label>
          <span>
            <button className='add-skill-btn'
              onClick={() => {
                if (selectedSkill && selectedRating) {
                  setSelectedSkillRatingPairs([
                    ...selectedSkillRatingPairs,
                    { skill: selectedSkill, rating: selectedRating },
                  ]);
                  setSelectedSkill('');
                  setSelectedRating('');
                }
              }}
            >
              Add Skill
            </button>
          </span>
        </div>
        <div className='filter-btns'>
          <button className='filter-btn' onClick={filterEmployees}>Filter Search</button>
          <button className='filter-btn' onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Team</th>
            <th>Skills</th>
            <th>Ratings</th>
            <th>Add Skills</th>
            <th>Update Rating</th>
            <th>Delete Skills</th>
          </tr>
        </thead>
        <tbody>
          {employeesUnderManager.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.employeeName}</td>
              <td>{employee.employeeEmail}</td>
              <td>{employee.team ? employee.team.teamName : 'N/A'}</td>
              <td>
                <ul>
                  {Object.keys(employee.skillsAndRatings || {}).map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </td>
              <td>
                <ul>
                  {Object.values(employee.skillsAndRatings || {}).map((rating, index) => (
                    <li className='rating-list' key={index}>{generateStarRating(rating)}</li>
                  ))}
                </ul>
              </td>
              <td>
                <div>
                  {showAddOptions[employee.id] ? (
                    <>
                      <label>
                        <p className='title-selection'></p>
                        <select onChange={(e) => setSelectedSkill(e.target.value)}>
                          <option value="">Add Skill</option>
                          {allSkills.map((skill, index) => (
                            <option key={index} value={skill}>
                              {skill}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <p className='title-selection'></p>
                        <select onChange={(e) => setSelectedRating(e.target.value)}>
                          <option value="">Add Rating</option>
                          {allRatings.map((rating, index) => (
                            <option key={index} value={rating}>
                              {rating}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button onClick={() => handleAddSkill(employee.id)}>
                        Add Skill
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setShowAddOptions({ ...showAddOptions, [employee.id]: true })}>
                      Add Skill
                    </button>
                  )}
                </div>
              </td>
              <td>
                <div>
                  {showUpdateOptions[employee.id] ? (
                    <>
                      <label>
                        <p className='title-selection'></p>
                        <select onChange={(e) => setSelectedSkill(e.target.value)}>
                          <option value="">Update Skill</option>
                          {Object.keys(employee.skillsAndRatings || {}).map((skill) => (
                            <option key={skill} value={skill}>
                              {skill}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <p className='title-selection'></p>
                        <select onChange={(e) => setSelectedRating(e.target.value)}>
                          <option value="">Update Rating</option>
                          {allRatings.map((rating, index) => (
                            <option key={index} value={rating}>
                              {rating}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button onClick={() => handleUpdateRating(employee.id, selectedSkill, selectedRating)}>
                        Update
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setShowUpdateOptions({ ...showUpdateOptions, [employee.id]: true })}>
                      Update
                    </button>
                  )}
                </div>
              </td>
              <td>
                <div>
                  {showDeleteOptions[employee.id] ? (
                    <>
                      <label>
                        <p className='title-selection'></p>
                        <select onChange={(e) => setSelectedSkill(e.target.value)}>
                          <option value="">Delete Skill</option>
                          {Object.keys(employee.skillsAndRatings || {}).map((skill) => (
                            <option key={skill} value={skill}>
                              {skill}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={() =>
                          handleDeleteSkill(
                            employee.id,
                            selectedSkill
                          )
                        }
                      >
                        Delete Skill
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setShowDeleteOptions({ ...showDeleteOptions, [employee.id]: true })}>
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeesUnderManager;
