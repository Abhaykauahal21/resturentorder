
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout: React.FC = () => {
  const { admin, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { to: '/admin/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { to: '/admin/orders', icon: 'fa-shopping-bag', label: 'Orders' },
    { to: '/admin/menu', icon: 'fa-utensils', label: 'Menu Management' },
    { to: '/admin/settings', icon: 'fa-cog', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${!isDesktopOpen && 'lg:w-20'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${!isDesktopOpen && 'lg:hidden'}`}>
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white">
              <i className="fas fa-bolt text-sm"></i>
            </div>
            <span className="font-bold text-lg dark:text-white">AdminHub</span>
          </div>
          <button 
            onClick={() => setIsDesktopOpen(!isDesktopOpen)} 
            className="hidden lg:block text-gray-500 hover:text-orange-500 transition-colors"
          >
            <i className={`fas ${isDesktopOpen ? 'fa-indent' : 'fa-outdent'}`}></i>
          </button>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden text-gray-500"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center space-x-3 p-3 rounded-xl transition-all
                ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              <i className={`fas ${item.icon} ${!isDesktopOpen ? 'lg:w-full lg:text-center lg:text-xl' : ''}`}></i>
              <span className={!isDesktopOpen ? 'lg:hidden' : 'font-semibold'}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 text-red-500 font-bold w-full p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
          >
            <i className={`fas fa-sign-out-alt ${!isDesktopOpen ? 'lg:w-full lg:text-center lg:text-xl' : ''}`}></i>
            <span className={!isDesktopOpen ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-xl"
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="hidden sm:block bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Live Connection: Active
            </div>
          </div>
          
          <div className="flex items-center space-x-3 lg:space-x-6">
            <button onClick={toggleTheme} className="text-gray-500 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-transform hover:rotate-12">
              <i className={`fas ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-blue-500'}`}></i>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold dark:text-white leading-tight">Store Manager</p>
                <p className="text-[10px] text-gray-500 uppercase font-black">Admin ID: 9021</p>
              </div>
              <img src="https://picsum.photos/100/100?random=admin" className="w-10 h-10 rounded-full border-2 border-orange-500 shadow-md" alt="Profile" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
