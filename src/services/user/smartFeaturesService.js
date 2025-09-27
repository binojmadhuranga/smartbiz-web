import axiosInstance from '../common/axiosConfig';

const BASE_URL = '/account';

// Get current user's account information including plan
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/me`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    
    let errorMessage = 'Failed to fetch user information';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied.';
    } else if (error.response?.status === 404) {
      errorMessage = 'User not found.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    throw new Error(errorMessage);
  }
};

// Check if user has PRO plan access
export const hasProPlanAccess = async () => {
  try {
    const user = await getCurrentUser();
    return user.plan === 'PRO';
  } catch (error) {
    console.error('Error checking PRO plan access:', error);
    return false;
  }
};

// Get user plan information
export const getUserPlan = async () => {
  try {
    const user = await getCurrentUser();
    return {
      plan: user.plan,
      hasProAccess: user.plan === 'PRO',
      name: user.name,
      email: user.email
    };
  } catch (error) {
    console.error('Error getting user plan:', error);
    throw error;
  }
};