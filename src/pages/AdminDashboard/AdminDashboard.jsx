import React from 'react'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


function AdminDashboard() {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
      <p className="text-lg text-gray-600 mb-8">Welcome, Admin!</p>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  )
}

export default AdminDashboard