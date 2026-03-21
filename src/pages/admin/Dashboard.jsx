// src/pages/admin/Dashboard.jsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Table, DollarSign, Clock, ShoppingCart, Utensils, QrCode, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency, STATUS_LABELS, timeAgo } from '../../utils/helpers';

export default function Dashboard() {
  const { orders, loading } = useOrders();
  const { items } = useMenuItems();
  const restaurant = useRestaurant();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const activeOrders = orders.filter(o => o.isActive && o.status !== 'closed');
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => o.createdAt >= todayStart.getTime());
    const revenue = todayOrders
      .filter(o => o.paymentStatus === 'cash_paid' || o.paymentStatus === 'upi_paid')
      .reduce((s, o) => s + (o.total || 0), 0);
    const activeTables = new Set(activeOrders.map(o => o.table)).size;
    const pendingOrders = orders.filter(o => o.status === 'pending' && o.isActive).length;

    return { activeOrders: activeOrders.length, revenue, activeTables, pendingOrders, todayOrders: todayOrders.length };
  }, [orders]);

  const recentOrders = orders.slice(0, 5);

  const statCards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: <FileText size={18} />, color: 'blue', sub: 'Total placed today' },
    { label: 'Active Tables', value: stats.activeTables, icon: <Table size={18} />, color: 'green', sub: 'Currently occupied' },
    { label: "Today's Revenue", value: formatCurrency(stats.revenue, restaurant?.currency), icon: <DollarSign size={18} />, color: 'yellow', sub: 'From paid orders' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: <Clock size={18} />, color: 'red', sub: 'Needs attention', alert: stats.pendingOrders > 0 },
  ];

  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white mb-1">Dashboard</h1>
        <p className="text-white/40 text-sm">Overview of your restaurant's activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`stat-card relative overflow-hidden ${card.alert ? 'animate-pulse-glow' : ''}`}
          >
            {card.alert && <div className="absolute inset-0 border border-red-500/20 rounded-2xl pointer-events-none" />}
            <div className={`inline-flex p-2.5 rounded-xl border mb-4 ${colorMap[card.color]}`}>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{loading ? '—' : card.value}</div>
            <div className="text-white font-medium text-sm">{card.label}</div>
            <div className="text-white/30 text-xs mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg text-white">Recent Orders</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              View all →
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-10 text-white/30">
              <div className="text-4xl mb-2"><Utensils size={40} className="mx-auto" /></div>
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => navigate('/admin/orders')}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-sm font-bold text-white/60">
                    {order.table}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">Table {order.table}</p>
                    <p className="text-white/35 text-xs truncate">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {timeAgo(order.createdAt)}
                    </p>
                  </div>
                  <span className={`status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                  <span className="text-white/60 text-sm font-medium">
                    {formatCurrency(order.total || 0, restaurant?.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="font-display text-lg text-white mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { icon: <FileText size={18} />, label: 'Manage Orders', sub: `${stats.pendingOrders} pending`, to: '/admin/orders' },
              { icon: <Utensils size={18} />, label: 'Edit Menu', sub: `${items.length} items`, to: '/admin/menu' },
              { icon: <QrCode size={18} />, label: 'QR Codes', sub: 'Print table codes', to: '/admin/qr-codes' },
              { icon: <Settings size={18} />, label: 'Settings', sub: 'Restaurant info', to: '/admin/settings' },
            ].map(({ icon, label, sub, to }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-white/35 text-xs">{sub}</p>
                </div>
                <span className="ml-auto text-white/25">›</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
