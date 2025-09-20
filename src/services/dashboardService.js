import api from '../axiosConfig';

const DASHBOARD_BASE_URL = '/dashboard';

/**
 * Get dashboard statistics with optional filter
 * @param {string} filter - Filter type (monthly, yearly, weekly, daily)
 * @returns {Promise<Object>} Dashboard statistics object
 */
export const getDashboardStats = async (filter = 'monthly') => {
  try {
    const response = await api.get(`${DASHBOARD_BASE_URL}?filter=${filter}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Get dashboard data for a specific date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Dashboard statistics for date range
 */
export const getDashboardStatsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`${DASHBOARD_BASE_URL}?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats by date range:', error);
    throw error;
  }
};

/**
 * Get real-time dashboard updates
 * @returns {Promise<Object>} Real-time dashboard statistics
 */
export const getRealTimeDashboardStats = async () => {
  try {
    const response = await api.get(`${DASHBOARD_BASE_URL}/realtime`);
    return response.data;
  } catch (error) {
    console.error('Error fetching real-time dashboard stats:', error);
    throw error;
  }
};

/**
 * Get sales trend data for dashboard charts
 * @param {string} period - Period for trend data (7days, 30days, 90days, 1year)
 * @returns {Promise<Array>} Sales trend data array
 */
export const getSalesTrend = async (period = '30days') => {
  try {
    const response = await api.get(`${DASHBOARD_BASE_URL}/sales-trend?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales trend:', error);
    throw error;
  }
};

/**
 * Get dashboard summary for specific user
 * @param {number} userId - User ID (optional, uses current user if not provided)
 * @param {string} filter - Filter type
 * @returns {Promise<Object>} User-specific dashboard data
 */
export const getUserDashboardStats = async (userId = null, filter = 'monthly') => {
  try {
    const url = userId 
      ? `${DASHBOARD_BASE_URL}/user/${userId}?filter=${filter}`
      : `${DASHBOARD_BASE_URL}?filter=${filter}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error);
    throw error;
  }
};

export default {
  getDashboardStats,
  getDashboardStatsByDateRange,
  getRealTimeDashboardStats,
  getSalesTrend,
  getUserDashboardStats
};