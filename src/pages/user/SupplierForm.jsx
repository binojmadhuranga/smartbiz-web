import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSupplier, updateSupplier, getSupplierById } from '../../services/supplierService';
import { getProductsByUserId } from '../../services/productService';

const SupplierForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id !== undefined && id !== null && id !== 'undefined' && id !== 'null';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    itemIds: []
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [itemsLoading, setItemsLoading] = useState(true);
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

  // Fetch supplier data for edit mode and items
  useEffect(() => {
    if (userId) {
      fetchItems();
    }
    if (isEditMode) {
      fetchSupplier();
    }
  }, [id, isEditMode, userId]);

  const fetchItems = async () => {
    try {
      setItemsLoading(true);
      const itemsData = await getProductsByUserId(userId);
      setItems(itemsData || []);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  };  const fetchSupplier = async () => {
    try {
      setFetchLoading(true);
      setError('');
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid supplier id');
      }
      const supplier = await getSupplierById(id);
      setFormData({
        name: supplier.name || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        itemIds: supplier.itemIds || []
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

  const handleItemChange = (itemId) => {
    setFormData(prev => ({
      ...prev,
      itemIds: prev.itemIds.includes(itemId)
        ? prev.itemIds.filter(id => id !== itemId)
        : [...prev.itemIds, itemId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Supplier name is required');
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare data
      const supplierData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        userId: userId,
        itemIds: formData.itemIds
      };

      if (isEditMode) {
        await updateSupplier(id, supplierData);
      } else {
        await createSupplier(supplierData);
      }

      // Navigate back to suppliers list
      navigate('/dashboard/suppliers');
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
    navigate('/dashboard/suppliers');
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
            {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
          </h1>
        </div>
        <p className="text-gray-600">
          {isEditMode ? 'Update the supplier information below.' : 'Fill in the details to create a new supplier.'}
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
          {/* Supplier Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Supplier Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter supplier name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              required
            />
          </div>

          {/* Contact Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter supplier address (optional)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-vertical"
            />
          </div>

          {/* Items Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items
            </label>
            {itemsLoading ? (
              <div className="flex items-center justify-center py-4 border border-gray-300 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading items...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="p-4 border border-gray-300 rounded-lg text-center text-gray-500">
                No items available. Create an item first.
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {items.map((item) => (
                    <label key={item.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.itemIds.includes(item.id)}
                        onChange={() => handleItemChange(item.id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-900">{item.name}</span>
                      {item.description && (
                        <span className="ml-2 text-sm text-gray-500">({item.description})</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {formData.itemIds.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selected {formData.itemIds.length} item{formData.itemIds.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Contact Information Display */}
          {(formData.email || formData.phone) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-800">Contact Information</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                {formData.email && <p>Email: {formData.email}</p>}
                {formData.phone && <p>Phone: {formData.phone}</p>}
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
              {loading ? 'Saving...' : (isEditMode ? 'Update Supplier' : 'Add Supplier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
