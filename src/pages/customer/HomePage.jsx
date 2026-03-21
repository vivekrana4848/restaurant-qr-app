// src/pages/customer/HomePage.jsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useRestaurant } from '../../context/RestaurantContext';
import { seedInitialData } from '../../firebase/database';
import FoodCard from '../../components/customer/FoodCard';
import Navbar from '../../components/customer/Navbar';

const floatingItems = [<Icons.Utensils size={28} />, <Icons.Utensils size={28} />, <Icons.Leaf size={28} />, <Icons.Star size={28} />, <Icons.ShoppingCart size={28} />, <Icons.Utensils size={28} />];

export default function HomePage() {
  const navigate = useNavigate();
  const restaurant = useRestaurant();
  const { items, loading } = useMenuItems();
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      seedInitialData();
    }
  }, []);

  const specials = items.filter(i => i.isSpecial && i.available);

  return (
    <div className="min-h-screen bg-[#0E0E10] font-body overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-6 md:px-16 lg:px-24 overflow-hidden">
        {/* Background radial */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-800/8 rounded-full blur-3xl" />
        </div>

        {/* Floating decorative icons */}
        {floatingItems.map((icon, i) => (
          <motion.span
            key={i}
            className="absolute select-none pointer-events-none"
            style={{
              top: `${15 + (i * 13) % 70}%`,
              left: `${5 + (i * 17) % 90}%`,
              opacity: 0.12,
            }}
            animate={{ y: [0, -18, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
          >
            <span className="text-3xl">{icon}</span>
          </motion.span>
        ))}

        <div className="relative z-10 w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center pt-20">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-white/60 mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Now Open · Table Ordering Active
            </motion.div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              <span className="text-gradient">It's not just</span>
              <br />
              <span className="text-gradient-red italic">food,</span>
              <br />
              <span className="text-gradient">it's an</span>
              <br />
              <span className="text-white">experience.</span>
            </h1>

            <p className="text-white/50 text-lg mb-10 max-w-md leading-relaxed">
              Scan your table's QR code to order, track, and enjoy — all from your phone. No waiting, no hassle.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/menu')}
                className="btn-primary text-base"
              >
                View Menu
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/menu')}
                className="btn-ghost text-base"
              >
                Scan QR Code
              </motion.button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              {[['50+', 'Dishes'], ['4.9★', 'Rating'], ['20min', 'Avg. Serve']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-display font-bold text-white">{val}</div>
                  <div className="text-white/40 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right – circular food image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="flex justify-center relative"
          >
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-600/30 to-transparent blur-2xl scale-110" />
              {/* Spin ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-red-500/20"
              />
              {/* Main circle */}
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-2 border-white/10 relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"
                  alt="Food"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badges */}
              {[
                { icon: <Icons.Flame size={16} />, label: 'Hot & Fresh', pos: 'top-4 -left-8' },
                { icon: <Icons.Star size={16} />, label: 'Top Rated', pos: 'bottom-8 -right-8' },
                { icon: <Icons.Leaf size={16} />, label: 'Veg Options', pos: 'bottom-8 -left-10' },
              ].map(({ icon, label, pos }) => (
                <motion.div
                  key={label}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
                  className={`absolute ${pos} glass px-3 py-2 rounded-2xl flex items-center gap-2 text-sm z-20`}
                >
                  <span className="inline-flex items-center">{icon}</span>
                  <span className="text-white/80 font-medium">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs"
        >
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* ── TODAY'S SPECIALS ── */}
      <section className="py-20 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <p className="text-red-400 text-sm font-medium tracking-widest uppercase mb-2">Chef's Pick</p>
              <h2 className="font-display text-4xl text-white">Today's Specials</h2>
            </div>
            <button
              onClick={() => navigate('/menu')}
              className="hidden md:flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
            >
              View full menu →
            </button>
          </motion.div>

          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass rounded-2xl w-56 h-72 flex-shrink-0 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {specials.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-shrink-0"
                >
                  <FoodCard item={item} />
                </motion.div>
              ))}
              {specials.length === 0 && (
                <p className="text-white/30 py-8">No specials today. Check back soon!</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-red-400 text-sm font-medium tracking-widest uppercase mb-2">Simple Process</p>
            <h2 className="font-display text-4xl text-white">How It Works</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
                { icon: <Icons.Smartphone size={28} />, step: '01', title: 'Scan QR', desc: 'Scan the QR code on your table' },
                { icon: <Icons.Utensils size={28} />, step: '02', title: 'Browse Menu', desc: 'Explore our full menu and specials' },
                { icon: <Icons.ShoppingCart size={28} />, step: '03', title: 'Place Order', desc: 'Add items and confirm your order' },
                { icon: <Icons.Star size={28} />, step: '04', title: 'Enjoy', desc: 'Sit back and enjoy your meal' },
            ].map(({ icon, step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 text-center relative"
              >
                <div className="absolute top-4 right-4 text-white/10 font-display text-4xl font-bold">{step}</div>
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-display text-xl text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6 md:px-16 text-center">
        <p className="font-display text-xl text-white mb-1">{restaurant.name}</p>
        <p className="text-white/30 text-sm">{restaurant.address}</p>
        <p className="text-white/20 text-xs mt-4">© {new Date().getFullYear()} TableSide. All rights reserved.</p>
      </footer>
    </div>
  );
}
