import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/register";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard"
import DashboardLayout from "./pages/user/DashboardLayout";
import Overview from "./pages/user/Overview";
import Products from "./pages/user/Products";
import ProductForm from "./pages/user/ProductForm";
import Suppliers from "./pages/user/Suppliers";
import SupplierForm from "./pages/user/SupplierForm";
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
        <Route path="customers" element={<div className="p-6">Customers - Coming Soon</div>} />
        <Route path="employees" element={<div className="p-6">Employees - Coming Soon</div>} />
        <Route path="sales" element={<div className="p-6">Sales - Coming Soon</div>} />
        <Route path="reports" element={<div className="p-6">Reports - Coming Soon</div>} />
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
