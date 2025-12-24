
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { MenuItem } from '../../types';
import { menuService, orderService } from '../../services/api';

const Menu: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, cart, updateQuantity, totalPrice, totalItems, setTableNumber, tableNumber, clearCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const table = searchParams.get('table');
    if (table) setTableNumber(table);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, [searchParams, setTableNumber]);

  useEffect(() => {
    let cancelled = false;
    const loadMenu = async () => {
      setIsMenuLoading(true);
      setMenuError('');
      try {
        const res = await menuService.getAll(false);
        if (!cancelled) setMenuItems(res.data);
      } catch (e: any) {
        if (!cancelled) setMenuError(e?.response?.data?.message || e?.message || 'Failed to load menu');
      } finally {
        if (!cancelled) setIsMenuLoading(false);
      }
    };
    loadMenu();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set<string>(menuItems.map((m) => m.category).filter((c): c is string => typeof c === 'string' && c.length > 0))].sort((a, b) => a.localeCompare(b));
    return ['All', ...unique];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchTerm]);

  const getItemQuantity = (id: string) => cart.find(item => item._id === id)?.quantity || 0;

  const handlePlaceOrder = async () => {
    if (isOrdering || totalItems === 0) return;
    const normalizedTableNumber = (tableNumber || '').trim();
    if (!normalizedTableNumber) {
      setIsCartOpen(true);
      alert('Please enter your table number');
      return;
    }
    setIsOrdering(true);

    try {
      const orderPayload = {
        tableNumber: normalizedTableNumber,
        totalAmount: totalPrice,
        items: cart.map((i) => ({ menuItem: i._id, quantity: i.quantity })),
        itemsList: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
        paymentMethod: 'CASH'
      };

      const response = await orderService.placeOrder(orderPayload);
      const newOrder = response.data;
      
      clearCart();
      setIsCartOpen(false);
      navigate(`/track/${newOrder._id}`);
    } catch (error) {
      console.error("Order failed:", error);
      alert("Something went wrong with your order. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="relative pb-32">
      <div className="px-6 pt-6 space-y-5">
        <div>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-1">Premium Dining</p>
          <h2 className="text-3xl font-extrabold dark:text-white tracking-tight leading-none">{greeting}! ✨</h2>
        </div>

        <div className="relative group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Search our menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:text-white shadow-sm"
          />
        </div>
      </div>

      <div className="sticky top-[72px] z-40 glass dark:border-gray-800 border-b border-gray-100 mt-8 mb-4">
        <div className="flex space-x-3 p-4 overflow-x-auto hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'bg-white dark:bg-gray-900 text-gray-400 border border-gray-100 dark:border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {isMenuLoading && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4">Loading Menu...</p>
          </div>
        )}

        {!isMenuLoading && menuError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold">
            {menuError}
          </div>
        )}

        {!isMenuLoading && !menuError && filteredItems.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-xs text-gray-500 font-bold">No dishes found.</p>
          </div>
        )}

        {filteredItems.map((item, idx) => (
          <div 
            key={item._id} 
            className="bg-white dark:bg-gray-900 p-4 rounded-[32px] border border-gray-100 dark:border-gray-800 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all animate-pop"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="relative shrink-0">
              <img src={item.image} className="w-24 h-24 rounded-[24px] object-cover" alt={item.name} />
              <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-md border-2 bg-white flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>

            <div className="flex-1 space-y-1 min-w-0">
              <h4 className="font-extrabold text-gray-900 dark:text-white leading-tight truncate">{item.name}</h4>
              <p className="text-[11px] text-gray-400 font-medium line-clamp-1">{item.description}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="font-black text-orange-500 text-lg">₹{item.price.toFixed(2)}</span>
                
                {getItemQuantity(item._id) > 0 ? (
                  <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
                    <button onClick={() => updateQuantity(item._id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-400"><i className="fas fa-minus text-[10px]"></i></button>
                    <span className="text-xs font-black dark:text-white w-4 text-center">{getItemQuantity(item._id)}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="w-8 h-8 flex items-center justify-center text-orange-500"><i className="fas fa-plus text-[10px]"></i></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(item)}
                    className="bg-gray-900 dark:bg-orange-500 text-white font-black px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] z-[40]">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full h-16 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[24px] shadow-2xl px-6 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                  <i className="fas fa-shopping-basket text-xs"></i>
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-black text-orange-500 text-[8px] font-black rounded-full flex items-center justify-center border-2 border-orange-500">
                  {totalItems}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">View Basket</p>
                <p className="font-black text-sm">₹{totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 font-black uppercase tracking-widest text-[9px]">
              <span>Checkout</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </button>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-[48px] p-8 max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-8"></div>
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black dark:text-white tracking-tight">Your Basket</h3>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">Table {tableNumber || '—'}</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="mb-6 bg-gray-50 dark:bg-gray-800/40 rounded-[24px] border border-gray-100 dark:border-gray-800 p-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Table Number</label>
              <input
                inputMode="numeric"
                placeholder="e.g. 5"
                value={tableNumber ?? ''}
                onChange={(e) => {
                  const next = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
                  setTableNumber(next.length > 0 ? next : null);
                }}
                className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 hide-scrollbar">
              {cart.map(item => (
                <div key={item._id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-[24px]">
                  <img src={item.image} className="w-16 h-16 rounded-[18px] object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-sm dark:text-white truncate">{item.name}</h5>
                    <p className="text-xs font-black text-orange-500 mt-0.5">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center bg-white dark:bg-black rounded-xl border border-gray-100 dark:border-gray-800">
                    <button onClick={() => updateQuantity(item._id, -1)} className="w-8 h-8 text-xs font-bold text-gray-300">-</button>
                    <span className="w-6 text-center text-xs font-black dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="w-8 h-8 text-xs font-bold text-orange-500">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100 dark:border-gray-800 space-y-6">
              <div className="flex justify-between font-black text-2xl dark:text-white">
                <span>Total</span>
                <span className="text-orange-500">₹{totalPrice.toFixed(2)}</span>
              </div>

              <button 
                disabled={isOrdering}
                onClick={handlePlaceOrder}
                className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {isOrdering ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
