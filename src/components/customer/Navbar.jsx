// src/components/customer/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table as TableIcon, ShoppingCart } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export default function Navbar({ onCartClick, cartCount = 0, tableNumber }) {
  const restaurant = useRestaurant();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-display text-xl text-white hover:text-red-400 transition-colors">
            {restaurant?.name || 'TableSide'}
          </Link>

          {/* Center: table badge */}
          {tableNumber && (
            <div className="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-white/60">
              <TableIcon size={14} /> Table {tableNumber}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-3">
            {tableNumber && (
              <button
                onClick={() => navigate(`/order-status?table=${tableNumber}`)}
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                My Order
              </button>
            )}
            {onCartClick && (
              <button
                onClick={onCartClick}
                className="relative glass px-4 py-2 rounded-xl text-white/70 hover:text-white transition-all hover:bg-white/8"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
