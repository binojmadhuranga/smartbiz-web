import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSale, getSaleById, updateSale } from '../../services/user/saleService';
import { useAuth } from '../../context/AuthContext';

const SalesForm = () => {
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  // Calculate total amount for preview
  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.price) || 0;
    return quantity * price;
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.productName.trim()) {
      errors.productName = 'Product name is required';
    } else if (formData.productName.trim().length < 2) {
      errors.productName = 'Product name must be at least 2 characters';
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    } else if (!Number.isInteger(parseFloat(formData.quantity))) {
      errors.quantity = 'Quantity must be a whole number';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    } else if (parseFloat(formData.price) > 999999.99) {
      errors.price = 'Price cannot exceed $999,999.99';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Load sale data for editing
  const loadSaleData = async () => {
    try {
      setLoadingData(true);
      setError('');
      const sale = await getSaleById(id);
      
      setFormData({
        productName: sale.productName,
        quantity: sale.quantity.toString(),
        price: sale.price.toString()
      });
    } catch (error) {
      console.error('Error loading sale:', error);
      setError('Failed to load sale data');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Sale not found');
      }
    } finally {
      setLoadingData(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const saleData = {
        productName: formData.productName.trim(),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price)
      };
      
      if (isEditMode) {
        await updateSale(id, saleData);
      } else {
        await createSale(saleData);
      }
      
      // Navigate back to sales list
      navigate('/dashboard/sales');
    } catch (error) {
      console.error('Error saving sale:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 400) {
        setError('Invalid data provided. Please check your inputs.');
      } else {
        setError(isEditMode ? 'Failed to update sale' : 'Failed to create sale');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/dashboard/sales');
  };

  // Load data on mount for edit mode
  useEffect(() => {
    if (isEditMode) {
      loadSaleData();
    }
  }, [isEditMode, id]);

  // Loading state for data fetch
  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2 xs:p-3 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <button
            onClick={handleCancel}
            className="p-1.5 md:p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Sale' : 'Record New Sale'}
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 ml-7 md:ml-8">
          {isEditMode ? 'Update sale information' : 'Enter sale details below'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="max-w-2xl bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-100 mb-2">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm md:text-base ${
                validationErrors.productName 
                  ? 'border-red-400 bg-red-900/20 text-gray-100' 
                  : 'bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400'
              } disabled:bg-gray-800/50 disabled:text-gray-500`}
              placeholder="Enter product name"
            />
            {validationErrors.productName && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.productName}</p>
            )}
          </div>

          {/* Quantity and Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-100 mb-2">
                Quantity <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                disabled={loading}
                min="1"
                step="1"
                className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm md:text-base ${
                  validationErrors.quantity 
                    ? 'border-red-400 bg-red-900/20 text-gray-100' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400'
                } disabled:bg-gray-800/50 disabled:text-gray-500`}
                placeholder="0"
              />
              {validationErrors.quantity && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.quantity}</p>
              )}
            </div>

            {/* Unit Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-100 mb-2">
                Unit Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
                min="0.01"
                step="0.01"
                className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm md:text-base ${
                  validationErrors.price 
                    ? 'border-red-400 bg-red-900/20 text-gray-100' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400'
                } disabled:bg-gray-800/50 disabled:text-gray-500`}
                placeholder="0.00"
              />
              {validationErrors.price && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.price}</p>
              )}
            </div>
          </div>

          {/* Total Amount Preview */}
          {(formData.quantity && formData.price) && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-300">Total Amount:</span>
                <span className="text-lg font-bold text-green-400">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
              <p className="text-xs text-green-400 mt-1">
                {formData.quantity} × {formatCurrency(parseFloat(formData.price) || 0)}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700/50">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial px-6 py-2.5 md:py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </div>
              ) : (
                isEditMode ? 'Update Sale' : 'Record Sale'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 sm:flex-initial px-6 py-2.5 md:py-3 bg-gray-700 text-gray-100 font-medium rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 text-sm md:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg max-w-2xl">
        <h3 className="text-sm font-medium text-blue-300 mb-2">Note:</h3>
        <ul className="text-xs text-blue-200 space-y-1">
          <li>• The total amount will be calculated automatically</li>
          <li>• Sale date will be recorded as the current date and time</li>
          <li>• All fields marked with (*) are required</li>
        </ul>
      </div>
    </div>
  );
};

export default SalesForm;