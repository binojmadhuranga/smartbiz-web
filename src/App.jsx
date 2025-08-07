// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/register";
import Home from "./pages/home/home";
import { useAuth } from "./context/AuthContext";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
