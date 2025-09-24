import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/register";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/Admin/AdminDashboard"
import ManageUsers from "./pages/Admin/ManageUsers";
import ManagePlans from "./pages/Admin/ManagePlans";
import DashboardLayout from "./pages/User/DashboardLayout";
import Overview from "./pages/User/Overview";
import Products from "./pages/User/Products";
import ProductForm from "./pages/User/ProductForm";
import Suppliers from "./pages/User/Suppliers";
import SupplierForm from "./pages/User/SupplierForm";
import Employees from "./pages/User/Employees";
import EmployeeForm from "./pages/User/EmployeeForm";
import Customers from "./pages/User/Customers";
import CustomerForm from "./pages/User/CustomerForm";
import Sales from "./pages/User/Sales";
import SalesForm from "./pages/User/SalesForm";
import Packages from "./pages/user/Packages";
import ProfileManage from "./pages/User/ProfileManage";
import Report from "./pages/User/Report";
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
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manage-plans"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ManagePlans />
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
        <Route path="customers" element={<Customers />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id/edit" element={<CustomerForm />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/new" element={<EmployeeForm />} />
        <Route path="employees/:id/edit" element={<EmployeeForm />} />
        <Route path="sales" element={<Sales />} />
        <Route path="sales/new" element={<SalesForm />} />
        <Route path="sales/:id/edit" element={<SalesForm />} />
        <Route path="packages" element={<Packages />} />
        <Route path="profile" element={<ProfileManage />} />
        <Route path="reports" element={<Report />} />
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
