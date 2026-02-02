import axios from "../common/axiosConfig";


export const register = async (userData) => {
  const response = await axios.post("/auth/register", userData);
  return response.data;
};


export const login = async (email, password) => {
  const response = await axios.post("/auth/login", { email, password });
  return response.data;
};


export const sendOTP = async (email) => {
  const response = await axios.post("/auth/forgot-password", { email });
  return response.data;
};


export const resetPassword = async (email, otp, newPassword) => {
  const response = await axios.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return response.data;
};
