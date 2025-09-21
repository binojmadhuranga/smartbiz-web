import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../../services/user/dashboardService";
import { useAuth } from "../../context/AuthContext";

const Overview = () => {
  const [dashboardData, setDashboardData] = useState({
    customerCount: 0,
    supplierCount: 0,
    productCount: 0,
    employeeCount: 0,
    totalSales: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('monthly');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Fetch dashboard data
  const fetchDashboardData = async (selectedFilter = filter) => {
    try {
      setLoading(true);
      setError('');
      const data = await getDashboardStats(selectedFilter);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchDashboardData(newFilter);
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Dashboard cards configuration
  const dashboardCards = [
    {
      title: 'Customers',
      value: dashboardData.customerCount,
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      change: '+12%' // You can make this dynamic later
    },
    {
      title: 'Suppliers',
      value: dashboardData.supplierCount,
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      change: '+8%'
    },
    {
      title: 'Products',
      value: dashboardData.productCount,
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-900',
      change: '+15%'
    },
    {
      title: 'Employees',
      value: dashboardData.employeeCount,
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-900',
      change: '+5%'
    },
    {
      title: 'Total Sales',
      value: formatCurrency(dashboardData.totalSales),
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      change: '+23%',
      isCurrency: true
    }
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="p-3 md:p-4 lg:p-6 xl:p-8 w-full">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="mt-1 text-sm md:text-base text-gray-600">
                Welcome back, {user?.name || 'User'}! Here's what's happening with your business.
              </p>
            </div>
            
            {/* Filter Dropdown */}
            <div className="flex-shrink-0">
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                disabled={loading}
                className="px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base bg-white disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="yearly">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded mb-2"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
              {dashboardCards.map((card, index) => (
                <div
                  key={index}
                  className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-shrink-0">
                      {card.icon}
                    </div>
                    <span className="text-xs md:text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {card.change}
                    </span>
                  </div>
                  
                  <div className={`${card.textColor} mb-2`}>
                    <p className="text-2xl md:text-3xl font-bold">
                      {card.isCurrency ? card.value : formatNumber(card.value)}
                    </p>
                  </div>
                  
                  <p className="text-sm md:text-base text-gray-600 font-medium">
                    {card.title}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/dashboard/products/new')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Add Product</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => navigate('/dashboard/customers/new')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Add Customer</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => navigate('/dashboard/sales/new')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Record Sale</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => navigate('/dashboard/reports')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">View Reports</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Overview;
