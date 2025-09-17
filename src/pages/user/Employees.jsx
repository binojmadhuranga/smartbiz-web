import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllEmployees, deleteEmployee, searchEmployeesByName } from '../../services/employeeService';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Normalize employee object to ensure a canonical `id`
  const normalizeEmployee = (e) => ({
    ...e,
    id: e?.id ?? e?._id ?? e?.employeeId,
  });

  // Helper function to get employee ID
  const getEmployeeId = (employee) => {
    return employee.employeeId || employee.id || employee._id;
  };

  // Create a unique key for employee mapping
  const employeeKey = (employee, index) => {
    const id = getEmployeeId(employee);
    return id ? `employee-${id}` : `employee-index-${index}`;
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

  // Fetch employees on component mount
  useEffect(() => {
    if (userId) {
      fetchEmployees();
    }
  }, [userId]);

  const fetchEmployees = useCallback(async (searchTerm = '') => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError('');
      let data;
      if (searchTerm.trim()) {
        setIsSearching(true);
        data = await searchEmployeesByName(userId, searchTerm);
      } else {
        data = await getAllEmployees(userId);
      }
      const normalized = Array.isArray(data) ? data.map(normalizeEmployee) : [];
      setEmployees(normalized);
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
      fetchEmployees(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, fetchEmployees]);

  const handleEdit = (employee) => {
    const employeeId = getEmployeeId(employee);
    navigate(`/dashboard/employees/${employeeId}/edit`);
  };

  const handleDelete = async (id, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete "${employeeName}"?`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      await deleteEmployee(id);
      // Refresh the employees list
      fetchEmployees(search);
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

  const handleAddEmployee = () => {
    navigate('/dashboard/employees/new');
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
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-1">Manage your company employees</p>
          </div>
          <Link
            to="/dashboard/employees/new"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="max-w-md">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Employees
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
              placeholder="Search by employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Employees Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg lg:rounded-xl shadow-md lg:shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Employee Info
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 lg:px-6 py-8 lg:py-12 text-center text-gray-500 text-sm lg:text-base">
                    {search ? 'No employees found matching your search.' : 'No employees found. Create your first employee!'}
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr key={employeeKey(employee, index)} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base font-medium text-gray-900">{employee.name}</div>
                      <div className="text-xs lg:text-sm text-gray-500">ID: {getEmployeeId(employee)}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base text-gray-900">{employee.role || 'N/A'}</div>
                      <div className="text-xs lg:text-sm text-gray-500">{employee.department || 'No department'}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base text-gray-900">{employee.email || 'N/A'}</div>
                      <div className="text-xs lg:text-sm text-gray-500">{employee.phone || 'N/A'}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap">
                      <div className="text-sm lg:text-base font-medium text-gray-900">
                        {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 lg:py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(getEmployeeId(employee), employee.name)}
                          disabled={deleteLoading === getEmployeeId(employee)}
                          className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                        >
                          {deleteLoading === getEmployeeId(employee) ? 'Deleting...' : 'Delete'}
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

      {/* Employees Cards - Mobile */}
      <div className="md:hidden space-y-3 xs:space-y-4">
        {employees.length === 0 ? (
          <div className="bg-white rounded-lg p-4 xs:p-6 text-center text-gray-500">
            <svg className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-gray-400 mb-2 xs:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-base xs:text-lg font-medium text-gray-900 mb-1 xs:mb-2">
              {search ? 'No employees found' : 'No employees yet'}
            </p>
            <p className="text-sm xs:text-base text-gray-500 mb-3 xs:mb-4">
              {search ? 'Try adjusting your search terms.' : 'Create your first employee to get started.'}
            </p>
            {!search && (
              <Link
                to="/dashboard/employees/new"
                className="inline-flex items-center px-3 xs:px-4 py-2 bg-green-600 text-white text-sm xs:text-base font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Employee
              </Link>
            )}
          </div>
        ) : (
          employees.map((employee, index) => (
            <div key={employeeKey(employee, index)} className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Employee Header */}
              <div className="p-3 xs:p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-gray-900 text-base xs:text-lg truncate">{employee.name}</h3>
                    <p className="text-xs xs:text-sm text-gray-600 mt-1">ID: {getEmployeeId(employee)}</p>
                  </div>
                  <div className="flex space-x-1 xs:space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="p-1.5 xs:p-2 text-green-600 hover:bg-green-50 rounded-md xs:rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(getEmployeeId(employee), employee.name)}
                      disabled={deleteLoading === getEmployeeId(employee)}
                      className="p-1.5 xs:p-2 text-red-600 hover:bg-red-50 rounded-md xs:rounded-lg transition-colors disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Employee Details */}
              <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3">
                {/* Role & Department */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 xs:space-x-2">
                    <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 112 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 112-2z" />
                    </svg>
                    <span className="text-xs xs:text-sm text-gray-500">Role:</span>
                  </div>
                  <span className="text-xs xs:text-sm text-gray-900 font-medium">{employee.role || 'No role'}</span>
                </div>

                {/* Department */}
                {employee.department && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 xs:space-x-2">
                      <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-xs xs:text-sm text-gray-500">Department:</span>
                    </div>
                    <span className="text-xs xs:text-sm text-gray-900">{employee.department}</span>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-1.5 xs:space-y-2">
                  <div className="flex items-center space-x-1.5 xs:space-x-2">
                    <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs xs:text-sm text-gray-500">Email:</span>
                    <span className="text-xs xs:text-sm text-gray-900 truncate">{employee.email || 'No email'}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center space-x-1.5 xs:space-x-2">
                      <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs xs:text-sm text-gray-500">Phone:</span>
                      <span className="text-xs xs:text-sm text-gray-900 truncate">{employee.phone}</span>
                    </div>
                  )}
                </div>

                {/* Salary */}
                {employee.salary && (
                  <div className="flex items-center justify-between pt-1 xs:pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-1.5 xs:space-x-2">
                      <svg className="w-3 xs:w-4 h-3 xs:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs xs:text-sm text-gray-500">Salary:</span>
                    </div>
                    <span className="text-xs xs:text-sm text-gray-900 font-medium">
                      ${employee.salary.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Employees;