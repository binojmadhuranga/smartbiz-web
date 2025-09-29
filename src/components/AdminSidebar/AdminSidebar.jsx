import React from "react";
import { NavLink } from "react-router-dom";
import { useNavigation } from "../../context/NavigationContext";

const AdminSidebar = ({ isOpen, onToggle }) => {
  const { startNavigation } = useNavigation();

  const adminNavItems = [
    {
      name: "Overview",
      path: "/admin/overview",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: "Manage Users",
      path: "/admin/users",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      name: "Manage Plans",
      path: "/admin/manage-plans",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "System Stats",
      path: "/admin/system-stats",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
   
    {
      name: "Reports",
      path: "/admin/reports",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] transition-transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } bg-gradient-to-br from-gray-800 to-blue-200 border-r border-green-200 lg:translate-x-0 lg:static lg:h-auto`}
    >
      <div className="h-full px-3 md:py-10 overflow-y-auto">
        <div className="mb-6 text-center">
          <h2 className="md:text-2xl font-semibold bg-gradient-to-r from-green-700 to-white bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>
        
        <ul className="space-y-2 font-medium">
          {adminNavItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={() => startNavigation(item.name)}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg group transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-green-600 text-white shadow-lg"
                      : "text-white hover:bg-white hover:text-green-700 hover:shadow-md"
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="ml-3 text-sm font-medium whitespace-nowrap">
                  {item.name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default AdminSidebar;