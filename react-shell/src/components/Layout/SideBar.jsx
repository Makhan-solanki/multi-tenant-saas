import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, LifeBuoy, Home, FileClock, Globe } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSupportCenter = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { default: RemoteApp } = await import('supportTickets/App');
      const container = document.getElementById('remote-app-container');
      if (container) {
        container.innerHTML = '';
        const React = await import('react');
        const ReactDOM = await import('react-dom/client');
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(RemoteApp));
      }
    } catch (err) {
      console.error('Failed to load support center:', err);
      setError('Failed to load Support Center.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-full flex flex-col">
      <div className="p-4 text-xl font-bold">Dashboard</div>
      <nav className="flex-grow p-4 space-y-2">
        {user && (
          <NavLink
            to="/support-center"
            className={({ isActive }) =>
              `flex items-center p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
            }
          >
            <LifeBuoy className="w-5 h-5 mr-2" />
            Support Center
          </NavLink>
        )}

        {user?.role === 'Admin' && (
          <>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }>
              <Home className="w-5 h-5 mr-2" />
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              <Users className="w-5 h-5 mr-2" />
              User Management
            </NavLink>
            <NavLink to="/admin/audit-logs" className={({ isActive }) =>
              `flex items-center p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
            } ><FileClock className="w-5 h-5 mr-2" />Audit Logs</NavLink>
            <NavLink
              to="/admin/webhooks"
              className={({ isActive }) =>
                `flex items-center p-2 rounded ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              <Globe className="w-5 h-5 mr-2" />
              Webhooks
            </NavLink>
          </>
        )}

      </nav>
      {error && <div className="text-red-400 px-4">{error}</div>}
    </div>
  );
};

export default Sidebar;
