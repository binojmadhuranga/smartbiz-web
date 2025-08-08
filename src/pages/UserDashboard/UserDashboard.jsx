// src/pages/UserDashboard/UserDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const UserDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">User Dashboard</h1>
      <p className="text-lg text-blue-600 mb-8">Welcome, User!</p>
      <button
        onClick={handleLogout}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default UserDashboard;
