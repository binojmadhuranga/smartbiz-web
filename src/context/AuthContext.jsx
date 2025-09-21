import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [plan, setPlan] = useState(localStorage.getItem("plan") || "NORMAL");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");

  // Create user object for easier access
  const user = {
    id: userId,
    name: name,
    role: role,
    plan: plan
  };

  const login = (token, role, name, planType = "NORMAL", id = "") => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("name", name);
    localStorage.setItem("plan", planType);
    localStorage.setItem("userId", id);
    setToken(token);
    setRole(role);
    setName(name);
    setPlan(planType);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("plan");
    localStorage.removeItem("userId");
    setRole("");
    setToken(null);
    setName("");
    setPlan("NORMAL");
    setUserId("");
  };

  const updateUser = (updatedUser) => {
    if (updatedUser.name) {
      setName(updatedUser.name);
      localStorage.setItem("name", updatedUser.name);
    }
    if (updatedUser.plan) {
      setPlan(updatedUser.plan);
      localStorage.setItem("plan", updatedUser.plan);
    }
    if (updatedUser.id) {
      setUserId(updatedUser.id.toString());
      localStorage.setItem("userId", updatedUser.id.toString());
    }
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      role, 
      name, 
      plan, 
      user,
      login, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
