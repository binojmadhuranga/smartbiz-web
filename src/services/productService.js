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

// Get all products for a user
export const getProductsByUserId = async (userId) => {
  try {
    const response = await axios.get(`/items/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

// Search products by name
export const searchProductsByName = async (name) => {
  try {
    const response = await axios.get(`/items/search?name=${encodeURIComponent(name)}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search products');
  }
};

// Get suppliers for a specific product
export const getProductSuppliers = async (itemId) => {
  try {
    const response = await axios.get(`/items/${itemId}/suppliers`);
    
    // Handle the specific response format: array of supplier objects with name, supplierId, etc.
    if (Array.isArray(response.data)) {
      const suppliers = response.data.map(supplier => ({
        id: supplier.supplierId,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address
      }));
      return suppliers;
    } else {
      return [];
    }
  } catch (error) {
    // If 404, it might mean no suppliers exist for this item
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch product suppliers');
  }
};
