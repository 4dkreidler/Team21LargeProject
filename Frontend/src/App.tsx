import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Verification from './pages/Verification';
import SuccessVerification from './pages/SuccessVerification';
import Verificiation from './pages/Verification';
import Dashboard from './pages/Dashboard';
import { Navbar } from './components/Navbar';
import Settings from './pages/Settings'
import PasswordChange from './pages/PasswordChange';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar /> 
      <div className="pt-20 min-h-screen bg-gray-100"> 
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/verification-success" element={<SuccessVerification />} />
          <Route path="/Verification" element={<Verificiation />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/password-change" element={<PasswordChange />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
