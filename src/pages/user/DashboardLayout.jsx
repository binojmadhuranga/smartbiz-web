import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NavigationProvider } from "../../context/NavigationContext";
import Navbar from "../../common/components/Navbar/Navbar";
import UserSidebar from "../../components/UserSidebar/UserSidebar";
import NavigationLoader from "../../common/components/NavigationLoader/NavigationLoader";
import dashboardBg from "../../assets/dashboard.png";


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
      <div 
        className="bg-gray-50 h-[100vh]"
        style={{
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <Navbar 
          onLogout={handleLogout}
          onMenuToggle={toggleSidebar}
          showMobileMenu={true}
          variant="dashboard"
        />

        <div className="flex">
          <UserSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          
          <div className="flex-1 lg:ml-0 min-w-0 lg:w-auto w-full lg:pl-0 pl-0">
            <div className="lg:h-[85vh] md:h-[88vh] h-[90vh] overflow-y-auto overflow-x-hidden w-full">
              <div className="w-full max-w-full">
                <Outlet />
              </div>
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
