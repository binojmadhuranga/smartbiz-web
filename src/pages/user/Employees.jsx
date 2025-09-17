import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllEmployees, deleteEmployee, searchEmployeesByName } from '../../services/employeeService';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [search, setSearch] = useState('');
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
    }
  }, [userId]);

  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEmployees(search);
    }, 300);

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
        <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 xl:p-10">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 px-6 lg:px-8 xl:px-10 py-4 lg:py-6 xl:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">Employees</h1>
              <p className="mt-1 lg:mt-2 text-sm lg:text-base xl:text-lg text-gray-600">Manage your company employees</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleAddEmployee}
                className="bg-green-600 hover:bg-green-700 text-white px-4 lg:px-6 xl:px-8 py-2 lg:py-3 xl:py-4 rounded-lg lg:rounded-xl font-medium transition-colors text-sm lg:text-base xl:text-lg flex items-center gap-2 lg:gap-3"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Employee
              </button>
            </div>
          </div>
        </div>

        {/* Search and Error */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 px-6 lg:px-8 xl:px-10 py-6 lg:py-8 xl:py-10">
          <div className="mb-4 lg:mb-6">
            <label htmlFor="employee-search" className="block text-sm lg:text-base xl:text-lg font-medium text-gray-700 mb-2 lg:mb-3">
              Search Employees
            </label>
            <div className="relative max-w-md lg:max-w-lg xl:max-w-xl">
              <input
                id="employee-search"
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 lg:px-6 xl:px-8 py-2 lg:py-3 xl:py-4 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base xl:text-lg"
              />
              <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 xl:pl-5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 lg:mb-6 bg-red-50 border border-red-200 text-red-700 px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 rounded-lg lg:rounded-xl text-sm lg:text-base xl:text-lg">
              {error}
            </div>
          )}
        </div>

        {/* Employees Table - Desktop */}
        <div className="hidden md:block">
          <div className="bg-white rounded-lg lg:rounded-xl shadow-md lg:shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 xl:py-5 text-left text-xs lg:text-sm xl:text-base font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 lg:px-6 xl:px-8 py-8 lg:py-12 xl:py-16 text-center text-gray-500 text-sm lg:text-base xl:text-lg">
                    {search ? 'No employees found matching your search.' : 'No employees found. Create your first employee!'}
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr key={employeeKey(employee, index)} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.role || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-green-600 hover:text-green-900 mr-3 transition-colors"
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employees Cards - Mobile */}
      <div className="md:hidden px-6 space-y-4">
        {employees.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            {search ? 'No employees found matching your search.' : 'No employees found. Create your first employee!'}
          </div>
        ) : (
          employees.map((employee, index) => (
            <div key={employeeKey(employee, index)} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900 text-lg">{employee.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="text-green-600 hover:text-green-900 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(getEmployeeId(employee), employee.name)}
                    disabled={deleteLoading === getEmployeeId(employee)}
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
                  <span className="text-gray-500">Role:</span>
                  <span className="ml-2 text-gray-900">{employee.role || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 text-gray-900">{employee.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Salary:</span>
                  <span className="ml-2 text-gray-900">
                    {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
};

export default Employees;