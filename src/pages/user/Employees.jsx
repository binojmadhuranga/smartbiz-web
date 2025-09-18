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
    <div className="p-2 xs:p-3 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
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

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Employees Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role & Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  {search ? 'No employees found matching your search.' : 'No employees found. Create your first employee!'}
                </td>
              </tr>
            ) : (
              employees.map((employee, index) => (
                <tr key={employeeKey(employee, index)} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">ID: {getEmployeeId(employee)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.role || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{employee.department || 'No department'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.email || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{employee.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

      {/* Employees Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {employees.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            {search ? 'No employees found matching your search.' : 'No employees found. Create your first employee!'}
          </div>
        ) : (
          employees.map((employee, index) => (
            <div key={employeeKey(employee, index)} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-500">ID: {getEmployeeId(employee)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="text-green-600 hover:text-green-900 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(getEmployeeId(employee), employee.name)}
                    disabled={deleteLoading === getEmployeeId(employee)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {deleteLoading === getEmployeeId(employee) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Role: </span>
                  <span className="text-sm text-gray-900">{employee.role || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Department: </span>
                  <span className="text-sm text-gray-900">{employee.department || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Email: </span>
                  <span className="text-sm text-gray-900">{employee.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Phone: </span>
                  <span className="text-sm text-gray-900">{employee.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Salary: </span>
                  <span className="text-sm text-gray-900">
                    {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
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

export default Employees;