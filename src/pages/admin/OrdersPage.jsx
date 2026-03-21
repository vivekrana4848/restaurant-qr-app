// src/pages/admin/OrdersPage.jsx
import { useState, useEffect, useRef } from 'react';
import { ref as dbRef, onValue } from 'firebase/database';
import { db } from '../../firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CreditCard, Smartphone, Clock, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrders } from '../../hooks/useOrders';
import { useRestaurant } from '../../context/RestaurantContext';
import { updateOrder } from '../../firebase/database';
import { formatCurrency, calcTax, STATUS_LABELS, NEXT_STATUS, NEXT_STATUS_LABEL, timeAgo } from '../../utils/helpers';
import { generateBillPDF } from '../../utils/billGenerator';
import BillModal from '../../components/admin/BillModal';

const FILTER_TABS = ['all', 'pending', 'preparing', 'ready', 'served', 'closed'];

export default function OrdersPage() {
  const { orders, loading } = useOrders();
  const restaurant = useRestaurant();
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [billOrder, setBillOrder] = useState(null);
  const prevOrderCount = useRef(0);
  const audioRef = useRef(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Initialize audio once and unlock on first user interaction
  useEffect(() => {
    // Create single Audio instance
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.preload = 'auto';

    const unlockAudio = () => {
      setIsUnlocked(true);
      // Try to play then pause to unlock the audio on some browsers
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }).catch(() => {});
      }
      document.removeEventListener('click', unlockAudio);
    };

    document.addEventListener('click', unlockAudio, { once: true });

    return () => {
      document.removeEventListener('click', unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Firebase listener for orders — play sound when pending count increases
  useEffect(() => {
    const ordersRef = dbRef(db, 'orders');

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const ordersArray = Object.values(data);

      const pendingOrders = ordersArray.filter(o => o.status === 'pending');
      const currentCount = pendingOrders.length;

      // Only trigger after initial load and when audio is unlocked
      if (currentCount > prevOrderCount.current && prevOrderCount.current !== 0) {
        console.log('New Order Detected', { prev: prevOrderCount.current, now: currentCount });
        if (isUnlocked && audioRef.current) {
          try {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
              console.log('Audio blocked until interaction');
            });
          } catch (e) {
            console.log('Audio play error', e);
          }
        }
        toast('New order received!');
      }

      prevOrderCount.current = currentCount;
    });

    return () => unsubscribe();
  }, [isUnlocked]);

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const handleStatusUpdate = async (order, newStatus) => {
    try {
      const isActive = newStatus !== 'closed';
      await updateOrder(order.id, { status: newStatus, isActive });
      toast.success(`Order marked as ${STATUS_LABELS[newStatus]}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePayment = async (order, method) => {
    try {
      const payStatus = method === 'cash' ? 'cash_paid' : 'upi_paid';
      await updateOrder(order.id, { paymentStatus: payStatus });
      toast.success(`Payment marked as ${method === 'cash' ? 'Cash' : 'UPI'} paid`);
    } catch {
      toast.error('Failed to update payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Orders</h1>
          <p className="text-white/40 text-sm">{orders.length} total · {orders.filter(o => o.isActive).length} active</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTER_TABS.map(tab => {
          const count = tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                filter === tab
                  ? 'bg-red-600/20 border border-red-500/30 text-red-400'
                  : 'glass text-white/50 hover:text-white/80'
              }`}
            >
              <span className="capitalize">{tab === 'all' ? 'All' : STATUS_LABELS[tab]}</span>
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  filter === tab ? 'bg-red-600/30' : 'bg-white/10'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <div className="text-5xl mb-3"><FileText size={48} className="mx-auto" /></div>
          <p>No {filter !== 'all' ? filter : ''} orders</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                restaurant={restaurant}
                onStatusUpdate={handleStatusUpdate}
                onPayment={handlePayment}
                onBill={() => setBillOrder(order)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Bill Modal */}
      {billOrder && (
        <BillModal
          order={billOrder}
          restaurant={restaurant}
          onClose={() => setBillOrder(null)}
        />
      )}
    </div>
  );
}

function OrderCard({ order, restaurant, onStatusUpdate, onPayment, onBill }) {
  const subtotal = order.subtotal || order.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0;
  const total = order.total || subtotal;
  const isPaid = order.paymentStatus === 'cash_paid' || order.paymentStatus === 'upi_paid';
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass rounded-2xl p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-lg">Table {order.table}</span>
            {order.isActive && order.status !== 'closed' && (
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <p className="text-white/35 text-xs">#{order.id?.slice(-6).toUpperCase()} · {timeAgo(order.createdAt)}</p>
        </div>
        <span className={`status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white/70 flex-1 truncate">{item.name}</span>
            <span className="text-white/40">×{item.qty}</span>
            <span className="text-white/70">{formatCurrency(item.price * item.qty, restaurant?.currency)}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-white/8">
        <div>
          <p className="text-white font-bold">{formatCurrency(total, restaurant?.currency)}</p>
          <p className={`text-xs mt-0.5 ${isPaid ? 'text-green-400' : 'text-yellow-400'}`}>
            {order.paymentStatus === 'cash_paid' ? (<span className="inline-flex items-center gap-2"><CreditCard size={14} /> Cash Paid</span>)
              : order.paymentStatus === 'upi_paid' ? (<span className="inline-flex items-center gap-2"><Smartphone size={14} /> UPI Paid</span>)
              : (<span className="inline-flex items-center gap-2"><Clock size={14} /> Payment Pending</span>)}
          </p>
        </div>
        <button
          onClick={onBill}
          className="glass px-3 py-1.5 rounded-xl text-xs text-white/60 hover:text-white transition-colors"
        >
          <span className="inline-flex items-center gap-2"><FileText size={14} /> Bill</span>
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {/* Status button */}
        {nextStatus && (
          <button
            onClick={() => onStatusUpdate(order, nextStatus)}
            className="btn-primary w-full py-2.5 text-sm"
          >
            {NEXT_STATUS_LABEL[order.status]}
          </button>
        )}

        {/* Payment buttons */}
        {!isPaid && order.status !== 'pending' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onPayment(order, 'cash')}
              className="glass py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/8 transition-all font-medium"
            >
              <span className="inline-flex items-center gap-2"><CreditCard size={14} /> Cash Paid</span>
            </button>
            <button
              onClick={() => onPayment(order, 'upi')}
              className="glass py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/8 transition-all font-medium"
            >
              <span className="inline-flex items-center gap-2"><Smartphone size={14} /> UPI Paid</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
