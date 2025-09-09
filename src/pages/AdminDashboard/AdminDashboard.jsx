import React from 'react'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../common/components/Navbar/Navbar";


function AdminDashboard() {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Navbar onLogout={handleLogout} />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-green-100">
        <h1 className="text-3xl font-bold text-green-800 mb-4">Admin Dashboard</h1>
        <p className="text-lg text-green-600 mb-8">Welcome, Admin!</p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Admin dashboard content goes here...</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard