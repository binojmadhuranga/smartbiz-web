import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProducts, deleteProduct, searchProductsByName, getProductSuppliers } from '../../services/user/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [productSuppliers, setProductSuppliers] = useState({});
  const [suppliersLoading, setSuppliersLoading] = useState({});
  const navigate = useNavigate();

  // Helper function to get item ID from product
  const getItemId = (product) => {
    return product.itemId || product.id || product._id;
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = useCallback(async (searchTerm = '') => {
    try {
      setLoading(true);
      setError('');
      let data;
      if (searchTerm.trim()) {
        data = await searchProductsByName(searchTerm);
      } else {
        data = await getAllProducts();
      }
      setProducts(data);
      
      // Fetch suppliers for each product
      data.forEach(product => {
        const itemId = getItemId(product);
        if (itemId) {
          fetchProductSuppliers(itemId);
        }
      });
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
  }, [navigate]);

  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, fetchProducts]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleDelete = async (id, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      await deleteProduct(id);
      // Refresh the search results after deletion
      fetchProducts(search);
    } catch (err) {
      setError(err.message);
      // If unauthorized, redirect to login
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  const fetchProductSuppliers = async (itemId) => {
    // Don't fetch if already loaded or loading
    if (productSuppliers[itemId] || suppliersLoading[itemId]) {
      return;
    }

    try {
      setSuppliersLoading(prev => ({ ...prev, [itemId]: true }));
      const suppliers = await getProductSuppliers(itemId);
      setProductSuppliers(prev => ({ ...prev, [itemId]: suppliers || [] }));
    } catch (err) {
      setProductSuppliers(prev => ({ ...prev, [itemId]: [] }));
    } finally {
      setSuppliersLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/products/${id}/edit`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-2 xs:p-3 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <Link
            to="/dashboard/products/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Products
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
              placeholder="Search by product name..."
              value={search}
              onChange={handleSearchChange}
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

      {/* Products Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg lg:rounded-xl shadow-md lg:shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Buying Price
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Suppliers
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 lg:px-6 py-8 lg:py-12 text-center text-gray-500 text-sm lg:text-base">
                    {search ? 'No products found matching your search.' : 'No products found. Create your first product!'}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={getItemId(product)} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5">
                      <div className="text-sm lg:text-base text-gray-900 max-w-xs lg:max-w-md truncate">{product.description || 'No description'}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base text-gray-900">
                        <span className={`inline-flex px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm font-semibold rounded-full ${
                          product.quantity > 10 ? 'bg-green-100 text-green-800' :
                          product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.quantity || 0} units
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base text-gray-900">{formatPrice(product.unitBuyingPrice)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">{formatPrice(product.unitSellingPrice)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {suppliersLoading[getItemId(product)] ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                            <span className="text-gray-500">Loading...</span>
                          </div>
                        ) : productSuppliers[getItemId(product)] && productSuppliers[getItemId(product)].length > 0 ? (
                          <div className="max-w-xs">
                            {productSuppliers[getItemId(product)].map((supplier, index) => (
                              <span key={supplier.id || index} className="inline-block">
                                {supplier.name}
                                {index < productSuppliers[getItemId(product)].length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">No suppliers</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(getItemId(product))}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(getItemId(product), product.name)}
                          disabled={deleteLoading === getItemId(product)}
                          className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                        >
                          {deleteLoading === getItemId(product) ? 'Deleting...' : 'Delete'}
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

      {/* Products Cards - Mobile */}
      <div className="md:hidden space-y-3 xs:space-y-4">
        {products.length === 0 ? (
          <div className="bg-white rounded-lg p-4 xs:p-6 text-center text-gray-500">
            <svg className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-gray-400 mb-2 xs:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-base xs:text-lg font-medium text-gray-900 mb-1 xs:mb-2">
              {search ? 'No products found' : 'No products yet'}
            </p>
            <p className="text-sm xs:text-base text-gray-500 mb-3 xs:mb-4">
              {search ? 'Try adjusting your search terms.' : 'Create your first product to get started.'}
            </p>
            {!search && (
              <Link
                to="/dashboard/products/new"
                className="inline-flex items-center px-3 xs:px-4 py-2 bg-green-600 text-white text-sm xs:text-base font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </Link>
            )}
          </div>
        ) : (
          products.map((product) => (
            <div key={getItemId(product)} className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Product Header */}
              <div className="p-3 xs:p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-gray-900 text-base xs:text-lg truncate">{product.name}</h3>
                    <p className="text-xs xs:text-sm text-gray-600 mt-1 line-clamp-2 hidden xs:block">{product.description || 'No description available'}</p>
                  </div>
                  <div className="flex space-x-1 xs:space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(getItemId(product))}
                      className="p-1.5 xs:p-2 text-green-600 hover:bg-green-50 rounded-md xs:rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(getItemId(product), product.name)}
                      disabled={deleteLoading === getItemId(product)}
                      className="p-1.5 xs:p-2 text-red-600 hover:bg-red-50 rounded-md xs:rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleteLoading === getItemId(product) ? (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 xs:h-4 xs:w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {/* Show description on very small screens below title */}
                <p className="text-xs text-gray-600 mt-2 line-clamp-2 xs:hidden">{product.description || 'No description available'}</p>
              </div>

              {/* Product Details */}
              <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3">
                {/* Quantity and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 xs:space-x-2">
                    <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-xs xs:text-sm text-gray-500">Stock:</span>
                  </div>
                  <span className={`inline-flex px-1.5 xs:px-2 py-0.5 xs:py-1 text-xs font-semibold rounded-full ${
                    product.quantity > 10 ? 'bg-green-100 text-green-800' :
                    product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.quantity || 0} units
                  </span>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-4">
                  <div className="text-center p-1.5 xs:p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Buying</p>
                    <p className="text-xs xs:text-sm font-semibold text-gray-900">{formatPrice(product.unitBuyingPrice)}</p>
                  </div>
                  <div className="text-center p-1.5 xs:p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 uppercase tracking-wider">Selling</p>
                    <p className="text-sm xs:text-base sm:text-lg font-bold text-green-700">{formatPrice(product.unitSellingPrice)}</p>
                  </div>
                </div>

                {/* Suppliers */}
                <div className="flex items-start space-x-1.5 xs:space-x-2">
                  <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Suppliers</p>
                    <p className="text-xs xs:text-sm text-gray-900 truncate">
                      {suppliersLoading[getItemId(product)] ? (
                        <span className="text-gray-500 italic">Loading suppliers...</span>
                      ) : productSuppliers[getItemId(product)] && productSuppliers[getItemId(product)].length > 0 ? (
                        productSuppliers[getItemId(product)].map((supplier, index) => (
                          <span key={supplier.id || index}>
                            {supplier.name}
                            {index < productSuppliers[getItemId(product)].length - 1 && ', '}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No suppliers assigned</span>
                      )}
                    </p>
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

export default Products;
