import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEmployee, updateEmployee, getEmployeeById } from '../../services/employeeService';

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    salary: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  // Get current user ID from JWT token
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || payload.sub;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  };

  const userId = getCurrentUserId();

  // Fetch employee data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchEmployee();
    }
  }, [isEditMode, id]);

  const fetchEmployee = async () => {
    try {
      setFetchLoading(true);
      setError('');
      const employee = await getEmployeeById(id);
      setFormData({
        name: employee.name || '',
        role: employee.role || '',
        email: employee.email || '',
        salary: employee.salary ? employee.salary.toString() : ''
      });
    } catch (err) {
      setError(err.message);
      // If unauthorized, redirect to login
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Employee name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Salary validation (if provided)
    if (formData.salary && (isNaN(formData.salary) || parseFloat(formData.salary) < 0)) {
      setError('Salary must be a valid positive number');
      return;
    }

    if (!userId) {
      setError('User authentication required. Please login again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare data with proper formatting
      const employeeData = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        email: formData.email.trim(),
        salary: formData.salary ? parseFloat(formData.salary) : null,
        userId: userId
      };

      if (isEditMode) {
        await updateEmployee(id, employeeData);
      } else {
        await createEmployee(employeeData);
      }

      // Navigate back to employees list
      navigate('/dashboard/employees');
    } catch (err) {
      setError(err.message);
      // If unauthorized, redirect to login
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/employees');
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 xl:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8 xl:mb-10">
          <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
              {isEditMode ? 'Edit Employee' : 'Add New Employee'}
            </h1>
          </div>
          <p className="text-gray-600 text-sm lg:text-base xl:text-lg">
            {isEditMode ? 'Update the employee information below.' : 'Fill in the details to create a new employee.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 lg:mb-8 bg-red-100 border border-red-400 text-red-700 px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 rounded-lg lg:rounded-xl text-sm lg:text-base xl:text-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md lg:shadow-lg p-6 lg:p-8 xl:p-10">
          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 xl:space-y-10">

          {/* Employee Name */}
          <div>
            <label htmlFor="name" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
              Employee Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter employee name"
              className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
              Role/Position
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              placeholder="Enter employee role or position (optional)"
              className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
              required
            />
          </div>

          {/* Salary */}
          <div>
            <label htmlFor="salary" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
              Salary
            </label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="Enter salary amount (optional)"
              className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
              min="0"
              step="0.01"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 pt-6 lg:pt-8 xl:pt-10 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 lg:px-8 xl:px-10 py-3 lg:py-4 xl:py-5 border border-gray-300 text-gray-700 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm lg:text-base xl:text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 lg:px-8 xl:px-10 py-3 lg:py-4 xl:py-5 bg-green-600 text-white rounded-lg lg:rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm lg:text-base xl:text-lg"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Employee' : 'Create Employee')}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default EmployeeForm;