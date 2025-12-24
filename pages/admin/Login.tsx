
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      login(res.data);
      navigate('/admin/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md space-y-8 animate-in zoom-in duration-500">
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-2xl border border-white dark:border-gray-800 text-center relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16"></div>
          
          <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl shadow-xl shadow-orange-500/30 mb-6 relative">
            <i className="fas fa-user-shield"></i>
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Admin Login</h2>
          <p className="text-gray-500 mt-2 mb-8 text-sm font-medium">Secure access to QuickServe Dashboard</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 animate-bounce">
              <i className="fas fa-exclamation-circle"></i>
              <p className="text-xs font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-left space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <div className="relative group">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-500 transition-colors"></i>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@admin.com"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all dark:text-white outline-none"
                />
              </div>
            </div>
            
            <div className="text-left space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Password</label>
              <div className="relative group">
                <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-500 transition-colors"></i>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all dark:text-white outline-none"
                />
              </div>
            </div>
            
            <button 
              disabled={isLoading}
              className="w-full bg-gray-900 dark:bg-orange-500 hover:bg-black dark:hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-gray-900/10 dark:shadow-orange-500/20 transform transition-all active:scale-95 mt-4 flex items-center justify-center space-x-3 uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Authenticate</span>
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-gray-50 dark:border-gray-800">
            <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
              <i className="fas fa-shield-alt text-orange-500"></i>
              <span>Restricted Access Area</span>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
          QuickServe Admin Node v2.4.0
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
