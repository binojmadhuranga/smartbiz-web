// src/pages/home/Home.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-900">Welcome!</h1>
        <p className="mb-6">You are logged in.</p>
        <button
          onClick={handleLogout}
          className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
