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

// Download user's latest payment file (Admin only)
export const downloadUserPaymentFile = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/payments/download`, {
      responseType: 'blob', // Important for handling binary data
    });
    
    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'payment-file';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    return {
      data: response.data,
      filename: filename,
      contentType: response.headers['content-type']
    };
  } catch (error) {
    console.error(`Error downloading payment file for user ${userId}:`, error);
    throw error;
  }
};

// Get user payment file URL for preview (Admin only)
export const getUserPaymentFileUrl = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/payments/download`, {
      responseType: 'blob',
    });
    
    // Create blob URL for preview
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = URL.createObjectURL(blob);
    
    return {
      url: url,
      contentType: response.headers['content-type'],
      filename: response.headers['content-disposition']?.match(/filename="?([^"]+)"?/)?.[1] || 'payment-file'
    };
  } catch (error) {
    console.error(`Error getting payment file URL for user ${userId}:`, error);
    throw error;
  }
};