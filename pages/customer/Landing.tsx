
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Landing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setTableNumber, tableNumber } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const table = searchParams.get('table');
    if (table) {
      setTableNumber(table);
      // Wait a moment for UX before redirecting
      const timer = setTimeout(() => navigate('/menu'), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setTableNumber, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center text-white text-5xl shadow-2xl animate-bounce">
          <i className="fas fa-utensils"></i>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold dark:text-white">Welcome 👋</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-[250px] mx-auto">
          {searchParams.get('table') 
            ? `Identifying Table ${searchParams.get('table')}...` 
            : "Welcome to our digital dining experience. Please use your table's direct link to start ordering."}
        </p>
      </div>

      {!searchParams.get('table') && !tableNumber && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl w-full max-w-xs border-dashed border-2 border-gray-300 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Demo Tip: Open this page with <code>?table=5</code> in the URL to simulate a seated guest.</p>
        </div>
      )}
      
      {!searchParams.get('table') && tableNumber && (
        <button 
          onClick={() => navigate('/menu')}
          className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/20"
        >
          Return to Table {tableNumber} Menu
        </button>
      )}

      {searchParams.get('table') && (
        <div className="flex items-center space-x-2 text-orange-500 font-medium">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Menu...</span>
        </div>
      )}
    </div>
  );
};

export default Landing;
