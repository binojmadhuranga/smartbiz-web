import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductById } from '../../services/productService';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unitBuyingPrice: '',
    unitSellingPrice: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  // Fetch product data for edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id, isEditMode]);

  const fetchProduct = async () => {
    try {
      setFetchLoading(true);
      setError('');
      const product = await getProductById(id);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        quantity: product.quantity?.toString() || '',
        unitBuyingPrice: product.unitBuyingPrice?.toString() || '',
        unitSellingPrice: product.unitSellingPrice?.toString() || ''
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
      setError('Product name is required');
      return;
    }

    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    if (!formData.unitBuyingPrice || isNaN(formData.unitBuyingPrice) || parseFloat(formData.unitBuyingPrice) <= 0) {
      setError('Unit buying price must be a positive number');
      return;
    }

    if (!formData.unitSellingPrice || isNaN(formData.unitSellingPrice) || parseFloat(formData.unitSellingPrice) <= 0) {
      setError('Unit selling price must be a positive number');
      return;
    }

    if (parseFloat(formData.unitSellingPrice) <= parseFloat(formData.unitBuyingPrice)) {
      setError('Selling price should be higher than buying price');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare data with proper number formatting
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        quantity: parseInt(formData.quantity),
        unitBuyingPrice: parseFloat(formData.unitBuyingPrice),
        unitSellingPrice: parseFloat(formData.unitSellingPrice)
      };

      if (isEditMode) {
        await updateProduct(id, productData);
      } else {
        await createProduct(productData);
      }

      // Navigate back to products list
      navigate('/dashboard/products');
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
    navigate('/dashboard/products');
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
        <p className="text-gray-600">
          {isEditMode ? 'Update the product information below.' : 'Fill in the details to create a new product.'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-vertical"
            />
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              min="1"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              required
            />
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit Buying Price */}
            <div>
              <label htmlFor="unitBuyingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Unit Buying Price ($) *
              </label>
              <input
                type="number"
                id="unitBuyingPrice"
                name="unitBuyingPrice"
                value={formData.unitBuyingPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                required
              />
            </div>

            {/* Unit Selling Price */}
            <div>
              <label htmlFor="unitSellingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Unit Selling Price ($) *
              </label>
              <input
                type="number"
                id="unitSellingPrice"
                name="unitSellingPrice"
                value={formData.unitSellingPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Profit Margin Display */}
          {formData.unitBuyingPrice && formData.unitSellingPrice && 
           !isNaN(formData.unitBuyingPrice) && !isNaN(formData.unitSellingPrice) && 
           parseFloat(formData.unitSellingPrice) > parseFloat(formData.unitBuyingPrice) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-800">Profit Information</span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                <p>Profit per unit: ${(parseFloat(formData.unitSellingPrice) - parseFloat(formData.unitBuyingPrice)).toFixed(2)}</p>
                <p>Profit margin: {(((parseFloat(formData.unitSellingPrice) - parseFloat(formData.unitBuyingPrice)) / parseFloat(formData.unitBuyingPrice)) * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
