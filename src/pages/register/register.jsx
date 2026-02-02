import React, { useState } from "react";
import Input from "../../common/components/Input/Input";
import { useNavigate, Link } from "react-router-dom";
import { register as registerUser } from "../../services/auth/authService";

const Register = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "USER" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        if (form.password !== form.confirmPassword) {
            setMessage("Passwords do not match");
            setMessageType("error");
            return;
        }
        try {
            const response = await registerUser(form);
            const successMessage =
                typeof response === "string"
                    ? response
                    : response?.message || "Registration successful! Redirecting to login...";
            setMessage(successMessage);
            setMessageType("success");
            setTimeout(() => navigate("/login"), 1800);
        } catch (err) {
            const errorMessage =
                typeof err.response?.data === "string"
                    ? err.response?.data
                    : err.response?.data?.message || "Registration failed";
            setMessage(errorMessage);
            setMessageType("error");
        }
    };

    return (
    <div className="flex items-center justify-center h-screen overflow-hidden bg-gradient-to-br from-green-100 via-green-200 to-green-300">
    <form onSubmit={handleSubmit} className="bg-white/90 p-4 md:p-6 lg:p-8 rounded-2xl shadow-2xl 
           w-[95vw] sm:w-[85vw] md:max-w-md lg:max-w-lg flex flex-col gap-2 md:gap-3"
>
                <h1 className="text-xl md:text-2xl font-extrabold text-center mb-1 text-green-800">SmartBiz</h1>
                <p className="text-center text-gray-500 mb-2 text-xs">AI-Powered Business Management Suite</p>
                {message && (
                    <div className={`mb-1 px-2 py-1 rounded text-center border animate-fade-in text-xs ${messageType === "success" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}>
                        {message}
                    </div>
                )}
                <div className="flex justify-center mb-4">
                    <button type="button" className={`px-4 py-1 rounded-l-full font-semibold text-sm ${form.role === 'USER' ? 'bg-green-800 text-white' : 'bg-green-100 text-green-800'}`} onClick={() => setForm({ ...form, role: 'USER' })}>Business</button>
                    <button type="button" className={`px-4 py-1 rounded-r-full font-semibold border-l text-sm ${form.role === 'ADMIN' ? 'bg-green-800 text-white' : 'bg-green-100 text-green-800'}`} onClick={() => setForm({ ...form, role: 'ADMIN' })}>Admin</button>
                </div>
                <Input
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    type="email"
                    required
                />
                <Input
                    label="Business Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your business name"
                    required
                />
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative mb-2">
                    <Input
                        label={null}
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your Password"
                        required
                        className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                    </span>
                </div>
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative mb-2">
                    <Input
                        label={null}
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                    </span>
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-800 text-white py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-green-700 transition-colors shadow-md mt-2"
                >
                    Create Account
                </button>
                <div className="mt-2 text-center w-full">
                    <Link to="/login" className="text-green-800 hover:underline">
                        Already have an account? Log in
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Register;
