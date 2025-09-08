// src/pages/UserDashboard/UserDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../common/components/Navbar/Navbar";

const UserDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-blue-100">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">User Dashboard</h1>
        <p className="text-lg text-blue-600 mb-8">Welcome, User!</p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Dashboard content goes here...</p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
