import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCustomer, updateCustomer, getCustomerById } from '../../services/customerService';

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch customer data for editing
  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        try {
          setLoading(true);
          const customer = await getCustomerById(id);
          setFormData({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            city: customer.city || '',
            state: customer.state || '',
            zipCode: customer.zipCode || '',
            status: customer.status || 'Active'
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Customer name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isEdit) {
        await updateCustomer(id, formData);
      } else {
        await createCustomer(formData);
      }

      navigate('/dashboard/customers');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/customers');
  };

  if (loading && isEdit) {
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
              {isEdit ? 'Edit Customer' : 'Add New Customer'}
            </h1>
          </div>
          <p className="text-gray-600 text-sm lg:text-base xl:text-lg">
            {isEdit ? 'Update the customer information below.' : 'Fill in the details to create a new customer.'}
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
            {/* Customer Name */}
            <div>
              <label htmlFor="name" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
                Customer Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 lg:gap-8 xl:gap-10">
              <div>
                <label htmlFor="email" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="customer@example.com"
                  className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                  className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
                />
              </div>
          </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter street address"
                className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
              />
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
              <div>
                <label htmlFor="city" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
                  Zip Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="Enter zip code"
                  className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
                />
              </div>
          </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 lg:px-4 xl:px-5 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 pt-6 lg:pt-8 xl:pt-10 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 sm:flex-none sm:order-1 bg-gray-100 text-gray-700 px-6 lg:px-8 xl:px-10 py-2 lg:py-3 xl:py-4 rounded-lg lg:rounded-xl font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base xl:text-lg"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none sm:order-2 bg-green-600 text-white px-6 lg:px-8 xl:px-10 py-2 lg:py-3 xl:py-4 rounded-lg lg:rounded-xl font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base xl:text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEdit ? 'Update Customer' : 'Create Customer'
                )}
              </button>
            </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default CustomerForm;