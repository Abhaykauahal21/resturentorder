
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OrderStatus } from '../../types';
import { orderService } from '../../services/api';

const STATUS_STEPS = [
  { id: OrderStatus.RECEIVED, label: 'Received', icon: 'fa-clipboard-list', sub: 'Order sent to kitchen' },
  { id: OrderStatus.ACCEPTED, label: 'Accepted', icon: 'fa-check-circle', sub: 'Confirmed by Chef' },
  { id: OrderStatus.PREPARING, label: 'Preparing', icon: 'fa-fire-burner', sub: 'Cooking your meal' },
  { id: OrderStatus.READY, label: 'Ready', icon: 'fa-bell', sub: 'Waitstaff notified' },
  { id: OrderStatus.SERVED, label: 'Served', icon: 'fa-utensils', sub: 'Enjoy your meal!' },
];

const OrderTracking: React.FC = () => {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(OrderStatus.RECEIVED);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const response = await orderService.getById(orderId);
      const order = response.data;
      setOrderData({
        id: order._id || order.id,
        table: order.tableNumber,
        status: order.status,
        total: order.totalAmount,
        time: new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itemsList: order.itemsList || 'Order Details'
      });
      setCurrentStatus(order.status as OrderStatus);
      setIsOffline(false);
      setErrorMessage('');
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        setOrderData(null);
        setErrorMessage('');
        setIsOffline(false);
        return;
      }
      setIsOffline(true);
      setErrorMessage(error?.response?.data?.message || error?.message || 'Failed to fetch order status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (isLoading) return <div className="p-20 text-center flex flex-col items-center space-y-4">
    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Status...</p>
  </div>;

  if (!orderData) return (
    <div className="p-10 text-center space-y-6">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300 text-3xl">
        <i className="fas fa-search"></i>
      </div>
      <h2 className="text-xl font-black dark:text-white uppercase tracking-widest">Order Not Found</h2>
      <p className="text-xs text-gray-500">We couldn't locate order ID: {orderId}</p>
      {errorMessage && <p className="text-xs text-red-500 font-bold">{errorMessage}</p>}
      <Link to="/" className="block bg-orange-500 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest">Go to Menu</Link>
    </div>
  );

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.id === currentStatus);
  const isServed = currentStatus === OrderStatus.SERVED;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-sm mx-auto">
      {isOffline && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 p-3 rounded-xl flex items-center space-x-3 text-yellow-700 dark:text-yellow-400">
          <i className="fas fa-wifi-slash animate-pulse text-xs"></i>
          <p className="text-[9px] font-black uppercase tracking-widest">Connection issue: status may be outdated</p>
        </div>
      )}

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter">
          {isServed ? 'Order Served!' : 'Tracking Order'}
        </h2>
        <div className="inline-flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/30 px-4 py-1.5 rounded-full border border-orange-100 dark:border-orange-800">
          <span className={`w-2 h-2 rounded-full ${isServed ? 'bg-green-500' : 'bg-orange-500 animate-ping'}`}></span>
          <p className="text-orange-600 dark:text-orange-400 font-mono font-bold tracking-widest text-[10px] uppercase truncate max-w-[150px]">{orderData.id}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-2xl border border-gray-50 dark:border-gray-700">
        <div className="space-y-10 relative">
          <div className="absolute left-[20px] top-6 bottom-6 w-0.5 bg-gray-50 dark:bg-gray-700"></div>
          <div 
            className="absolute left-[20px] top-6 w-0.5 bg-orange-500 transition-all duration-1000"
            style={{ height: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
          ></div>

          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            
            return (
              <div key={step.id} className={`flex items-start space-x-6 relative z-10 transition-opacity duration-500 ${isCompleted || isCurrent ? 'opacity-100' : 'opacity-20'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 ${
                  isCurrent ? 'bg-orange-500 border-orange-200 shadow-xl scale-125' : 
                  isCompleted ? 'bg-green-500 border-green-100' : 
                  'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                }`}>
                  <i className={`fas ${step.icon} text-xs ${isCompleted || isCurrent ? 'text-white' : 'text-gray-300'}`}></i>
                </div>
                <div className="pt-0.5">
                  <h4 className={`font-black text-xs uppercase tracking-widest ${isCurrent ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>{step.label}</h4>
                  <p className="text-[9px] text-gray-400 font-medium mt-0.5 italic">
                    {isCurrent ? step.sub : isCompleted ? "Completed" : "Next up..."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-50 dark:border-gray-800 space-y-4 shadow-sm">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Details</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-start">
             <p className="text-xs font-bold dark:text-white leading-relaxed flex-1">{orderData.itemsList}</p>
             <p className="text-xs font-black text-orange-500 ml-4 shrink-0">₹{orderData.total.toFixed(2)}</p>
          </div>
          <div className="pt-3 border-t border-dashed border-gray-100 dark:border-gray-800 flex justify-between">
            <span className="text-[9px] font-black text-gray-400 uppercase">Table Number</span>
            <span className="text-[9px] font-black dark:text-white uppercase">{orderData.table}</span>
          </div>
        </div>
      </div>

      <Link 
        to="/" 
        className="block w-full text-center py-5 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-[24px] shadow-xl uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
      >
        Back to Menu
      </Link>
    </div>
  );
};

export default OrderTracking;
