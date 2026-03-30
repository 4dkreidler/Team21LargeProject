import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

import Login from "./Pages/login";
//import Signup from "./Pages/signup"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
         <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;