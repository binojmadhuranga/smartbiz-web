import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../common/components/Input/Input";
import { sendOTP, resetPassword } from "../../services/auth/authService";

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await sendOTP(email);
            setSuccess(response || "OTP sent to registered email");
            setStep(2);
        } catch (err) {
            setError(err.message || "Failed to send OTP. Please check your email.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password length
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);

        try {
            const response = await resetPassword(email, otp, newPassword);
            setSuccess(response || "Password reset successful!");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.message || "Failed to reset password. Please check your OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300">
            <div className="bg-white/90 p-6 md:p-10 lg:p-12 rounded-2xl shadow-2xl w-[95vw] sm:w-[85vw] md:w-full max-w-md md:max-w-lg lg:max-w-xl">
                <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-center text-green-800 tracking-tight">
                    Forgot Password
                </h2>
                <p className="text-center text-gray-500 mb-6">
                    {step === 1
                        ? "Enter your email to receive an OTP"
                        : "Enter the OTP and your new password"}
                </p>

                {error && (
                    <div className="mb-4 px-4 py-2 rounded text-center bg-red-100 text-red-700 border border-red-300 animate-fade-in">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 px-4 py-2 rounded text-center bg-green-100 text-green-700 border border-green-300 animate-fade-in">
                        {success}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                        <Input
                            label="Email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            type="email"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-800 text-white py-2 md:py-3 rounded-lg font-semibold text-base md:text-lg hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                        <Input
                            label="Email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            type="email"
                            required
                            disabled
                            className="bg-gray-100"
                        />
                        <Input
                            label="OTP"
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            type="text"
                            required
                        />
                        <Input
                            label="New Password"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            type="password"
                            required
                        />
                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            type="password"
                            required
                        />
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setOtp("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setError("");
                                    setSuccess("");
                                }}
                                className="w-1/2 bg-gray-500 text-white py-2 md:py-3 rounded-lg font-semibold text-base md:text-lg hover:bg-gray-600 transition-colors shadow-md"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-1/2 bg-green-800 text-white py-2 md:py-3 rounded-lg font-semibold text-base md:text-lg hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-green-800 hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
