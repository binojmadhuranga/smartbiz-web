import React, { useState } from "react";
import logo from "../../../assets/logo.png";
import LogoutCard from "../LogoutCard/LogoutCard";
import { useAuth } from "../../../context/AuthContext";

const Navbar = ({ onLogout, onMenuToggle, showMobileMenu = false, variant = "default" }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { name } = useAuth();
  
  const bgColor = variant === "dashboard" ? "bg-gray-800" : 
                  variant === "admin" ? "bg-gradient-to-r from-gray-800 to-blue-200" : 
                  "bg-green-900";
  const avatarBg = variant === "dashboard" ? "bg-gray-600" : 
                   variant === "admin" ? "bg-blue-100" : 
                   "bg-green-200";
  const avatarIconColor = variant === "dashboard" ? "text-gray-300" : 
                          variant === "admin" ? "text-gray-700" : 
                          "text-green-800";
  const menuButtonHover = variant === "dashboard" ? "hover:bg-gray-700" : 
                          variant === "admin" ? "hover:bg-gray-600" : 
                          "hover:bg-green-800";
  const focusRing = variant === "dashboard" ? "focus:ring-gray-500" : 
                    variant === "admin" ? "focus:ring-blue-300" : 
                    "focus:ring-green-500";
  const logoutButtonBg = variant === "dashboard" ? "bg-gray-600" : 
                         variant === "admin" ? "bg-blue-600" : 
                         "bg-green-700";
  const logoutButtonHover = variant === "dashboard" ? "hover:bg-red-600" : 
                            variant === "admin" ? "hover:bg-red-500" : 
                            "hover:bg-red-600";
  const logoutIconColor = variant === "dashboard" ? "text-white" : 
                          variant === "admin" ? "text-white" : 
                          "text-white";

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <nav className={`w-full ${bgColor} text-white shadow-lg`}>
      <div className="max-w-[100vw]  px-3 sm:px-4 md:px-6 lg:pl-1 flex items-center justify-between h-[10vh]  md:h-[12vh] lg:h-[15vh] ">
        <div className="flex items-center">
          {showMobileMenu && (
            <button
              onClick={onMenuToggle}
              className={`lg:hidden mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-white ${menuButtonHover} focus:outline-none focus:ring-2 ${focusRing}`}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <img 
            src={logo} 
            alt="SmartBiz Logo" 
            className="hidden lg:block h-35 w-auto"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 ${avatarBg} rounded-full flex items-center justify-center`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 ${avatarIconColor}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {name && (
              <span className="hidden sm:block text-sm md:text-base lg:text-lg font-medium text-white">
                Hello, {name}
              </span>
            )}
          </div>

          <button
            onClick={handleLogoutClick}
            className={`${logoutButtonBg} ${logoutButtonHover} p-2 sm:p-2.5 md:p-3 rounded-md transition-colors duration-200 flex items-center justify-center`}
            title="Sign Out"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 ${logoutIconColor}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </div>

      <LogoutCard 
        isVisible={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </nav>
  );
};

export default Navbar;