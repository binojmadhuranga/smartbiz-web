import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NavigationProvider } from "../../context/NavigationContext";
import Navbar from "../../common/components/Navbar/Navbar";
import UserSidebar from "../../components/UserSidebar/UserSidebar";
import NavigationLoader from "../../components/NavigationLoader/NavigationLoader";

const DashboardLayout = () => {
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
      <div className="bg-gray-50 h-[100vh]">
        <Navbar 
          onLogout={handleLogout}
          onMenuToggle={toggleSidebar}
          showMobileMenu={true}
          variant="dashboard"
        />

        <div className="flex">
          <UserSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          
          <div className="flex-1 lg:ml-0">
            <div className="lg:h-[85vh] md:h-[88vh] h-[90vh] overflow-y-auto">
              <Outlet />
            </div>
          </div>
        </div>
        
        {/* Navigation Loading Overlay */}
        <NavigationLoader />
      </div>
    </NavigationProvider>
  );
};

export default DashboardLayout;
