import { LogOut, Package, Upload } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Equipment Management</span>
            </Link>

            <div className="ml-10 flex items-center space-x-4">
              <Link
                to="/tenders"
                className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/tenders'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                  }`}
              >
                Tenders
              </Link>
              {user?.roles.includes('super_admin') && (
                <Link to="/admin/users" className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/admin/users'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                  }`}>
                  Manage Users
                </Link>
              )}

              {user?.roles.some(role => ['admin', 'super_admin'].includes(role)) && (
                <Link
                  to="/equipment-installation"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/equipment-installation'
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                    }`}
                >
                  <div className="flex items-center">
                    <Upload className="h-4 w-4 mr-1" />
                    Equipment Installation
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">
              {user?.username}
            </span>
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-800"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
