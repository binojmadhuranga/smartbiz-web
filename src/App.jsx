import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/register";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/Admin/AdminDashboard"
import DashboardLayout from "./pages/User/DashboardLayout";
import Overview from "./pages/User/Overview";
import Products from "./pages/User/Products";
import ProductForm from "./pages/User/ProductForm";
import Suppliers from "./pages/User/Suppliers";
import SupplierForm from "./pages/User/SupplierForm";
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
        path="/dashboard/*"
        element={
          <ProtectedRoute requiredRole="USER">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard/overview" />} />
        <Route path="overview" element={<Overview />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="suppliers/new" element={<SupplierForm />} />
        <Route path="suppliers/:id/edit" element={<SupplierForm />} />
        <Route path="customers" element={<div className="p-6 animate-fade-in">Customers - Coming Soon</div>} />
        <Route path="employees" element={<div className="p-6 animate-fade-in">Employees - Coming Soon</div>} />
        <Route path="sales" element={<div className="p-6 animate-fade-in">Sales - Coming Soon</div>} />
        <Route path="reports" element={<div className="p-6 animate-fade-in">Reports - Coming Soon</div>} />
      </Route>

      <Route
        path="/user"
        element={<Navigate to="/dashboard" />}
      />

      <Route
        path="/"
        element={
          token ? (
            role === "ADMIN" ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/dashboard" />
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
