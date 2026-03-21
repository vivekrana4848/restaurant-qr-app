// src/components/customer/FoodCard.jsx
import { useState } from 'react';
import { Utensils, Leaf, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency } from '../../utils/helpers';

export default function FoodCard({ item, special = false }) {
  const { items: cartItems, dispatch } = useCart();
  const restaurant = useRestaurant();
  const [imgError, setImgError] = useState(false);

  const cartItem = cartItems.find(i => i.id === item.id);
  const qty = cartItem?.qty || 0;

  const addToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };
  const increase = () => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, qty: qty + 1 } });
  const decrease = () => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, qty: qty - 1 } });

  return (
    <div className={`food-card w-48 md:w-52 ${special ? 'w-52 md:w-56' : ''}`}>
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-white/5">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl"><Utensils size={28} /></div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className={item.isVeg ? 'badge-veg inline-flex items-center gap-2' : 'badge-nonveg inline-flex items-center gap-2'}>
            {item.isVeg ? <><Leaf size={12} /> Veg</> : <><Utensils size={12} /> Non-Veg</>}
          </span>
          {item.isSpecial && <span className="badge-special inline-flex items-center gap-2"><Star size={12} /> Special</span>}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-medium text-sm leading-tight mb-1 truncate">{item.name}</h3>
        {item.description && (
          <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-3">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-white font-semibold text-sm">
            {formatCurrency(item.price, restaurant?.currency)}
          </span>
          {qty === 0 ? (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={addToCart}
              className="bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-red-600/30 transition-all"
            >
              + Add
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={decrease}
                className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-sm hover:bg-white/15 transition-all"
              >
                −
              </button>
              <span className="text-white text-sm font-bold w-4 text-center">{qty}</span>
              <button
                onClick={increase}
                className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center text-sm hover:bg-red-600/30 transition-all"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
