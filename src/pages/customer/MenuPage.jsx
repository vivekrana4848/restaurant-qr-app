// src/pages/customer/MenuPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Utensils, Star, Table as TableIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCategories } from '../../hooks/useCategories';
import { useTableOrder } from '../../hooks/useOrders';
import { useCart } from '../../context/CartContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { createOrder, updateOrder, getActiveOrderForTable } from '../../firebase/database';
import { formatCurrency, calcTax } from '../../utils/helpers';
import FoodCard from '../../components/customer/FoodCard';
import CartDrawer from '../../components/customer/CartDrawer';
import Navbar from '../../components/customer/Navbar';

export default function MenuPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = params.get('table') ? Number(params.get('table')) : null;

  const { items, loading: itemsLoading } = useMenuItems();
  const { categories } = useCategories();
  const { order: activeOrder } = useTableOrder(tableNumber);
  const restaurant = useRestaurant();
  const { items: cartItems, subtotal, totalItems, dispatch } = useCart();

  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);

  const notifAudio = useRef(null);

  useEffect(() => {
    if (tableNumber) {
      dispatch({ type: 'SET_TABLE', payload: tableNumber });
    }
  }, [tableNumber]);

  useEffect(() => {
    if (activeOrder) {
      dispatch({ type: 'SET_ACTIVE_ORDER', payload: activeOrder.id });
    }
  }, [activeOrder]);

  const filtered = items.filter(item => {
    if (!item.available) return false;
    if (vegOnly && !item.isVeg) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'specials') return item.isSpecial;
    return item.category === activeCategory;
  });

  const handlePlaceOrder = async () => {
    if (!tableNumber) {
      toast.error('No table selected. Please scan a QR code.');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacing(true);
    try {
      const tax = calcTax(subtotal, restaurant?.taxRate || 5);
      const orderItems = cartItems.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        isVeg: i.isVeg
      }));

      if (activeOrder) {
        // Merge into existing active order
        const merged = [...activeOrder.items];
        for (const newItem of orderItems) {
          const existing = merged.find(m => m.id === newItem.id);
          if (existing) {
            existing.qty += newItem.qty;
          } else {
            merged.push(newItem);
          }
        }
        const newSubtotal = merged.reduce((s, i) => s + i.price * i.qty, 0);
        const newTax = calcTax(newSubtotal, restaurant?.taxRate || 5);
        await updateOrder(activeOrder.id, {
          items: merged,
          subtotal: newSubtotal,
          tax: newTax,
          total: newSubtotal + newTax,
          status: 'pending'
        });
        toast.success('Items added to your active order!');
      } else {
        // Create new order
        const orderId = await createOrder({
          table: tableNumber,
          items: orderItems,
          subtotal,
          tax,
          total: subtotal + tax,
          taxRate: restaurant?.taxRate || 5,
        });
        dispatch({ type: 'SET_ACTIVE_ORDER', payload: orderId });
        toast.success('Order placed successfully!');
      }

      dispatch({ type: 'CLEAR_CART' });
      setCartOpen(false);
      navigate(`/order-status?table=${tableNumber}`);
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
      console.error(err);
    } finally {
      setPlacing(false);
    }
  };

  const specials = items.filter(i => i.isSpecial && i.available);

  return (
    <div className="min-h-screen bg-[#0E0E10] font-body">
      <Navbar onCartClick={() => setCartOpen(true)} cartCount={totalItems} tableNumber={tableNumber} />

      {/* Table badge */}
      {tableNumber && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40">
          <div className="glass px-4 py-2 rounded-full text-sm font-medium text-white/70 inline-flex items-center gap-2">
            <TableIcon size={16} /> Table {tableNumber}
            {activeOrder && <span className="ml-2 text-green-400">· Active Order</span>}
          </div>
        </div>
      )}

      <div className="pt-24 pb-32 max-w-7xl mx-auto px-4 md:px-8">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Search size={16} /></span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium ${
              vegOnly
                ? 'bg-green-500/15 border-green-500/30 text-green-400'
                : 'border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            <span className="w-3 h-3 rounded-sm border-2 border-green-400 inline-block" />
            Veg Only
          </button>
        </div>

        {/* Today's Specials strip */}
        {specials.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-yellow-400 text-lg"><Star size={20} /></span>
              <h2 className="font-display text-2xl text-white">Today's Specials</h2>
            </div>
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2">
              {specials.map(item => (
                <div key={item.id} className="flex-shrink-0">
                  <FoodCard item={item} special />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-8">
          <CategoryTab
            id="all"
            label="All"
            icon={<Utensils size={16} />}
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          <CategoryTab
            id="specials"
            label="Specials"
            icon={<Star size={16} />}
            active={activeCategory === 'specials'}
            onClick={() => setActiveCategory('specials')}
          />
          {categories.map(cat => (
            <CategoryTab
              key={cat.id}
              id={cat.id}
              label={cat.name}
              icon={<Utensils size={16} />}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>

        {/* Menu grid */}
        {itemsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-lg">No items found</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            <AnimatePresence>
              {filtered.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <FoodCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Floating cart button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="btn-primary flex items-center gap-4 px-8 py-4 text-base shadow-2xl"
            >
              <span className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                {totalItems}
              </span>
              <span>View Cart</span>
              <span className="text-white/80">{formatCurrency(subtotal, restaurant?.currency)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onPlaceOrder={handlePlaceOrder}
        placing={placing}
        activeOrder={activeOrder}
      />
    </div>
  );
}

function CategoryTab({ id, label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0 ${
        active
          ? 'bg-red-600/20 border border-red-500/30 text-red-400'
          : 'glass text-white/50 hover:text-white/80'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
