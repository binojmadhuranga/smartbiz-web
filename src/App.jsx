import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/register";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard"
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
  const { token, role } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user"
        element={
          <ProtectedRoute requiredRole="USER">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          token ? (
            role === "ADMIN" ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/user" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route path="/unauthorized" element={<p>Unauthorized Access</p>} />
      <Route path="*" element={<p>404 - Page not found</p>} />
    </Routes>
  );
}

export default App;
