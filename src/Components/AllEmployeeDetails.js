import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import starImage from './star1.png';

const AllEmployeeDetails = () => {
  
  const [employees, setEmployees] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [selectedSkillsAndRatings, setSelectedSkillsAndRatings] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedSkillRatingPairs, setSelectedSkillRatingPairs] = useState([]);
  const [showAddOptions, setShowAddOptions] = useState({});
  const [showUpdateOptions, setShowUpdateOptions] = useState({});
  const [showDeleteOptions, setShowDeleteOptions] = useState({});
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/employees/all-employees-skill-rating');
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/employee-skills/all-skills');
      setAllSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/employees/all-ratings');
      setAllRatings(response.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchSkills();
    fetchRatings();
  }, []);

  const handlePersonalDetails = () => {
    navigate('/employee-personal-details');
  };

  const handleEmployeesUnderMe = () => {
    navigate('/employees-under-manager');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleAddSkill = async (employeeId) => {
    try {
      const skillId = allSkills.find((skill) => skill.skillName === selectedSkill)?.id;
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

      fetchEmployees();
    } catch (error) {
      console.error('Error adding skill ', error);
    } finally {
      setShowAddOptions({ ...showAddOptions, [employeeId]: false });
    }
  };

  const handleDeleteSkill = async (employeeId, selectedSkill) => {
    try {
      const skillId = allSkills.find((skill) => skill.skillName === selectedSkill)?.id;

      if (skillId) {
        await axios.delete(`http://localhost:8080/api/employee-skills/${employeeId}/${skillId}`);
        fetchEmployees();
      } else {
        console.error('Skill not found ', selectedSkill);
      }
    } catch (error) {
      console.error('Error deleting skill ', error);
    } finally {
      setShowDeleteOptions({ ...showDeleteOptions, [employeeId]: false });
    }
  };

  const handleUpdateRating = async (employeeId, skillName, newRatingId) => {
    try {
      const skillId = allSkills.find((skill) => skill.skillName === skillName)?.id;

      await axios.put(`http://localhost:8080/api/employee-skills/updateRating/${employeeId}/${skillId}?ratingId=${newRatingId}`);
      fetchEmployees();
    } catch (error) {
      console.error('Error updating rating ', error);
    } finally {
      setShowUpdateOptions({ ...showUpdateOptions, [employeeId]: false });
    }
  };

  const generateStarRating = (rating) => {
    return (
      <span className='star-rating' style={{ whiteSpace: 'nowrap', listStyle: 'none', padding: 0 }}>
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
    const newFilteredEmployees = employees.filter((employee) => {
      const employeeSkills = Object.keys(employee.skillsAndRatings || {});
      const employeeRatings = Object.values(employee.skillsAndRatings || {});
      return (
        selectedSkillRatingPairs.every(({ skill, rating }) => {
          return (
            employeeSkills.includes(skill) &&
            parseInt(employeeRatings[employeeSkills.indexOf(skill)]) >= parseInt(rating)
          );
        })
      );
    });

    setFilteredEmployees(newFilteredEmployees);
  };

  const clearFilters = () => {
    setSelectedSkillRatingPairs([]);
    setSelectedSkill('');
    setSelectedRating('');
    setFilteredEmployees(employees);
  };

  return (
    <div>
      <h2>All Employee Details</h2>
      <div>
        <button className='logout-btn' onClick={handleLogout}>
          Logout
        </button>
        <button onClick={handlePersonalDetails}>Personal Details</button>
        <button onClick={handleEmployeesUnderMe}>Employees Under Me</button>
      </div>
      <div>
        <label>
          <h3>FILTER SEARCH</h3>
        </label>
        {selectedSkillRatingPairs.map((pair, index) => (
          <div key={index} className="skill-rating-pair">
            <label>
              <p className="skill-name">----- {pair.skill} -----</p>
              <select className='filter-skill-rating'
                value={pair.rating}
                onChange={(e) => {
                  const updatedPairs = [...selectedSkillRatingPairs];
                  updatedPairs[index].rating = e.target.value;
                  setSelectedSkillRatingPairs(updatedPairs);
                }}
              >
                <option value="">Any Rating</option>
                {allRatings.map(({ id, rating }) => (
                  <option key={id} value={rating}>
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
              {allSkills.map(({ id, skillName }) => (
                <option key={id} value={skillName}>
                  {skillName}
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
              {allRatings.map(({ id, rating }) => (
                <option key={id} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </label>
          <span>
            <button
              className='add-skill-btn'
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
            <th>Manager</th>
            <th>Team</th>
            <th>Skills</th>
            <th>Ratings</th>
            <th>Add Skills</th>
            <th>Update Rating</th>
            <th>Delete Skills</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.employeeName}</td>
              <td>{employee.employeeEmail}</td>
              <td>{employee.manager ? employee.manager.employeeName : 'N/A'}</td>
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
                          {allSkills.map(({ id, skillName }) => (
                            <option key={id} value={skillName}>
                              {skillName}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <p className='title-selection'></p>
                        <select onChange={(e) => setSelectedRating(e.target.value)}>
                          <option value="">Add Rating</option>
                          {allRatings.map(({ id, rating }) => (
                            <option key={id} value={rating}>
                              {rating}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button onClick={() => handleAddSkill(employee.id)}>Add</button>
                    </>
                  ) : (
                    <button onClick={() => setShowAddOptions({ ...showAddOptions, [employee.id]: true })}>
                      Add
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
                          <option value="">Choose Skill</option>
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
                          {allRatings.map(({ id, rating }) => (
                            <option key={id} value={rating}>
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
                      <button onClick={() => handleDeleteSkill(employee.id, selectedSkill)}>
                        Delete
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

export default AllEmployeeDetails;
