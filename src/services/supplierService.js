import axios from '../axiosConfig';

// Get all suppliers for a user
export const getSuppliersByUserId = async (userId) => {
  try {
    const response = await axios.get(`/suppliers/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch suppliers');
  }
};

// Get supplier by ID
export const getSupplierById = async (id) => {
  try {
    const response = await axios.get(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier');
  }
};

// Create new supplier
export const createSupplier = async (supplier) => {
  try {
    const response = await axios.post('/suppliers', supplier);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create supplier');
  }
};

// Update existing supplier
export const updateSupplier = async (id, supplier) => {
  try {
    const response = await axios.put(`/suppliers/${id}`, supplier);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update supplier');
  }
};

// Delete supplier
export const deleteSupplier = async (id) => {
  try {
    await axios.delete(`/suppliers/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete supplier');
  }
};

// Search suppliers by name
export const searchSuppliersByName = async (userId, name) => {
  try {
    const response = await axios.get(`/suppliers/user/${userId}/search?name=${encodeURIComponent(name)}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search suppliers');
  }
};

// Get items for a specific supplier
export const getSupplierItems = async (supplierId) => {
  try {
    const response = await axios.get(`/suppliers/${supplierId}/items`);
    
    // Handle the response format: array of item strings
    if (Array.isArray(response.data)) {
      // If the response is an array of strings, convert them to objects
      const items = response.data.map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: index,
            name: item
          };
        } else {
          // If it's already an object, normalize it
          return {
            id: item.itemId || item.id || item._id || index,
            name: item.name || item.itemName || item.productName || item,
            description: item.description,
            price: item.price,
            category: item.category,
            quantity: item.quantity
          };
        }
      });
      return items;
    } else {
      return [];
    }
  } catch (error) {
    // If 404, it might mean no items exist for this supplier
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier items');
  }
};
