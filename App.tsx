
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import CustomerLayout from './components/layout/CustomerLayout.tsx';
import AdminLayout from './components/layout/AdminLayout.tsx';

// Customer Pages
import Menu from './pages/customer/Menu.tsx';
import OrderTracking from './pages/customer/OrderTracking.tsx';
import PaymentSuccess from './pages/customer/PaymentSuccess.tsx';

// Admin Pages
import AdminLogin from './pages/admin/Login.tsx';
import Dashboard from './pages/admin/Dashboard.tsx';
import OrdersList from './pages/admin/OrdersList.tsx';
import MenuManagement from './pages/admin/MenuManagement.tsx';
import Settings from './pages/admin/Settings.tsx';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<Menu />} />
                <Route path="menu" element={<Navigate to="/" replace />} />
                <Route path="track/:orderId" element={<OrderTracking />} />
                <Route path="payment-success" element={<PaymentSuccess />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<OrdersList />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
