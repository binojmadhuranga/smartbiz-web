import React from "react";
import logo from "../../../assets/logo.png";

const Navbar = ({ onLogout, onMenuToggle, showMobileMenu = false, variant = "default" }) => {
  const bgColor = variant === "dashboard" ? "bg-gray-800" : "bg-green-900";
  const avatarBg = variant === "dashboard" ? "bg-gray-600" : "bg-green-200";
  const avatarIconColor = variant === "dashboard" ? "text-gray-300" : "text-green-800";
  const menuButtonHover = variant === "dashboard" ? "hover:bg-gray-700" : "hover:bg-green-800";
  const focusRing = variant === "dashboard" ? "focus:ring-gray-500" : "focus:ring-green-500";

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
            <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${avatarBg} rounded-full flex items-center justify-center`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${avatarIconColor}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="bg-green-600 hover:bg-green-500 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200"
          >
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Log Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;