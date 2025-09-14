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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your company employees</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleAddEmployee}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Search and Error */}
      <div className="px-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Employees Table - Desktop */}
      <div className="hidden md:block px-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
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
  );
};

export default Employees;