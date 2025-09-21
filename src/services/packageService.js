import api from '../axiosConfig';

const PACKAGE_BASE_URL = '/account';

/**
 * Request Pro plan upgrade by submitting payment slip
 * @param {string|number} userId - User ID
 * @param {File} paymentSlip - Payment slip file
 * @returns {Promise<Object>} Request submission response
 */
export const requestProPlanUpgrade = async (userId, paymentSlip) => {
  try {
    const formData = new FormData();
    formData.append('paymentSlip', paymentSlip);
    formData.append('requestedPlan', 'PRO');

    const response = await api.post(`${PACKAGE_BASE_URL}/${userId}/plan-request`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error requesting Pro plan upgrade:', error);
    
    // Handle different error scenarios
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Insufficient permissions to request plan upgrade.');
    } else if (error.response?.status === 404) {
      throw new Error('User not found.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid request data or file format.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to submit plan upgrade request. Please try again.');
    }
  }
};

/**
 * Get current user plan information
 * @param {string|number} userId - User ID (optional, uses current user if not provided)
 * @returns {Promise<Object>} User data with current plan
 */
export const getUserPlan = async (userId = null) => {
  try {
    const url = userId 
      ? `${PACKAGE_BASE_URL}/${userId}` 
      : `${PACKAGE_BASE_URL}/me`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching user plan:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('User not found.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch user plan.');
    }
  }
};

/**
 * Get available package plans with features
 * @returns {Array} Array of available plans with features
 */
export const getAvailablePlans = () => {
  return [
    {
      id: 'NORMAL',
      name: 'Normal',
      price: 0,
      currency: 'USD',
      features: [
        'Basic dashboard access',
        'Up to 50 products',
        'Up to 25 customers',
        'Basic reporting',
        'Email support'
      ]
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: 29.99,
      currency: 'USD',
      features: [
        'Advanced dashboard access',
        'Unlimited products',
        'Unlimited customers',
        'Advanced reporting & analytics',
        'Priority support',
        'API access',
        'Custom integrations',
        'Multi-user support'
      ]
    }
  ];
};

/**
 * Check if user has pro features
 * @param {string} plan - Current user plan
 * @returns {boolean} True if user has pro plan
 */
export const hasProFeatures = (plan) => {
  return plan === 'PRO';
};

/**
 * Get plan display information
 * @param {string} plan - Plan type
 * @returns {Object} Plan display information
 */
export const getPlanDisplayInfo = (plan) => {
  const planInfo = {
    NORMAL: {
      name: 'Normal',
      color: 'blue',
      badge: 'Free'
    },
    PRO: {
      name: 'Pro',
      color: 'green',
      badge: 'Premium'
    }
  };

  return planInfo[plan] || planInfo.NORMAL;
};

export default {
  requestProPlanUpgrade,
  getUserPlan,
  getAvailablePlans,
  hasProFeatures,
  getPlanDisplayInfo
};