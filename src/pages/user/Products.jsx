import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProducts, deleteProduct, searchProductsByName, getProductSuppliers } from '../../services/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [productSuppliers, setProductSuppliers] = useState({});
  const [suppliersLoading, setSuppliersLoading] = useState({});
  const [cart, setCart] = useState([]);
  const [addToCartLoading, setAddToCartLoading] = useState(null);
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

  const handleAddToCart = async (product) => {
    const itemId = getItemId(product);
    setAddToCartLoading(itemId);
    
    try {
      // Simulate adding to cart (you can replace this with actual API call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const cartItem = {
        id: itemId,
        name: product.name,
        price: product.unitSellingPrice,
        quantity: 1,
        image: product.image || null
      };
      
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === itemId);
        if (existingItem) {
          return prevCart.map(item =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevCart, cartItem];
      });
      
      // Show success message (you can implement a toast notification here)
      console.log(`Added ${product.name} to cart`);
    } catch (err) {
      setError('Failed to add product to cart');
    } finally {
      setAddToCartLoading(null);
    }
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Cart Button */}
          {getCartItemCount() > 0 && (
            <button className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0L17 19" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            </button>
          )}
          {/* Add Product Button */}
          <Link
            to="/dashboard/products/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Products Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buying Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suppliers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {search ? 'No products found matching your search.' : 'No products found. Create your first product!'}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={getItemId(product)} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{product.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.quantity > 10 ? 'bg-green-100 text-green-800' :
                          product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.quantity || 0} units
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(product.unitBuyingPrice)}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={addToCartLoading === getItemId(product) || !product.quantity}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:cursor-not-allowed"
                        >
                          {addToCartLoading === getItemId(product) ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Adding...</span>
                            </div>
                          ) : (
                            'Add to Cart'
                          )}
                        </button>
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
      <div className="md:hidden space-y-4">
        {products.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'No products found' : 'No products yet'}
            </p>
            <p className="text-gray-500 mb-4">
              {search ? 'Try adjusting your search terms.' : 'Create your first product to get started.'}
            </p>
            {!search && (
              <Link
                to="/dashboard/products/new"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </Link>
            )}
          </div>
        ) : (
          products.map((product) => (
            <div key={getItemId(product)} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Product Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description || 'No description available'}</p>
                  </div>
                  <div className="flex space-x-2 ml-3">
                    <button
                      onClick={() => handleEdit(getItemId(product))}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(getItemId(product), product.name)}
                      disabled={deleteLoading === getItemId(product)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleteLoading === getItemId(product) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 space-y-3">
                {/* Quantity and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-sm text-gray-500">Stock:</span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.quantity > 10 ? 'bg-green-100 text-green-800' :
                    product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.quantity || 0} units
                  </span>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Buying Price</p>
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(product.unitBuyingPrice)}</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 uppercase tracking-wider">Selling Price</p>
                    <p className="text-lg font-bold text-green-700">{formatPrice(product.unitSellingPrice)}</p>
                  </div>
                </div>

                {/* Suppliers */}
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Suppliers</p>
                    <p className="text-sm text-gray-900 truncate">
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

              {/* Action Button */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={addToCartLoading === getItemId(product) || !product.quantity}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {addToCartLoading === getItemId(product) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding to Cart...</span>
                    </>
                  ) : !product.quantity ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                      <span>Out of Stock</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0L17 19" />
                      </svg>
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
