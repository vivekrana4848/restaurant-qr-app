// src/firebase/database.js
import { db } from './config';
import {
  ref, set, push, get, update, remove, onValue, off, query, orderByChild, equalTo
} from 'firebase/database';

// ─── Menu Items ───────────────────────────────────────────────
export const menuItemsRef = () => ref(db, 'menuItems');
export const menuItemRef = (id) => ref(db, `menuItems/${id}`);

export const addMenuItem = async (item) => {
  const newRef = push(menuItemsRef());
  await set(newRef, { ...item, id: newRef.key, createdAt: Date.now() });
  return newRef.key;
};

export const updateMenuItem = async (id, data) => {
  await update(menuItemRef(id), data);
};

export const deleteMenuItem = async (id) => {
  await remove(menuItemRef(id));
};

export const getMenuItems = async () => {
  const snap = await get(menuItemsRef());
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

export const subscribeMenuItems = (callback) => {
  const r = menuItemsRef();
  onValue(r, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const items = Object.entries(snap.val()).map(([key, val]) => ({ ...val, id: val.id || key }));
    callback(items);
  });
  return () => off(r);
};

// ─── Categories ───────────────────────────────────────────────
export const categoriesRef = () => ref(db, 'categories');
export const categoryRef = (id) => ref(db, `categories/${id}`);

export const addCategory = async (cat) => {
  const newRef = push(categoriesRef());
  await set(newRef, { ...cat, id: newRef.key });
  return newRef.key;
};

export const updateCategory = async (id, data) => update(categoryRef(id), data);
export const deleteCategory = async (id) => remove(categoryRef(id));

export const subscribeCategories = (callback) => {
  const r = categoriesRef();
  onValue(r, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    // Normalize: ensure each item has id = its Firebase key
    const items = Object.entries(snap.val()).map(([key, val]) => ({ ...val, id: val.id || key }));
    callback(items);
  });
  return () => off(r);
};

// ─── Orders ───────────────────────────────────────────────────
export const ordersRef = () => ref(db, 'orders');
export const orderRef = (id) => ref(db, `orders/${id}`);

export const createOrder = async (order) => {
  const newRef = push(ordersRef());
  const orderData = {
    ...order,
    id: newRef.key,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'pending',
    isActive: true,
    paymentStatus: 'pending'
  };
  await set(newRef, orderData);
  return newRef.key;
};

export const updateOrder = async (id, data) => {
  await update(orderRef(id), { ...data, updatedAt: Date.now() });
};

export const getActiveOrderForTable = async (tableNumber) => {
  const snap = await get(ordersRef());
  if (!snap.exists()) return null;
  const orders = Object.values(snap.val());
  return orders.find(o => o.table === tableNumber && o.isActive) || null;
};

export const subscribeOrders = (callback) => {
  const r = ordersRef();
  onValue(r, (snap) => {
    if (!snap.exists()) { callback([]); return; }
    const orders = Object.entries(snap.val())
      .map(([key, val]) => ({ ...val, id: val.id || key }))
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(orders);
  });
  return () => off(r);
};

export const subscribeTableOrder = (tableNumber, callback) => {
  const r = ordersRef();
  onValue(r, (snap) => {
    if (!snap.exists()) { callback(null); return; }
    const orders = Object.entries(snap.val()).map(([key, val]) => ({ ...val, id: val.id || key }));
    const active = orders.find(o => o.table === tableNumber && o.isActive) || null;
    callback(active);
  });
  return () => off(r);
};

// ─── Restaurant info ──────────────────────────────────────────
export const restaurantRef = () => ref(db, 'restaurant');

export const getRestaurant = async () => {
  const snap = await get(restaurantRef());
  return snap.exists() ? snap.val() : null;
};

export const updateRestaurant = async (data) => {
  await update(restaurantRef(), data);
};

export const subscribeRestaurant = (callback) => {
  const r = restaurantRef();
  onValue(r, (snap) => callback(snap.exists() ? snap.val() : {}));
  return () => off(r);
};

// ─── Seed initial data ────────────────────────────────────────
export const seedInitialData = async () => {
  // Check if data exists
  const snap = await get(restaurantRef());
  if (snap.exists()) return;

  // Restaurant info
  await set(restaurantRef(), {
    name: 'TableSide Kitchen',
    tagline: "It's not just food, it's an experience",
    address: '123 Culinary Street, Foodie Town',
    phone: '+91 98765 43210',
    gstNumber: '27AABCT1332L1ZV',
    taxRate: 5,
    currency: '₹'
  });

  // Categories
  const cats = ['Starters', 'Main Course', 'Biryani', 'Breads', 'Desserts', 'Beverages'];
  const catRefs = {};
  for (const name of cats) {
    const r = push(ref(db, 'categories'));
    catRefs[name] = r.key;
    await set(r, { id: r.key, name, icon: getCatIcon(name) });
  }

  // Menu items
  const items = [
    { name: 'Paneer Tikka', price: 280, category: catRefs['Starters'], isVeg: true, isSpecial: true, description: 'Tender paneer cubes marinated in spiced yogurt, grilled to perfection', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80', available: true },
    { name: 'Chicken 65', price: 320, category: catRefs['Starters'], isVeg: false, isSpecial: false, description: 'Crispy deep-fried chicken with aromatic spices', image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=400&q=80', available: true },
    { name: 'Dal Makhani', price: 260, category: catRefs['Main Course'], isVeg: true, isSpecial: true, description: 'Slow-cooked black lentils in creamy tomato gravy', image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&q=80', available: true },
    { name: 'Butter Chicken', price: 380, category: catRefs['Main Course'], isVeg: false, isSpecial: true, description: 'Succulent chicken in rich buttery tomato sauce', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', available: true },
    { name: 'Chicken Biryani', price: 350, category: catRefs['Biryani'], isVeg: false, isSpecial: true, description: 'Fragrant basmati rice with tender chicken and whole spices', image: 'https://images.unsplash.com/photo-1563379091339-03246963d96e?w=400&q=80', available: true },
    { name: 'Veg Biryani', price: 280, category: catRefs['Biryani'], isVeg: true, isSpecial: false, description: 'Aromatic rice with fresh vegetables and spices', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', available: true },
    { name: 'Butter Naan', price: 40, category: catRefs['Breads'], isVeg: true, isSpecial: false, description: 'Soft leavened bread baked in tandoor with butter', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', available: true },
    { name: 'Gulab Jamun', price: 120, category: catRefs['Desserts'], isVeg: true, isSpecial: false, description: 'Soft milk-solid dumplings in rose sugar syrup', image: 'https://images.unsplash.com/photo-1666214280576-e1f3a5ff521c?w=400&q=80', available: true },
    { name: 'Mango Lassi', price: 120, category: catRefs['Beverages'], isVeg: true, isSpecial: false, description: 'Refreshing blended yogurt drink with fresh mango', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80', available: true },
    { name: 'Masala Chai', price: 60, category: catRefs['Beverages'], isVeg: true, isSpecial: false, description: 'Aromatic Indian spiced tea with ginger', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', available: true },
  ];

  for (const item of items) {
    const r = push(ref(db, 'menuItems'));
    await set(r, { ...item, id: r.key, createdAt: Date.now() });
  }
};

function getCatIcon(name) {
  // Return a neutral string key for icons (UI maps these to lucide icons)
  const icons = {
    'Starters': 'utensils', 'Main Course': 'utensils', 'Biryani': 'utensils',
    'Breads': 'utensils', 'Desserts': 'utensils', 'Beverages': 'utensils'
  };
  return icons[name] || 'utensils';
}
