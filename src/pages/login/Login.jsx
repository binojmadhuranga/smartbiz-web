import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../common/components/Input/Input";
import { login as loginUser } from "../../services/auth/authService";

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
            const data = await loginUser(email, password);
            const { token, role, name } = data;
            login(token, role, name);
            if (role === "ADMIN") {
                navigate("/admin");
            } else if (role === "USER" || role === "BUSINESS_USER") {
                navigate("/dashboard");
            } else {
                setError("Unknown role");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300">
            <form onSubmit={handleSubmit} className="bg-white/90 p-6 md:p-10 lg:p-12 rounded-2xl shadow-2xl w-[95vw] sm:w-[85vw] md:w-full max-w-md md:max-w-lg lg:max-w-xl flex flex-col gap-4">

                <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-center text-green-800 tracking-tight"> SmartBiz</h2>
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
                    className="w-full bg-green-800 text-white py-2 md:py-3 rounded-lg font-semibold text-base md:text-lg hover:bg-green-700 transition-colors shadow-md"
                >
                    Login
                </button>
                <div className="mt-2 text-center">
                    <Link to="/forgot-password" className="text-sm text-green-800 hover:underline">
                        Forgot Password?
                    </Link>
                </div>
                <div className="mt-2 text-center">
                    <Link to="/register" className="text-green-800 hover:underline">
                        Don't have an account? Register
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
