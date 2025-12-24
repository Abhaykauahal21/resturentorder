
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { OrderStatus } from '../../types';
import { orderService } from '../../services/api';

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: 'Today\'s Orders', value: '0', icon: 'fa-shopping-cart', color: 'bg-blue-500' },
    { label: 'In Preparation', value: '0', icon: 'fa-fire', color: 'bg-orange-500' },
    { label: 'Net Revenue', value: '₹0', icon: 'fa-wallet', color: 'bg-green-500' },
    { label: 'Active Tables', value: '0/15', icon: 'fa-chair', color: 'bg-purple-500' },
  ]);

  useEffect(() => {
    let cancelled = false;

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    const syncDashboard = async () => {
      try {
        const res = await orderService.getAll({});
        const parsedOrders = res.data || [];
        if (cancelled) return;
        setOrders(parsedOrders);

        const now = new Date();
        const todayOrders = parsedOrders.filter((o: any) => isSameDay(new Date(o.createdAt), now));
        const todayCount = todayOrders.length;
        const prepCount = parsedOrders.filter((o: any) => o.status === OrderStatus.PREPARING || o.status === OrderStatus.ACCEPTED).length;
        const totalRev = todayOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
        const uniqueTables = new Set(parsedOrders.filter((o: any) => o.status !== OrderStatus.SERVED).map((o: any) => o.tableNumber)).size;

        setStats([
          { label: 'Today\'s Orders', value: todayCount.toString(), icon: 'fa-shopping-cart', color: 'bg-blue-500' },
          { label: 'In Preparation', value: prepCount.toString(), icon: 'fa-fire', color: 'bg-orange-500' },
          { label: 'Net Revenue', value: `₹${totalRev.toFixed(2)}`, icon: 'fa-wallet', color: 'bg-green-500' },
          { label: 'Active Tables', value: `${uniqueTables}/15`, icon: 'fa-chair', color: 'bg-purple-500' },
        ]);
      } catch (e) {
        if (!cancelled) console.error("Dashboard sync error", e);
      }
    };

    syncDashboard();
    const interval = setInterval(syncDashboard, 10000);
    window.addEventListener('orderStatusChanged', syncDashboard as any);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('orderStatusChanged', syncDashboard as any);
    };
  }, []);

  const revenueData = (() => {
    const now = new Date();
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - idx));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const byDay = new Map(days.map((d) => [d.getTime(), 0]));
    for (const o of orders) {
      const created = new Date(o.createdAt);
      created.setHours(0, 0, 0, 0);
      const key = created.getTime();
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + (o.totalAmount || 0));
    }

    return days.map((d, idx) => ({
      name: idx === 6 ? 'Today' : d.toLocaleDateString([], { weekday: 'short' }),
      total: byDay.get(d.getTime()) || 0,
    }));
  })();

  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold dark:text-white leading-tight">Overview</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Live monitoring of your store performance.</p>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 dark:bg-orange-950/30 px-4 py-2 rounded-xl border border-orange-100 dark:border-orange-900/50">
          Sync Status: Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 p-5 lg:p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-4 hover:shadow-lg transition-shadow animate-pop">
            <div className={`w-12 h-12 lg:w-14 lg:h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shrink-0`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] lg:text-xs text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest truncate">{stat.label}</p>
              <h3 className="text-xl lg:text-2xl font-black dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 p-5 lg:p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Earnings Projection</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Real-time</button>
            </div>
          </div>
          <div className="h-[250px] lg:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6', opacity: 0.4}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}} 
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={32}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? '#F97316' : '#FED7AA'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 lg:p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">Recent Logs</h3>
          <div className="space-y-6">
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10">No recent activity.</p>
            ) : orders.slice(0, 5).map((order, i) => (
              <div key={order._id || order.id} className="flex items-start space-x-4 relative">
                {i < 4 && <div className="absolute left-[7px] top-6 w-[1px] h-10 bg-gray-100 dark:bg-gray-800"></div>}
                <div className={`mt-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 shadow-sm z-10 ${order.status === OrderStatus.SERVED ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                <div className="min-w-0">
                  <p className="text-xs font-black dark:text-white uppercase tracking-tight">Table {order.tableNumber || order.table}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">
                    Status: <span className="text-orange-500 font-bold">{order.status}</span>
                  </p>
                  <p className="text-[9px] text-gray-300 font-black mt-1 uppercase">Just Now</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => window.location.hash = '#/admin/orders'}
            className="w-full mt-10 py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-orange-500 hover:text-white transition-all"
          >
            All Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
