import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllSales, deleteSale, searchSales } from '../../services/user/saleService';
import { useAuth } from '../../context/AuthContext';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      setIsSearching(true);
      try {
        let result;
        if (searchTerm.trim()) {
          result = await searchSales(searchTerm);
        } else {
          result = await getAllSales();
        }
        setSales(result);
      } catch (error) {
        console.error('Error searching sales:', error);
        setError('Failed to search sales');
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  // Fetch all sales
  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getAllSales();
      setSales(result);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to load sales data');
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Handle delete sale
  const handleDelete = async (saleId, productName) => {
    if (!window.confirm(`Are you sure you want to delete the sale for "${productName}"?`)) {
      return;
    }

    try {
      setDeleteLoading(saleId);
      await deleteSale(saleId);
      
      // Remove from local state
      setSales(prev => prev.filter(sale => sale.id !== saleId));
      
      // Show success message (you can replace with toast notification)
      alert('Sale deleted successfully');
    } catch (error) {
      console.error('Error deleting sale:', error);
      setError('Failed to delete sale');
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle edit navigation
  const handleEdit = (sale) => {
    navigate(`/dashboard/sales/${sale.id}/edit`);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Initial data fetch
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Loading state
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
            <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
            <p className="text-gray-600 mt-1">Track and manage your sales transactions</p>
          </div>
          <Link
            to="/dashboard/sales/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Record Sale
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 p-6 mb-6">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-100 mb-2">
            Search Sales
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              placeholder="Search by product name..."
              value={search}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 md:mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-gray-800/40 backdrop-blur-md rounded-lg lg:rounded-xl shadow-lg border border-gray-700/50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-200 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-200 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-200 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-200 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-200 uppercase tracking-wider">
                  Sale Date
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/20 divide-y divide-gray-700/40">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 lg:px-6 py-8 lg:py-12 text-center text-gray-300 text-sm lg:text-base">
                    {search ? 'No sales found matching your search.' : 'No sales recorded yet.'}
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base font-medium text-gray-100">{sale.productName}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap text-sm lg:text-base text-gray-200">
                      {sale.quantity}
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap text-sm lg:text-base text-gray-200">
                      {formatCurrency(sale.price)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap text-sm lg:text-base font-semibold text-green-400">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap text-sm lg:text-base text-gray-200">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(sale)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id, sale.productName)}
                          disabled={deleteLoading === sale.id}
                          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                          {deleteLoading === sale.id ? 'Deleting...' : 'Delete'}
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 xs:space-y-4">
        {sales.length === 0 ? (
          <div className="bg-gray-800/40 backdrop-blur-md rounded-lg p-4 xs:p-6 text-center border border-gray-700/50">
            <svg className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-gray-300 mb-2 xs:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-base xs:text-lg font-medium text-gray-100 mb-1 xs:mb-2">
              {search ? 'No sales found' : 'No sales yet'}
            </p>
            <p className="text-sm xs:text-base text-gray-300 mb-3 xs:mb-4">
              {search ? 'Try adjusting your search terms.' : 'Record your first sale to get started.'}
            </p>
            {!search && (
              <Link
                to="/dashboard/sales/new"
                className="inline-flex items-center px-3 xs:px-4 py-2 bg-green-600 text-white text-sm xs:text-base font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Record Sale
              </Link>
            )}
          </div>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="bg-gray-800/40 backdrop-blur-md rounded-lg xs:rounded-xl shadow-lg border border-gray-700/50 overflow-hidden">
              {/* Sale Header */}
              <div className="p-3 xs:p-4 border-b border-gray-700/50">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-gray-100 text-base xs:text-lg truncate">{sale.productName}</h3>
                    <p className="text-xs xs:text-sm text-gray-400 mt-1">{formatDate(sale.saleDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base xs:text-lg font-bold text-green-400">
                      {formatCurrency(sale.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sale Details */}
              <div className="p-3 xs:p-4 space-y-2 xs:space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Quantity</p>
                    <p className="text-sm font-medium text-gray-100">{sale.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Unit Price</p>
                    <p className="text-sm font-medium text-gray-100">{formatCurrency(sale.price)}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-700/30">
                  <button
                    onClick={() => handleEdit(sale)}
                    className="px-3 py-1.5 text-sm text-green-400 hover:bg-gray-700/50 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id, sale.productName)}
                    disabled={deleteLoading === sale.id}
                    className="px-3 py-1.5 text-sm text-red-400 hover:bg-gray-700/50 rounded transition-colors disabled:opacity-50"
                  >
                    {deleteLoading === sale.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {sales.length > 0 && (
        <div className="mt-6 bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {sales.length}
              </p>
              <p className="text-sm text-gray-300">Total Sales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {sales.reduce((sum, sale) => sum + sale.quantity, 0)}
              </p>
              <p className="text-sm text-gray-300">Total Items Sold</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {formatCurrency(sales.reduce((sum, sale) => sum + sale.totalAmount, 0))}
              </p>
              <p className="text-sm text-gray-300">Total Revenue</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default Sales;