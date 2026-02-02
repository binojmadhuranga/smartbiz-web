import axios from "./axiosConfig";

/**
 * Send OTP to the user's email for password reset
 * @param {string} email - User's email address
 * @returns {Promise} - Response with success message
 */
export const sendOTP = async (email) => {
  const response = await axios.post("/auth/forgot-password", { email });
  return response.data;
};

/**
 * Reset password using OTP
 * @param {string} email - User's email address
 * @param {string} otp - OTP received in email
 * @param {string} newPassword - New password to set
 * @returns {Promise} - Response with success message
 */
export const resetPassword = async (email, otp, newPassword) => {
  const response = await axios.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return response.data;
};
