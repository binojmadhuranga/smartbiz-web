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
    <div>
      <h1>Welcome to Home Page 🎉</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
