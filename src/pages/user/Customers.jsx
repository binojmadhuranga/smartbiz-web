import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllCustomers, deleteCustomer, searchCustomersByName } from '../../services/customerService';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllCustomers();
      
      // Normalize customer data to ensure consistent ID field
      const normalizedCustomers = data.map(customer => ({
        ...customer,
        id: customer.id || customer._id || customer.customerId || customer.customer_id
      }));
      
      setCustomers(normalizedCustomers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search customers
  const searchCustomers = useCallback(async (term) => {
    if (!term.trim()) {
      fetchCustomers();
      return;
    }

    try {
      setIsSearching(true);
      setError('');
      const data = await searchCustomersByName(term);
      
      // Normalize customer data to ensure consistent ID field
      const normalizedCustomers = data.map(customer => ({
        ...customer,
        id: customer.id || customer._id || customer.customerId || customer.customer_id
      }));
      
      setCustomers(normalizedCustomers);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  }, [fetchCustomers]);

  // Handle delete customer
  const handleDelete = async (id) => {
    if (!id || id === 'undefined') {
      setError('Invalid customer ID for delete operation');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        setCustomers(customers.filter(customer => customer.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Handle search input with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        searchCustomers(searchTerm);
      } else {
        fetchCustomers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchCustomers, fetchCustomers]);

  // Initial load
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="p-2 xs:p-3 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage your customer database</p>
          </div>
          <Link
            to="/dashboard/customers/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Customers
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Customers Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg lg:rounded-xl shadow-md lg:shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Customer Info
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 lg:px-6 py-8 lg:py-12 text-center text-gray-500 text-sm lg:text-base">
                    {searchTerm ? 'No customers found matching your search.' : 'No customers found. Create your first customer!'}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base font-medium text-gray-900">{customer.name}</div>
                      <div className="text-xs lg:text-sm text-gray-500">ID: {customer.id}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base text-gray-900">{customer.email || 'N/A'}</div>
                      <div className="text-xs lg:text-sm text-gray-500">{customer.phone || 'N/A'}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base text-gray-900">{customer.address || 'N/A'}</div>
                      <div className="text-xs lg:text-sm text-gray-500">{customer.city || ''} {customer.state || ''}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <span className={`inline-flex px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm font-semibold rounded-full ${
                        customer.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/dashboard/customers/${customer.id}/edit`}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customers Cards - Mobile */}
      <div className="md:hidden space-y-3 xs:space-y-4">
        {customers.length === 0 ? (
          <div className="bg-white rounded-lg p-4 xs:p-6 text-center text-gray-500">
            <svg className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-gray-400 mb-2 xs:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-base xs:text-lg font-medium text-gray-900 mb-1 xs:mb-2">
              {searchTerm ? 'No customers found' : 'No customers yet'}
            </p>
            <p className="text-sm xs:text-base text-gray-500 mb-3 xs:mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Create your first customer to get started.'}
            </p>
            {!searchTerm && (
              <Link
                to="/dashboard/customers/new"
                className="inline-flex items-center px-3 xs:px-4 py-2 bg-green-600 text-white text-sm xs:text-base font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Customer
              </Link>
            )}
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Customer Header */}
              <div className="p-3 xs:p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-gray-900 text-base xs:text-lg truncate">{customer.name}</h3>
                    <p className="text-xs xs:text-sm text-gray-600 mt-1">ID: {customer.id}</p>
                  </div>
                  <div className="flex space-x-1 xs:space-x-2 flex-shrink-0">
                    <Link
                      to={`/dashboard/customers/${customer.id}/edit`}
                      className="p-1.5 xs:p-2 text-green-600 hover:bg-green-50 rounded-md xs:rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="p-1.5 xs:p-2 text-red-600 hover:bg-red-50 rounded-md xs:rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 xs:space-x-2">
                    <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs xs:text-sm text-gray-500">Status:</span>
                  </div>
                  <span className={`inline-flex px-1.5 xs:px-2 py-0.5 xs:py-1 text-xs font-semibold rounded-full ${
                    customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.status || 'Active'}
                  </span>
                </div>

                {/* Contact Information */}
                <div className="space-y-1.5 xs:space-y-2">
                  <div className="flex items-center space-x-1.5 xs:space-x-2">
                    <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs xs:text-sm text-gray-500">Email:</span>
                    <span className="text-xs xs:text-sm text-gray-900 truncate">{customer.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 xs:space-x-2">
                    <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-xs xs:text-sm text-gray-500">Phone:</span>
                    <span className="text-xs xs:text-sm text-gray-900 truncate">{customer.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-start space-x-1.5 xs:space-x-2">
                    <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-xs xs:text-sm text-gray-900 truncate">
                        {customer.address ? `${customer.address}, ${customer.city || ''} ${customer.state || ''}` : 'No address'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Customers;