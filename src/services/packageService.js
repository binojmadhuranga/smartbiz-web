import api from '../axiosConfig';

const PACKAGE_BASE_URL = '/account';

/**
 * Update user plan (upgrade/downgrade)
 * @param {string|number} userId - User ID
 * @param {string} plan - Plan type ("NORMAL" or "PRO")
 * @returns {Promise<Object>} Updated user data with new plan
 */
export const updateUserPlan = async (userId, plan) => {
  try {
    const response = await api.put(`${PACKAGE_BASE_URL}/${userId}/plan`, {
      plan: plan
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user plan:', error);
    
    // Handle different error scenarios
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Insufficient permissions to update plan.');
    } else if (error.response?.status === 404) {
      throw new Error('User not found.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid plan type or request data.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to update plan. Please try again.');
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
 * @returns {Promise<Array>} Array of available plans with features
 */
export const getAvailablePlans = async () => {
  try {
    const response = await api.get(`${PACKAGE_BASE_URL}/plans`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available plans:', error);
    
    // Return default plans if API is not available
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
  }
};

/**
 * Upgrade user to Pro plan
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} Updated user data
 */
export const upgradeToPro = async (userId) => {
  return updateUserPlan(userId, 'PRO');
};

/**
 * Downgrade user to Normal plan
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} Updated user data
 */
export const downgradeToNormal = async (userId) => {
  return updateUserPlan(userId, 'NORMAL');
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
  updateUserPlan,
  getUserPlan,
  getAvailablePlans,
  upgradeToPro,
  downgradeToNormal,
  hasProFeatures,
  getPlanDisplayInfo
};