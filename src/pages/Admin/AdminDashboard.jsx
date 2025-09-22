import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NavigationProvider } from "../../context/NavigationContext";
import Navbar from "../../common/components/Navbar/Navbar";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import NavigationLoader from "../../common/components/NavigationLoader/NavigationLoader";


function AdminDashboard() {

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
    <NavigationProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          onLogout={handleLogout} 
          onToggleSidebar={toggleSidebar} 
          variant="admin"
        />
        <NavigationLoader />
        <div className="flex">
          <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          <div className="flex-1 lg:ml-0">
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100">
              <h1 className="text-3xl font-bold text-green-800 mb-4">Admin Dashboard</h1>
              <p className="text-lg text-green-600 mb-8">Welcome, Admin!</p>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600">Admin dashboard content goes here...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavigationProvider>
  )
}

export default AdminDashboard