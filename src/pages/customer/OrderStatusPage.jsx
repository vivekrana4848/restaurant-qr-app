// src/pages/customer/OrderStatusPage.jsx
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTableOrder } from '../../hooks/useOrders';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency, calcTax, STATUS_LABELS } from '../../utils/helpers';
import Navbar from '../../components/customer/Navbar';

const STATUS_STEPS = ['pending', 'preparing', 'ready', 'served'];
const STATUS_ICONS = {
  pending: '⏳',
  preparing: '👨‍🍳',
  ready: '🔔',
  served: '✅',
  closed: '🎉',
};
const STATUS_MESSAGES = {
  pending: 'Your order has been received. Hang tight!',
  preparing: 'Our chefs are preparing your food with care.',
  ready: 'Your order is ready! The waiter is on the way.',
  served: 'Enjoy your meal! 😋',
  closed: 'Thank you for dining with us. See you again!',
};

export default function OrderStatusPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = params.get('table') ? Number(params.get('table')) : null;
  const { order, loading } = useTableOrder(tableNumber);
  const restaurant = useRestaurant();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0E10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0E0E10] font-body">
        <Navbar tableNumber={tableNumber} />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6">
          <div className="text-6xl">🍽️</div>
          <h2 className="font-display text-3xl text-white text-center">No Active Order</h2>
          <p className="text-white/40 text-center">You don't have an active order for Table {tableNumber}.</p>
          <button
            onClick={() => navigate(`/menu?table=${tableNumber}`)}
            className="btn-primary"
          >
            Start Ordering
          </button>
        </div>
      </div>
    );
  }

  const subtotal = order.subtotal || order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = order.tax || calcTax(subtotal, restaurant?.taxRate || 5);
  const total = order.total || subtotal + tax;
  const currentStepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#0E0E10] font-body pb-20">
      <Navbar tableNumber={tableNumber} />

      <div className="pt-24 max-w-2xl mx-auto px-4">
        {/* Status hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-6 text-center"
        >
          <motion.div
            key={order.status}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl mb-4"
          >
            {STATUS_ICONS[order.status] || '⏳'}
          </motion.div>
          <h2 className="font-display text-2xl text-white mb-2">
            {STATUS_LABELS[order.status] || order.status}
          </h2>
          <p className="text-white/50 text-sm">{STATUS_MESSAGES[order.status]}</p>

          {/* Progress bar */}
          {order.status !== 'closed' && (
            <div className="mt-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-white/10" />
                <div
                  className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-red-600 to-red-400 transition-all duration-700"
                  style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                      i <= currentStepIdx
                        ? 'bg-red-600 text-white'
                        : 'bg-white/10 text-white/30'
                    }`}>
                      {i < currentStepIdx ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs ${i <= currentStepIdx ? 'text-white/70' : 'text-white/25'}`}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Order details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg text-white">Order Summary</h3>
            <span className="text-white/30 text-xs">#{order.id?.slice(-6).toUpperCase()}</span>
          </div>

          <div className="space-y-3 mb-5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-white/80 flex-1">{item.name}</span>
                <span className="text-white/40 text-sm">×{item.qty}</span>
                <span className="text-white text-sm font-medium">
                  {formatCurrency(item.price * item.qty, restaurant?.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-white/50">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, restaurant?.currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/50">
              <span>GST ({restaurant?.taxRate || 5}%)</span>
              <span>{formatCurrency(tax, restaurant?.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-white pt-1 border-t border-white/8">
              <span>Total</span>
              <span className="text-red-400 text-lg">{formatCurrency(total, restaurant?.currency)}</span>
            </div>
          </div>

          {/* Payment status */}
          <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
            <span className="text-white/40 text-sm">Payment</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              order.paymentStatus === 'cash_paid' || order.paymentStatus === 'upi_paid'
                ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
            }`}>
              {order.paymentStatus === 'cash_paid' ? '💵 Cash Paid'
                : order.paymentStatus === 'upi_paid' ? '📱 UPI Paid'
                : '⏳ Pending'}
            </span>
          </div>
        </motion.div>

        {/* Add more items button */}
        {order.isActive && order.status !== 'closed' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate(`/menu?table=${tableNumber}`)}
            className="w-full btn-ghost flex items-center justify-center gap-2 py-4"
          >
            <span>+</span> Add More Items
          </motion.button>
        )}
      </div>
    </div>
  );
}
