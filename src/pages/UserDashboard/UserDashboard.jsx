// src/pages/UserDashboard/UserDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../common/components/Navbar/Navbar";
import UserSidebar from "../../components/UserSidebar/UserSidebar";

const UserDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login"); 
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use the enhanced Navbar component */}
      <Navbar 
        onLogout={handleLogout}
        onMenuToggle={toggleSidebar}
        showMobileMenu={true}
        variant="dashboard"
      />

      {/* Main Layout with Sidebar */}
      <div className="flex">
        <UserSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-green-100 p-4">
            <h1 className="text-3xl font-bold text-green-800 mb-4">User Dashboard</h1>
            <p className="text-lg text-green-600 mb-8">Welcome, User!</p>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl w-full">
              <p className="text-gray-600">Dashboard content goes here...</p>
              <p className="text-gray-500 mt-2 text-sm">Use the sidebar navigation to access different sections of your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
