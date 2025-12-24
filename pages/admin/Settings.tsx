
import React, { useEffect, useState } from 'react';
import { settingsService } from '../../services/api';

const Settings: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    logo: '',
    currency: 'USD',
    contactNumber: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setMessage('');
      try {
        const res = await settingsService.getRestaurant();
        if (!cancelled) setForm(res.data);
      } catch (e: any) {
        if (!cancelled) setMessage(e?.response?.data?.message || e?.message || 'Failed to load settings');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await settingsService.updateRestaurant(form);
      setMessage('Saved');
    } catch (e: any) {
      setMessage(e?.response?.data?.message || e?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
        <p className="text-gray-500 mt-1">General restaurant configuration and administrative details.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${message === 'Saved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold dark:text-white flex items-center space-x-3">
              <i className="fas fa-store text-orange-500"></i>
              <span>Restaurant Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Restaurant Name</label>
                <input 
                  type="text" 
                  value={form.name}
                  disabled={isLoading}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                <input 
                  type="tel" 
                  value={form.contactNumber}
                  disabled={isLoading}
                  onChange={(e) => setForm((p) => ({ ...p, contactNumber: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Store Address</label>
              <textarea 
                rows={3}
                value={form.address}
                disabled={isLoading}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 transition-all dark:text-white resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={isLoading || isSaving}
                onClick={save}
                className="bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all transform active:scale-95 disabled:opacity-50"
              >
                Save Restaurant Info
              </button>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold dark:text-white flex items-center space-x-3">
              <i className="fas fa-cog text-orange-500"></i>
              <span>System Preferences</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div>
                  <h4 className="font-bold dark:text-white">Order Notifications</h4>
                  <p className="text-xs text-gray-500">Play sound when new order arrives</p>
                </div>
                <div className="w-12 h-6 bg-orange-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div>
                  <h4 className="font-bold dark:text-white">Auto-Accept Orders</h4>
                  <p className="text-xs text-gray-500">Automatically move RECEIVED to ACCEPTED</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Logo Upload */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <h3 className="text-lg font-bold dark:text-white mb-6">Store Logo</h3>
            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-[32px] mx-auto flex items-center justify-center border-4 border-dashed border-gray-200 dark:border-gray-700 relative overflow-hidden group">
              <i className="fas fa-image text-3xl text-gray-300"></i>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                <i className="fas fa-camera"></i>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Recommended: 512x512px SVG or PNG</p>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-orange-500 p-8 rounded-[32px] shadow-xl shadow-orange-500/30 text-white space-y-4">
            <h3 className="text-lg font-bold">Billing Plan</h3>
            <p className="text-sm opacity-80">You are currently on the <span className="font-bold">Enterprise Pro</span> plan with unlimited tables.</p>
            <div className="pt-4">
              <button className="w-full bg-white text-orange-500 font-bold py-3 rounded-xl shadow-md">
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
