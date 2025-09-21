import api from '../common/axiosConfig';

const SALES_BASE_URL = '/sales';

/**
 * Create a new sale
 * @param {Object} saleData - Sale data containing productName, quantity, price
 * @returns {Promise<Object>} Created sale with auto-calculated totalAmount and saleDate
 */
export const createSale = async (saleData) => {
  try {
    const response = await api.post(SALES_BASE_URL, saleData);
    return response.data;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

/**
 * Get all sales
 * @returns {Promise<Array>} Array of all sales
 */
export const getAllSales = async () => {
  try {
    const response = await api.get(SALES_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
};

/**
 * Get sale by ID
 * @param {number} saleId - Sale ID
 * @returns {Promise<Object>} Sale object
 */
export const getSaleById = async (saleId) => {
  try {
    const response = await api.get(`${SALES_BASE_URL}/${saleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sale:', error);
    throw error;
  }
};

/**
 * Update sale by ID
 * @param {number} saleId - Sale ID
 * @param {Object} saleData - Updated sale data containing productName, quantity, price
 * @returns {Promise<Object>} Updated sale object
 */
export const updateSale = async (saleId, saleData) => {
  try {
    const response = await api.put(`${SALES_BASE_URL}/${saleId}`, saleData);
    return response.data;
  } catch (error) {
    console.error('Error updating sale:', error);
    throw error;
  }
};

/**
 * Delete sale by ID
 * @param {number} saleId - Sale ID
 * @returns {Promise<Object>} Deletion confirmation message
 */
export const deleteSale = async (saleId) => {
  try {
    const response = await api.delete(`${SALES_BASE_URL}/${saleId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw error;
  }
};

/**
 * Search sales by product name
 * @param {string} searchTerm - Search term for product name
 * @returns {Promise<Array>} Filtered sales array
 */
export const searchSales = async (searchTerm) => {
  try {
    const response = await api.get(`${SALES_BASE_URL}?search=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching sales:', error);
    throw error;
  }
};

/**
 * Get sales statistics (if backend supports)
 * @returns {Promise<Object>} Sales statistics
 */
export const getSalesStats = async () => {
  try {
    const response = await api.get(`${SALES_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    throw error;
  }
};

export default {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  searchSales,
  getSalesStats
};