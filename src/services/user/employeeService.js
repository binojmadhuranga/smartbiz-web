import axios from '../common/axiosConfig';


export const getAllEmployees = async (userId) => {
  try {
    const response = await axios.get('/employees', {
      data: { userId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch employees');
  }
};

// Get employee by ID
export const getEmployeeById = async (id) => {
  try {
    const response = await axios.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch employee');
  }
};

// Create a new employee
export const createEmployee = async (employeeData) => {
  try {
    const response = await axios.post('/employees', employeeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create employee');
  }
};

// Update an employee
export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await axios.put(`/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update employee');
  }
};

// Delete an employee
export const deleteEmployee = async (id) => {
  try {
    const response = await axios.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete employee');
  }
};

// Search employees by name (if needed)
export const searchEmployeesByName = async (userId, searchTerm) => {
  try {
    const response = await axios.get('/employees/search', {
      params: { name: searchTerm },
      
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search employees');
  }
};