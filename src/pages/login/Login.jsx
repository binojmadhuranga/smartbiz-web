// src/pages/login/Login.jsx
import React, { useState } from "react";
import axios from "../../axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Input";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.post("/auth/login", { email, password });
            login(res.data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
            <form onSubmit={handleSubmit} className="bg-white/90 p-12 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col gap-4">
                <h2 className="text-3xl font-extrabold mb-4 text-center text-blue-900 tracking-tight"> SmartBiz</h2>
                <p className="text-center text-gray-500 mb-2">Welcome back! Please login to your account.</p>
                {error && (
                    <div className="mb-2 px-4 py-2 rounded text-center bg-red-100 text-red-700 border border-red-300 animate-fade-in">
                        {error}
                    </div>
                )}
                <Input
                    label="Email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    required
                />
                <Input
                    label="Password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-colors shadow-md"
                >
                    Login
                </button>
                <div className="mt-4 text-center">
                    <Link to="/register" className="text-blue-900 hover:underline">
                        Don't have an account? Register
                    </Link>

                </div>
            </form>
        </div>
    );
};

export default Login;
