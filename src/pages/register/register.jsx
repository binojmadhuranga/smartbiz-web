// src/pages/register/Register.jsx
import React, { useState } from "react";
import axios from "../../axiosConfig";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    try {
      await axios.post("/auth/register", form);
      setMessage("Registration successful! Redirecting to login...");
      setMessageType("success");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
      setMessageType("error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-blue-300">
      <form onSubmit={handleSubmit} className="bg-white/90 p-12 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col gap-4">
        <h2 className="text-3xl font-extrabold mb-4 text-center text-blue-900 tracking-tight">Create Account</h2>
        <p className="text-center text-gray-500 mb-2">Fill out the form to register.</p>
        {message && (
          <div className={`mb-2 px-4 py-2 rounded text-center border animate-fade-in ${messageType === "success" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}>
            {message}
          </div>
        )}
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="w-full p-3 mb-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-blue-50"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          required
          className="w-full p-3 mb-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-blue-50"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full p-3 mb-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-blue-50"
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-3 mb-4 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-blue-50"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors shadow-md"
        >
          Register
        </button>
        <div className="mt-4 text-center">
          <a href="/login" className="text-blue-900 hover:underline">Already have an account? Login</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
