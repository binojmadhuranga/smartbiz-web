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

// Get business suggestions from AI
export const getBusinessSuggestions = async (filter = 'weekly') => {
  try {
    const response = await axiosInstance.get('/ai/suggestions', {
      params: { filter }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching business suggestions:', error);
    
    let errorMessage = 'Failed to fetch business suggestions';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied. PRO plan required for AI suggestions.';
    } else if (error.response?.status === 404) {
      errorMessage = 'AI suggestions service not available.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    throw new Error(errorMessage);
  }
};

// Generate creative post content
export const generatePost = async () => {
  try {
    const response = await axiosInstance.get('/posts/generate');
    return response.data;
  } catch (error) {
    console.error('Error generating post:', error);
    
    let errorMessage = 'Failed to generate post content';
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied. PRO plan required for content generation.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Content generation service not available.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    throw new Error(errorMessage);
  }
};