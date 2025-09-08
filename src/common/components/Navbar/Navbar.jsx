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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left side: Mobile menu button (if enabled) and Logo */}
        <div className="flex items-center">
          {showMobileMenu && (
            <button
              onClick={onMenuToggle}
              className={`lg:hidden mr-3 p-2 rounded-md text-gray-400 hover:text-white ${menuButtonHover} focus:outline-none focus:ring-2 ${focusRing}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <img 
            src={logo} 
            alt="SmartBiz Logo" 
            className="h-40 w-auto"
          />
        </div>

        {/* Right side: Profile and Sign Out */}
        <div className="flex items-center gap-4">
          {/* Profile Avatar */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${avatarBg} rounded-full flex items-center justify-center`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className={`w-5 h-5 ${avatarIconColor}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;