
import React, { useEffect, useMemo, useState } from 'react';
import { MenuItem } from '../../types';
import { menuService } from '../../services/api';

const MenuManagement: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    isVeg: true,
    isAvailable: true,
  });

  const loadMenu = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await menuService.getAll(true);
      setMenuItems(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load menu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set<string>(menuItems.map((m) => m.category).filter((c): c is string => typeof c === 'string' && c.length > 0))].sort((a, b) => a.localeCompare(b));
    return ['All', ...unique];
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        q.length === 0 ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, menuItems, searchTerm]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      category: '',
      price: '',
      image: '',
      isVeg: true,
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      price: String(item.price ?? ''),
      image: item.image || '',
      isVeg: !!item.isVeg,
      isAvailable: item.isAvailable !== false,
    });
    setIsModalOpen(true);
  };

  const saveItem = async () => {
    const price = Number(form.price);
    if (!form.name.trim() || !form.category.trim() || !Number.isFinite(price)) {
      setError('Name, category, and price are required');
      return;
    }

    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price,
        image: form.image.trim(),
        isVeg: form.isVeg,
        isAvailable: form.isAvailable,
      };
      if (editingId) await menuService.update(editingId, payload);
      else await menuService.create(payload);
      setIsModalOpen(false);
      await loadMenu();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save menu item');
    }
  };

  const deleteItem = async (id: string) => {
    const ok = window.confirm('Delete this dish?');
    if (!ok) return;
    setError('');
    try {
      await menuService.remove(id);
      await loadMenu();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete menu item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold dark:text-white">Menu Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your digital restaurant menu in real-time.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-orange-500 text-white w-full md:w-auto px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2 hover:bg-orange-600 transition-transform active:scale-95"
        >
          <i className="fas fa-plus"></i>
          <span>Add New Dish</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-4 lg:p-6 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="relative w-full md:max-w-md">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 dark:text-white shadow-inner transition-all"
            />
          </div>
          <div className="flex space-x-2">
            <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:text-orange-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 border-b border-gray-50 dark:border-gray-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/30 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
              <tr>
                <th className="px-8 py-5">Dish Info</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-sm text-gray-500 dark:text-gray-400 font-bold">
                    Loading menu...
                  </td>
                </tr>
              ) : filteredMenuItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-sm text-gray-500 dark:text-gray-400 font-bold">
                    No dishes found.
                  </td>
                </tr>
              ) : filteredMenuItems.map(item => (
                <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <img src={item.image || `https://picsum.photos/100/100?random=${item._id}`} className="w-12 h-12 rounded-xl object-cover" alt="" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold dark:text-white">{item.name}</h4>
                          <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">SKU: QSB-{item._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-orange-500 text-lg">₹{item.price.toFixed(2)}</td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      item.isAvailable ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {item.isAvailable ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="w-10 h-10 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-xl flex items-center justify-center hover:text-orange-500 transition-all"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => deleteItem(item._id)}
                        className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-4">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400 font-bold">Loading menu...</div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400 font-bold">No dishes found.</div>
          ) : filteredMenuItems.map(item => (
              <div key={item._id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex space-x-4">
                <img src={item.image || `https://picsum.photos/100/100?random=${item._id}`} className="w-20 h-20 rounded-2xl object-cover shrink-0" alt="" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold dark:text-white truncate pr-2">{item.name}</h4>
                    <span className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-orange-500 font-black">₹{item.price.toFixed(2)}</p>
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-50 dark:text-white">{item.category}</span>
                  </div>
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex-1 bg-white dark:bg-gray-800 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-gray-700 dark:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="flex-1 bg-red-50 text-red-500 dark:bg-red-900/20 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-t-[40px] md:rounded-[40px] p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black dark:text-white">{editingId ? 'Edit Dish' : 'Add New Dish'}</h3>
                <p className="text-xs text-gray-500 mt-1">Changes apply instantly from MongoDB.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all dark:text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all dark:text-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price</label>
                <input
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all dark:text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Image URL</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl md:col-span-2">
                <div>
                  <h4 className="font-bold dark:text-white">Vegetarian</h4>
                  <p className="text-xs text-gray-500">Marks dish as veg in customer menu</p>
                </div>
                <button
                  onClick={() => setForm((p) => ({ ...p, isVeg: !p.isVeg }))}
                  className={`w-12 h-6 rounded-full relative transition-colors ${form.isVeg ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isVeg ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl md:col-span-2">
                <div>
                  <h4 className="font-bold dark:text-white">Available</h4>
                  <p className="text-xs text-gray-500">Shows dish to customers</p>
                </div>
                <button
                  onClick={() => setForm((p) => ({ ...p, isAvailable: !p.isAvailable }))}
                  className={`w-12 h-6 rounded-full relative transition-colors ${form.isAvailable ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isAvailable ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full md:w-auto px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={saveItem}
                className="w-full md:flex-1 bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
