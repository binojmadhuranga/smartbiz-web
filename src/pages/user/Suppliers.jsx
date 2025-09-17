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
    }
  }, [userId]);

  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuppliers(search);
    }, 300);

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
        <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 text-sm lg:text-base xl:text-lg mt-1 lg:mt-2">Manage your supplier database</p>
        </div>
        <Link
          to="/dashboard/suppliers/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 lg:px-6 xl:px-8 py-2 lg:py-3 xl:py-4 rounded-lg lg:rounded-xl font-medium flex items-center gap-2 lg:gap-3 transition-colors text-sm lg:text-base xl:text-lg"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Supplier
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6 lg:mb-8">
        <div className="relative max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 xl:pl-5 flex items-center pointer-events-none">
            <svg className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by supplier name..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 lg:pl-12 xl:pl-14 pr-10 lg:pr-12 xl:pr-14 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-sm lg:text-base xl:text-lg"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 lg:pr-4 xl:pr-5 flex items-center"
            >
              <svg className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 lg:mb-6 bg-red-100 border border-red-400 text-red-700 px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 rounded-lg lg:rounded-xl text-sm lg:text-base xl:text-lg">
          {error}
        </div>
      )}

      {/* Suppliers Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg lg:rounded-xl shadow-md lg:shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 lg:px-6 xl:px-8 py-8 lg:py-12 xl:py-16 text-center text-gray-500 text-sm lg:text-base xl:text-lg">
                    {search ? 'No suppliers found matching your search.' : 'No suppliers found. Create your first supplier!'}
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier, index) => (
                  <tr key={supplierKey(supplier, index)} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 xl:px-8 py-4 lg:py-5 xl:py-6 whitespace-nowrap">
                      <div className="text-sm lg:text-base xl:text-lg font-medium text-gray-900">{supplier.name}</div>
                    </td>
                    <td className="px-4 lg:px-6 xl:px-8 py-4 lg:py-5 xl:py-6 whitespace-nowrap">
                      <div className="text-sm lg:text-base xl:text-lg text-gray-900">{supplier.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 lg:px-6 xl:px-8 py-4 lg:py-5 xl:py-6 whitespace-nowrap">
                      <div className="text-sm lg:text-base xl:text-lg text-gray-900">{supplier.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{supplier.address || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-green-600 hover:text-green-900 mr-3 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id, supplier.name)}
                        disabled={deleteLoading === supplier.id}
                        className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                      >
                        {deleteLoading === supplier.id ? 'Deleting...' : 'Delete'}
                      </button>
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
            {search ? 'No suppliers found matching your search.' : 'No suppliers found. Create your first supplier!'}
          </div>
        ) : (
          suppliers.map((supplier, index) => (
            <div key={supplierKey(supplier, index)} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900 text-lg">{supplier.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="text-green-600 hover:text-green-900 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id, supplier.name)}
                    disabled={deleteLoading === supplier.id}
                    className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 text-gray-900">{supplier.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 text-gray-900">{supplier.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Address:</span>
                  <span className="ml-2 text-gray-900">{supplier.address || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Items:</span>
                  <span className="ml-2 text-gray-900">
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
                  </span>
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
