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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 xl:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 xl:p-10 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 lg:gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">Customer Management</h1>
              <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base xl:text-lg">Manage your customer database</p>
            </div>
            <Link
              to="/dashboard/customers/new"
              className="inline-flex items-center px-4 lg:px-6 xl:px-8 py-2 lg:py-3 xl:py-4 bg-green-600 text-white font-medium rounded-lg lg:rounded-xl hover:bg-green-700 transition-colors text-sm lg:text-base xl:text-lg"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 mr-2 lg:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 xl:p-10 mb-6 lg:mb-8">
          <div className="max-w-md lg:max-w-lg xl:max-w-xl">
            <label htmlFor="search" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
              Search Customers
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer name..."
                className="w-full pl-10 lg:pl-12 xl:pl-14 pr-4 lg:pr-6 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base xl:text-lg"
              />
              <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 xl:pl-5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {(isSearching || loading) && (
                <div className="absolute inset-y-0 right-0 pr-3 lg:pr-4 xl:pr-5 flex items-center">
                  <div className="animate-spin h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg lg:rounded-xl p-4 lg:p-6 xl:p-8 mb-6 lg:mb-8">
            <div className="flex">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-red-400 mr-2 lg:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm lg:text-base xl:text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-8 lg:p-12 xl:p-16">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4 lg:mb-6"></div>
              <p className="text-gray-600 text-sm lg:text-base xl:text-lg">Loading customers...</p>
            </div>
          </div>
        )}

        {/* Desktop Table */}
        {!loading && customers.length > 0 && (
          <div className="hidden md:block bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                      Customer Info
                    </th>
                    <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 xl:px-8 py-4 lg:py-5 xl:py-6 whitespace-nowrap">
                        <div>
                          <div className="text-sm lg:text-base xl:text-lg font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs lg:text-sm xl:text-base text-gray-500">ID: {customer.id}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 xl:px-8 py-4 lg:py-5 xl:py-6 whitespace-nowrap">
                        <div className="text-sm lg:text-base xl:text-lg text-gray-900">{customer.email || 'N/A'}</div>
                        <div className="text-xs lg:text-sm xl:text-base text-gray-500">{customer.phone || 'N/A'}</div>
                      </td>
                      <td className="px-4 lg:px-6 xl:px-8 py-4 lg:py-5 xl:py-6 whitespace-nowrap">
                        <div className="text-sm lg:text-base xl:text-lg text-gray-900">{customer.address || 'N/A'}</div>
                        <div className="text-xs lg:text-sm xl:text-base text-gray-500">{customer.city || ''} {customer.state || ''}</div>
                      </td>
                      <td className="px-4 lg:px-6 xl:px-8 py-4 lg:py-5 xl:py-6 whitespace-nowrap">
                        <span className={`inline-flex px-2 lg:px-3 xl:px-4 py-1 lg:py-1.5 xl:py-2 text-xs lg:text-sm xl:text-base font-semibold rounded-full ${
                          customer.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 xl:px-8 py-4 lg:py-5 xl:py-6 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2 lg:space-x-3">
                          <Link
                            to={`/dashboard/customers/${customer.id}/edit`}
                            className="text-green-600 hover:text-green-900 p-1 lg:p-2 rounded hover:bg-green-50 transition-colors"
                          >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-600 hover:text-red-900 p-1 lg:p-2 rounded hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && customers.length > 0 && (
          <div className="md:hidden space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-500">ID: {customer.id}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.status || 'Active'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {customer.email || 'No email'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {customer.phone || 'No phone'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {customer.address || 'No address'}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/dashboard/customers/${customer.id}/edit`}
                    className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && customers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchTerm ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="mt-2 text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Get started by adding your first customer.'
                }
              </p>
              {!searchTerm && (
                <Link
                  to="/dashboard/customers/new"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Customer
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;