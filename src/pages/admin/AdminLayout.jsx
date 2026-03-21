// src/pages/admin/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShoppingCart, Utensils, List, QrCode, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { useOrders } from '../../hooks/useOrders';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/orders', icon: <ShoppingCart size={18} />, label: 'Orders' },
  { to: '/admin/menu', icon: <Utensils size={18} />, label: 'Menu' },
  { to: '/admin/categories', icon: <List size={18} />, label: 'Categories' },
  { to: '/admin/qr-codes', icon: <QrCode size={18} />, label: 'QR Codes' },
  { to: '/admin/settings', icon: <Settings size={18} />, label: 'Settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const restaurant = useRestaurant();
  const { orders } = useOrders();
  const navigate = useNavigate();

  const pendingCount = orders.filter(o => o.status === 'pending' && o.isActive).length;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/25 flex items-center justify-center text-lg">
            <Utensils size={18} />
          </div>
          <div>
            <p className="text-white font-display font-semibold text-sm leading-tight">
              {restaurant?.name || 'TableSide'}
            </p>
            <p className="text-white/30 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
            {label === 'Orders' && pendingCount > 0 && (
              <span className="ml-auto bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/8">
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <span className="inline-flex items-center gap-2"><LogOut size={16} /> Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0E0E10] font-body flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 glass border-r border-white/5 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-60 glass-strong z-50 md:hidden flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden glass w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white"
          >
            ☰
          </button>
          <div className="hidden md:block text-white/30 text-sm">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-white/70">{pendingCount} pending</span>
              </div>
            )}
            <a
              href="/menu?table=1"
              target="_blank"
              rel="noopener noreferrer"
              className="glass px-3 py-1.5 rounded-xl text-xs text-white/50 hover:text-white transition-colors"
            >
              Preview Menu ↗
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
