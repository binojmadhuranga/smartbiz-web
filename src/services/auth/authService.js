import axios from "../common/axiosConfig";

/**
 * User registration
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User/Business name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role (USER/ADMIN)
 * @returns {Promise} - Response with registration message
 */
export const register = async (userData) => {
  const response = await axios.post("/auth/register", userData);
  return response.data;
};

/**
 * User login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Response with token, role, and name
 */
export const login = async (email, password) => {
  const response = await axios.post("/auth/login", { email, password });
  return response.data;
};

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
