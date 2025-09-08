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
    <div className=" bg-gray-50 h-[100vh] ">
      <Navbar 
        onLogout={handleLogout}
        onMenuToggle={toggleSidebar}
        showMobileMenu={true}
        variant="dashboard"
      />

      <div className="flex">
        <UserSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <div className="flex-1 lg:ml-0">
          <div className="flex flex-col items-center justify-center lg:h-[85vh] md:h-[88vh] h-[90vh] bg-green-100 p-2 lg:p-4 overflow-hidden">
            <h1 className="text-2xl lg:text-3xl font-bold text-green-800 mb-2 lg:mb-4">User Dashboard</h1>
            <p className="text-base lg:text-lg text-green-600 mb-4 lg:mb-6">Welcome, User!</p>
            <div className="bg-white p-3 lg:p-6 rounded-lg shadow-md max-w-3xl lg:max-w-4xl w-full h-auto max-h-[60vh] overflow-y-auto">
              <p className="text-gray-600 text-sm lg:text-base">Dashboard content goes here...</p>
              <p className="text-gray-500 mt-1 lg:mt-2 text-xs lg:text-sm">Use the sidebar navigation to access different sections of your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
