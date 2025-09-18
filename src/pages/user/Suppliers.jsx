import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSuppliersByUserId, deleteSupplier, searchSuppliersByName, getSupplierItems } from '../../services/supplierService';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [supplierItems, setSupplierItems] = useState({});
  const [itemsLoading, setItemsLoading] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Compute a stable key for supplier items, even if some records lack an `id`
  const supplierKey = (s, i) =>
    s?.id ?? s?._id ?? s?.supplierId ?? s?.email ?? `${s?.name || 'supplier'}-${i}`;

  // Normalize supplier object to ensure a canonical `id`
  const normalizeSupplier = (s) => ({
    ...s,
    id: s?.id ?? s?._id ?? s?.supplierId,
  });

  // Helper function to get supplier ID
  const getSupplierId = (supplier) => {
    return supplier.supplierId || supplier.id || supplier._id;
  };
  
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

  // Fetch suppliers on component mount
  useEffect(() => {
    if (userId) {
      fetchSuppliers();
    }
  }, [userId]);

  // Function to fetch items for a specific supplier
  const fetchSupplierItems = async (supplierId) => {
    if (!supplierId) return;
    
    try {
      setItemsLoading(prev => ({ ...prev, [supplierId]: true }));
      const items = await getSupplierItems(supplierId);
      setSupplierItems(prev => ({ ...prev, [supplierId]: items }));
    } catch (error) {
      console.error('Error fetching supplier items:', error);
      setSupplierItems(prev => ({ ...prev, [supplierId]: [] }));
    } finally {
      setItemsLoading(prev => ({ ...prev, [supplierId]: false }));
    }
  };

  const fetchSuppliers = useCallback(async (searchTerm = '') => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError('');
      let data;
      if (searchTerm.trim()) {
        setIsSearching(true);
        data = await searchSuppliersByName(userId, searchTerm);
      } else {
        data = await getSuppliersByUserId(userId);
      }
      const normalized = Array.isArray(data) ? data.map(normalizeSupplier) : [];
      setSuppliers(normalized);
      
      // Fetch items for each supplier
      for (const supplier of normalized) {
        const supplierId = getSupplierId(supplier);
        if (supplierId) {
          fetchSupplierItems(supplierId);
        }
      }
    } catch (err) {
      setError(err.message);
      // If unauthorized, redirect to login
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [userId]);

  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuppliers(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, fetchSuppliers]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleDelete = async (id, supplierName) => {
    if (!window.confirm(`Are you sure you want to delete "${supplierName}"?`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      await deleteSupplier(id);
      // Refresh the search results after deletion
      fetchSuppliers(search);
    } catch (err) {
      setError(err.message);
      // If unauthorized, redirect to login
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (supplier) => {
    navigate(`/dashboard/suppliers/${supplier.id}/edit`);
  };

  const handleAdd = () => {
    navigate('/dashboard/suppliers/new');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2 xs:p-3 sm:p-4 md:p-4 lg:p-6 xl:p-8 max-w-full overflow-hidden">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 md:gap-4 mb-4">
          <div className="min-w-0 flex-shrink">
            <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate">Supplier Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Manage your supplier database</p>
          </div>
          <Link
            to="/dashboard/suppliers/new"
            className="inline-flex items-center px-3 md:px-4 py-2 text-sm md:text-base bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Supplier</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="max-w-full md:max-w-md lg:max-w-lg">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Suppliers
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
                placeholder="Search by supplier name..."
                value={search}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              />
              {(isSearching || loading) && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 md:mb-6 bg-red-100 border border-red-400 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded text-sm md:text-base">
          {error}
        </div>
      )}

      {/* Suppliers Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier Info
                </th>
                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-2 md:px-3 lg:px-4 xl:px-6 py-6 md:py-8 text-center text-gray-500 text-sm md:text-base">
                  {search ? 'No suppliers found matching your search.' : 'No suppliers found. Create your first supplier!'}
                </td>
              </tr>
            ) : (
              suppliers.map((supplier, index) => (
                <tr key={supplierKey(supplier, index)} className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-sm md:text-base font-medium text-gray-900 truncate">{supplier.name}</div>
                    <div className="text-xs md:text-sm text-gray-500 truncate">ID: {supplier.id}</div>
                  </td>
                  <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-sm md:text-base text-gray-900 truncate">{supplier.email || 'N/A'}</div>
                    <div className="text-xs md:text-sm text-gray-500 truncate">{supplier.phone || 'N/A'}</div>
                  </td>
                  <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-sm md:text-base text-gray-900 max-w-[120px] md:max-w-xs lg:max-w-sm truncate">{supplier.address || 'N/A'}</div>
                  </td>
                  <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-sm md:text-base text-gray-900 max-w-[100px] md:max-w-xs truncate">
                      {(() => {
                        const supplierId = getSupplierId(supplier);
                        const items = supplierItems[supplierId] || [];
                        const loading = itemsLoading[supplierId];
                        
                        if (loading) {
                          return 'Loading...';
                        }
                        
                        if (items.length === 0) {
                          return 'No items';
                        }
                        
                        if (items.length === 1) {
                          return items[0].name || items[0].itemName || items[0].productName || 'Unnamed Item';
                        }
                        
                        const firstName = items[0].name || items[0].itemName || items[0].productName || 'Unnamed Item';
                        return `${firstName} (+${items.length - 1} more)`;
                      })()}
                    </div>
                  </td>
                  <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-green-600 hover:text-green-900 transition-colors text-xs md:text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id, supplier.name)}
                        disabled={deleteLoading === supplier.id}
                        className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 text-xs md:text-sm"
                      >
                        {deleteLoading === supplier.id ? 'Del...' : 'Delete'}
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

      {/* Suppliers Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {suppliers.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'No suppliers found' : 'No suppliers yet'}
            </p>
            <p className="text-gray-500 mb-4">
              {search ? 'Try adjusting your search terms.' : 'Create your first supplier to get started.'}
            </p>
            {!search && (
              <Link
                to="/dashboard/suppliers/new"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Supplier
              </Link>
            )}
          </div>
        ) : (
          suppliers.map((supplier, index) => (
            <div key={supplierKey(supplier, index)} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              {/* Supplier Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{supplier.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">ID: {supplier.id}</p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id, supplier.name)}
                      disabled={deleteLoading === supplier.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Supplier Details */}
              <div className="p-4 space-y-3">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">Email:</span>
                    <span className="text-sm text-gray-900 truncate">{supplier.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <span className="text-sm text-gray-900 truncate">{supplier.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Address:</p>
                      <p className="text-sm text-gray-900 truncate">
                        {supplier.address || 'No address'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Items:</p>
                      <p className="text-sm text-gray-900">
                        {(() => {
                          const supplierId = getSupplierId(supplier);
                          const items = supplierItems[supplierId] || [];
                          const loading = itemsLoading[supplierId];
                          
                          if (loading) {
                            return 'Loading...';
                          }
                          
                          if (items.length === 0) {
                            return 'No items';
                          }
                          
                          if (items.length === 1) {
                            return items[0].name || items[0].itemName || items[0].productName || 'Unnamed Item';
                          }
                          
                          const firstName = items[0].name || items[0].itemName || items[0].productName || 'Unnamed Item';
                          return `${firstName} (+${items.length - 1} more)`;
                        })()}
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

export default Suppliers;