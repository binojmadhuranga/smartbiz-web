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
    <div className="w-full max-w-full overflow-hidden">
      <div className="p-3 md:p-4 lg:p-6 xl:p-8 w-full">
        {/* Header Section */}
        <div className="mb-4 md:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Sales Management
              </h1>
              <p className="mt-1 text-xs md:text-sm text-gray-600 truncate">
                Track and manage your sales transactions
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 min-w-0">
              <div className="relative flex-1 sm:flex-initial sm:min-w-[200px] md:min-w-[250px]">
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 pl-8 md:pl-10 pr-3 md:pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                />
                <div className="absolute inset-y-0 left-0 pl-2 md:pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-2 md:pr-3 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              
              <Link
                to="/dashboard/sales/new"
                className="px-3 md:px-4 lg:px-6 py-2 md:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base font-medium flex-shrink-0"
              >
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Record Sale</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm md:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Date
                  </th>
                  <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-2 md:px-3 lg:px-4 xl:px-6 py-8 text-center text-gray-500">
                      {search ? 'No sales found matching your search.' : 'No sales recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base font-medium text-gray-900 truncate max-w-[120px] md:max-w-xs lg:max-w-sm" title={sale.productName}>
                          {sale.productName}
                        </div>
                      </td>
                      <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-sm md:text-base text-gray-900">
                        {sale.quantity}
                      </td>
                      <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-sm md:text-base text-gray-900">
                        {formatCurrency(sale.price)}
                      </td>
                      <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-sm md:text-base font-semibold text-green-600">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-sm md:text-base text-gray-900">
                        {formatDate(sale.saleDate)}
                      </td>
                      <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1 md:space-x-2">
                          <button
                            onClick={() => handleEdit(sale)}
                            className="text-green-600 hover:text-green-900 transition-colors text-xs md:text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id, sale.productName)}
                            disabled={deleteLoading === sale.id}
                            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 text-xs md:text-sm"
                          >
                            {deleteLoading === sale.id ? 'Del...' : 'Delete'}
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
        <div className="md:hidden space-y-3">
          {sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {search ? 'No sales found matching your search.' : 'No sales recorded yet.'}
            </div>
          ) : (
            sales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate" title={sale.productName}>
                      {sale.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(sale.saleDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(sale.totalAmount)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="text-sm font-medium text-gray-900">{sale.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Unit Price</p>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(sale.price)}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(sale)}
                    className="px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id, sale.productName)}
                    disabled={deleteLoading === sale.id}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  >
                    {deleteLoading === sale.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {sales.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {sales.length}
                </p>
                <p className="text-sm text-gray-600">Total Sales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {sales.reduce((sum, sale) => sum + sale.quantity, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Items Sold</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(sales.reduce((sum, sale) => sum + sale.totalAmount, 0))}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>
        )}
      </div>
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