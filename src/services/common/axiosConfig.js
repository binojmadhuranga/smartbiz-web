import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to standardize error format
instance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Standardize error response format
    const standardError = {
      timestamp: new Date().toISOString(),
      status: error.response?.status || 500,
      error: error.response?.statusText || "Internal Server Error",
      message: error.response?.data?.message || error.message || "An error occurred"
    };

    // Replace the error response with standardized format
    if (error.response) {
      error.response.data = standardError;
    }

    return Promise.reject(standardError);
  }
);

export default instance;
