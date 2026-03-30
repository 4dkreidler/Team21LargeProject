import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    console.log("User logged out");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50 px-6 py-3 flex justify-between items-center">
      {/* Logo / Title Section */}
      <div className="flex items-center gap-2">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
             <span className="text-blue-600 font-bold text-xs">PP</span>
          </div>
          <span className="font-bold text-blue-900 tracking-tight text-lg">
            ParcelPantry
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-4">
        <Link 
          to="/login" 
          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          Login
        </Link>
        <Link 
          to="/signup" 
          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          Signup
        </Link>
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="ml-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};