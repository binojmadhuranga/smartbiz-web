import React, { useState, useEffect } from 'react';
import { createSupplier, updateSupplier } from '../../services/supplierService';

const SupplierModal = ({ isOpen, onClose, onSuccess, supplier, userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = Boolean(supplier);

  // Reset form when modal opens/closes or supplier changes
  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          name: supplier.name || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || ''
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: ''
        });
      }
      setError('');
    }
  }, [isOpen, supplier]);

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
        userId: userId
      };

      if (isEditMode) {
        await updateSupplier(supplier.id, supplierData);
      } else {
        await createSupplier(supplierData);
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-6 lg:p-8">
      <div className="bg-white rounded-lg max-w-md md:max-w-lg lg:max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 md:p-2"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4 md:space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 md:px-6 md:py-4 rounded-lg text-sm md:text-base">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
              Supplier Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter supplier name"
              className="w-full px-3 py-2 md:px-4 md:py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm md:text-base"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address (optional)"
              className="w-full px-3 py-2 md:px-4 md:py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm md:text-base"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number (optional)"
              className="w-full px-3 py-2 md:px-4 md:py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm md:text-base"
            />
          </div>

          {/* Address Field */}
          <div>
            <label htmlFor="address" className="block text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter address (optional)"
              rows={3}
              className="w-full px-3 py-2 md:px-4 md:py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-vertical text-sm md:text-base"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 pt-4 md:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm md:text-base order-2 md:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base order-1 md:order-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
              )}
              {loading ? 'Saving...' : (isEditMode ? 'Update Supplier' : 'Add Supplier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
