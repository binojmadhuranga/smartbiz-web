import axios from '../axiosConfig';

// Get all customers for the current user
export const getAllCustomers = async () => {
  try {
    const response = await axios.get('/customers');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customers');
  }
};

// Get customer by ID
export const getCustomerById = async (id) => {
  try {
    const response = await axios.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer');
  }
};

// Create a new customer
export const createCustomer = async (customerData) => {
  try {
    const response = await axios.post('/customers', customerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create customer');
  }
};

// Update a customer
export const updateCustomer = async (customerId, customerData) => {
  try {
    const response = await axios.put(`/customers/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update customer');
  }
};

// Delete a customer
export const deleteCustomer = async (customerId) => {
  try {
    const response = await axios.delete(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete customer');
  }
};

// Search customers by name (if needed)
export const searchCustomersByName = async (searchTerm) => {
  try {
    const response = await axios.get('/customers/search', {
      params: { name: searchTerm }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search customers');
  }
};