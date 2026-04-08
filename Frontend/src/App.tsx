import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Verificiation from './pages/Verification';
import { Navbar } from './components/Navbar';
import SuccessVerification from './pages/SuccessVerification';
import Verification from './pages/Verification';


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
          <Route path="/Verification" element={<Verificiation />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/verification-success" element={<SuccessVerification />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;