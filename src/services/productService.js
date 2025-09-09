import axios from '../axiosConfig';

// Get all products
export const getAllProducts = async () => {
  try {
    const response = await axios.get('/items');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`/items/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch product');
  }
};

// Create new product
export const createProduct = async (product) => {
  try {
    const response = await axios.post('/items', product);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
};

// Update existing product
export const updateProduct = async (id, product) => {
  try {
    const response = await axios.put(`/items/${id}`, product);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    await axios.delete(`/items/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};
