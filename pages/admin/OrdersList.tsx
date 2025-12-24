
import React, { useState, useEffect } from 'react';
import { OrderStatus } from '../../types';
import { orderService } from '../../services/api';

const OrdersList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const response = await orderService.getAll({});
      // Map MongoDB structure to our UI state
      const mapped = response.data.map((o: any) => ({
        id: o._id,
        table: o.tableNumber,
        itemsList: o.itemsList || 'Order Details',
        total: o.totalAmount,
        status: o.status,
        items: o.items?.length || 0,
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setOrders(mapped);
    } catch (err) {
      console.error("Load orders error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Poll for new orders
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string) => {
    const statusOrder = [
      OrderStatus.RECEIVED, 
      OrderStatus.ACCEPTED, 
      OrderStatus.PREPARING, 
      OrderStatus.READY, 
      OrderStatus.SERVED
    ];

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const currentIdx = statusOrder.indexOf(order.status as OrderStatus);
    const nextStatus = statusOrder[currentIdx + 1];
    
    if (nextStatus) {
      try {
        await orderService.updateStatus(orderId, nextStatus);
        loadOrders(); // Refresh local list
      } catch (err) {
        console.error("Update status error:", err);
      }
    }
  };

  const filteredOrders = activeTab === 'ALL' ? orders : orders.filter(o => o.status === activeTab);

  if (isLoading) return <div className="p-10 text-center dark:text-white font-bold">Connecting to DB...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold dark:text-white">Active Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Managed via live MongoDB connection.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-x-auto hide-scrollbar">
        {['ALL', ...Object.values(OrderStatus).filter(v => v !== OrderStatus.CANCELLED)].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-[32px] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <i className="fas fa-inbox text-4xl text-gray-200 mb-4"></i>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active orders</p>
          </div>
        ) : filteredOrders.map(order => (
          <div key={order.id} className="bg-white dark:bg-gray-900 p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-xl transition-all group">
            <div className="flex items-start space-x-4 min-w-0 flex-1">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 transition-transform group-hover:scale-110">
                <span className="text-[10px] uppercase opacity-60">Table</span>
                <span className="text-xl leading-none">{order.table}</span>
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-lg dark:text-white truncate">#{order.id.slice(-6).toUpperCase()}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{order.itemsList}</p>
                <p className="text-xs font-bold text-orange-500">₹{order.total.toFixed(2)} • {order.time}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end space-x-4">
              <div className="text-left sm:text-right">
                <span className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                  order.status === OrderStatus.SERVED ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {order.status}
                </span>
              </div>
              <button 
                onClick={() => updateStatus(order.id)}
                disabled={order.status === OrderStatus.SERVED}
                className="h-11 px-6 bg-orange-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest disabled:opacity-30"
              >
                Next Status
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersList;
