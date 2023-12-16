// App.js
import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Signup from './Components/Signup';
import Login from './Components/Login';
import EmployeePersonalDetails from './Components/EmployeePersonalDetails';
import AllEmployeeDetails from './Components/AllEmployeeDetails';
// import UpdateEmployeeDetails from './Components/UpdateEmployeeDetails';
import EmployeesUnderManager from './Components/EmployeesUnderManager';
import './App.css'
// import Table from './Components/Table';


// to create a context for the user
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <UserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </UserContext.Provider>
  );
};

function App() {
  return (
    <Router>
      <div className="container">
        
        
        <UserProvider>
          <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/employee-personal-details" element={<EmployeePersonalDetails />} />
            <Route path="/all-employee-details" element={<AllEmployeeDetails />} />
            <Route path="/employees-under-manager" element={<EmployeesUnderManager />} />
          </Routes>
        </UserProvider>
      </div>
    </Router>
  );
}

export default App;
