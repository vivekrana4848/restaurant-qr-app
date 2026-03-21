// src/components/customer/CartDrawer.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingCart, Utensils, Plus, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency, calcTax } from '../../utils/helpers';

export default function CartDrawer({ open, onClose, onPlaceOrder, placing, activeOrder }) {
  const { items, subtotal, dispatch } = useCart();
  const restaurant = useRestaurant();
  const tax = calcTax(subtotal, restaurant?.taxRate || 5);
  const total = subtotal + tax;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm glass-strong z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div>
                <h2 className="font-display text-xl text-white">Your Cart</h2>
                {activeOrder && (
                  <p className="text-xs text-green-400 mt-0.5">Will merge with active order</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16 text-white/30">
                  <div className="text-5xl mb-3"><ShoppingCart size={48} className="mx-auto" /></div>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl"><Utensils size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-white/50 text-xs">{formatCurrency(item.price, restaurant?.currency)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, qty: item.qty - 1 } })}
                        className="w-6 h-6 rounded-lg bg-white/10 text-white text-xs flex items-center justify-center hover:bg-white/15"
                      >−</button>
                      <span className="text-white text-sm w-4 text-center font-bold">{item.qty}</span>
                      <button
                        onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, qty: item.qty + 1 } })}
                        className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 text-xs flex items-center justify-center"
                      >+</button>
                    </div>
                    <div className="text-white text-sm font-semibold w-14 text-right">
                      {formatCurrency(item.price * item.qty, restaurant?.currency)}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-white/8 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, restaurant?.currency)}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>GST ({restaurant?.taxRate || 5}%)</span>
                    <span>{formatCurrency(tax, restaurant?.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-white/8">
                    <span>Total</span>
                    <span className="text-red-400">{formatCurrency(total, restaurant?.currency)}</span>
                  </div>
                </div>
                <button
                  onClick={onPlaceOrder}
                  disabled={placing}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
                >
                      {placing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      {activeOrder ? (<><Plus size={14} className="inline-block mr-2"/> Add to Active Order</>) : (<><CheckCircle size={14} className="inline-block mr-2"/> Place Order</>)}
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
