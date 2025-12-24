
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { orderService } from '../../services/api';

const CustomerLayout: React.FC = () => {
  const { tableNumber } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showServiceToast, setShowServiceToast] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadLastOrder = async () => {
      if (!tableNumber) {
        setLastOrderId(null);
        return;
      }
      try {
        const res = await orderService.getAll({ tableNumber, limit: 1 });
        const last = res.data?.[0];
        if (!cancelled) setLastOrderId(last?._id || null);
      } catch {
        if (!cancelled) setLastOrderId(null);
      }
    };

    loadLastOrder();
    window.addEventListener('orderStatusChanged', loadLastOrder as any);
    return () => {
      cancelled = true;
      window.removeEventListener('orderStatusChanged', loadLastOrder as any);
    };
  }, [tableNumber]);

  const callWaiter = () => {
    setShowServiceToast(true);
    setTimeout(() => setShowServiceToast(false), 3000);
  };

  const navItems = [
    { path: '/', icon: 'fa-house', label: 'Home' },
    { 
      path: lastOrderId ? `/track/${lastOrderId}` : '/', 
      icon: 'fa-clock-rotate-left', 
      label: 'Track',
      disabled: !lastOrderId 
    },
    { path: '/payment-success', icon: 'fa-receipt', label: 'Bill' },
    { action: callWaiter, icon: 'fa-bell', label: 'Service' },
    { path: '/admin/login', icon: 'fa-user-shield', label: 'Admin' },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-gray-50 dark:bg-black shadow-2xl overflow-hidden selection:bg-orange-500/30">
      <header className="sticky top-0 z-50 glass dark:border-gray-800 border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 active:scale-90 transition-transform cursor-pointer"
          >
            <i className="fas fa-utensils text-sm"></i>
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-none dark:text-white tracking-tight">QuickServe</h1>
            <div className="flex items-center mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5"></span>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kitchen Open</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {tableNumber && (
            <div className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest border border-orange-100 dark:border-orange-900/50">
              TABLE {tableNumber}
            </div>
          )}
          
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-500 rounded-xl active:scale-90 transition-all border border-gray-200 dark:border-gray-800"
          >
            <i className={`fas ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-indigo-500'} text-xs`}></i>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[50] glass border-t border-gray-100 dark:border-gray-800 px-4 py-4 flex justify-between items-center safe-area-bottom">
        {navItems.map((item, idx) => {
          const isActive = item.path === location.pathname;
          return (
            <button
              key={idx}
              disabled={item.disabled}
              onClick={() => item.path ? navigate(item.path) : item.action?.()}
              className={`flex flex-col items-center space-y-1 transition-all duration-300 relative min-w-[64px] ${isActive ? 'text-orange-500 scale-110' : 'text-gray-400'} ${item.disabled ? 'opacity-20 cursor-not-allowed' : 'hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-orange-500/10 text-orange-500 shadow-inner' : ''}`}>
                <i className={`fas ${item.icon} text-sm`}></i>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <span className="absolute -top-1 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              )}
            </button>
          );
        })}
      </nav>

      {showServiceToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-xs z-[100] bg-gray-900 dark:bg-white text-white dark:text-black p-4 rounded-2xl shadow-2xl flex items-center space-x-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shrink-0">
            <i className="fas fa-bell"></i>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight">Service Requested</p>
            <p className="text-[10px] opacity-70">A waiter is heading to Table {tableNumber || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLayout;
