import api from '../common/axiosConfig';

// Get all users with their plans (Admin only)
export const getAllUsersWithPlans = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users with plans:', error);
    throw error;
  }
};

// Update user plan (Admin only)
export const updateUserPlan = async (userId, plan) => {
  try {
    const response = await api.put(`/admin/users/${userId}/plan`, { plan });
    return response.data;
  } catch (error) {
    console.error(`Error updating plan for user ${userId}:`, error);
    throw error;
  }
};

// Get user by ID with plan details (Admin only)
export const getUserWithPlan = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId} with plan:`, error);
    throw error;
  }
};