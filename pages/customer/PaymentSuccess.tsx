
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api';
import { useCart } from '../../context/CartContext';

const PaymentSuccess: React.FC = () => {
  const { tableNumber } = useCart();
  const [lastOrderId, setLastOrderId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!tableNumber) {
        setLastOrderId('');
        return;
      }
      try {
        const res = await orderService.getAll({ tableNumber, limit: 1 });
        const last = res.data?.[0];
        if (!cancelled) setLastOrderId(last?._id || '');
      } catch {
        if (!cancelled) setLastOrderId('');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [tableNumber]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-6 animate-in fade-in duration-700">
      <div className="relative">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl shadow-xl animate-bounce">
          <i className="fas fa-check"></i>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-green-500 shadow-md">
          <i className="fas fa-certificate text-sm"></i>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold dark:text-white uppercase tracking-tight">Success!</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-[280px] mx-auto text-sm font-medium">
          Order placed successfully. The kitchen has been notified!
        </p>
      </div>

      <div className="w-full max-w-xs bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
          <span className="text-gray-400">Order Ref</span>
          <span className="text-orange-500 truncate max-w-[120px] ml-4 font-mono">{lastOrderId || 'N/A'}</span>
        </div>
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-gray-400">Status</span>
          <span className="text-green-500">Confirmed</span>
        </div>
      </div>

      <div className="w-full space-y-3 px-4 max-w-xs">
        <Link 
          to={lastOrderId ? `/track/${lastOrderId}` : '/'}
          className={`block w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-[10px] active:scale-95 transition-transform ${!lastOrderId ? 'opacity-50 pointer-events-none' : ''}`}
        >
          Track Order Live
        </Link>
        <Link 
          to="/" 
          className="block w-full text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-[9px] py-2"
        >
          Back to Menu
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
