import api from '../common/axiosConfig';

const PACKAGE_BASE_URL = '/account';

/*    // Return success response
    return {
      success: true,
      userId: userId,
      plan: 'PRO',
      message: 'Plan upgraded successfully'
    };
  } catch (error) {
    console.error('Error requesting Pro plan upgrade:', error);
    throw error; // Re-throw the error from uploadPaymentSlip or updatePlanToPro
  }
};nt slip for plan upgrade
 * @param {File} paymentSlip - Payment slip file
 * @returns {Promise<Object>} Upload response
 */
export const uploadPaymentSlip = async (paymentSlip) => {
  try {
    const formData = new FormData();
    formData.append('file', paymentSlip);

    const response = await api.post(`${PACKAGE_BASE_URL}/payments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading payment slip:', error);
    
    // Handle different error scenarios
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Insufficient permissions to upload payment slip.');
    } else if (error.response?.status === 404) {
      throw new Error('Upload endpoint not found.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid file format or request data.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to upload payment slip. Please try again.');
    }
  }
};



export const updatePlanToPro = async () => {
  try {
    const response = await api.put(`${PACKAGE_BASE_URL}/plan`, {
      plan: 'PRO'
    });
    return response.data; // Returns userId as number
  } catch (error) {
    console.error('Error updating plan:', error);
    
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


export const requestProPlanUpgrade = async (paymentSlip) => {
  try {
    // First upload the payment slip
    await uploadPaymentSlip(paymentSlip);
    
    // Then update the plan
    const userId = await updatePlanToPro();
    
    // Return success response
    return {
      success: true,
      userId: userId,
      plan: 'PRO',
      message: 'Plan upgraded successfully'
    };
  } catch (error) {
    console.error('Error requesting Pro plan upgrade:', error);
    throw error; // Re-throw the error from uploadPaymentSlip or updatePlanToPro
  }
};


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


export const hasProFeatures = (plan) => {
  return plan === 'PRO';
};


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
  uploadPaymentSlip,
  updatePlanToPro,
  requestProPlanUpgrade,
  getUserPlan,
  getAvailablePlans,
  hasProFeatures,
  getPlanDisplayInfo
};