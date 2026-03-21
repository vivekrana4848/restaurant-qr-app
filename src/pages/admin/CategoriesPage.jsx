// src/pages/admin/CategoriesPage.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCategories } from '../../hooks/useCategories';
import { addCategory, updateCategory, deleteCategory } from '../../firebase/database';
import { Utensils, Leaf, Star, Coffee, ShoppingCart, Edit2, Trash2, List, X } from 'lucide-react';

const ICON_OPTIONS = [
  { key: 'utensils', icon: <Utensils size={18} /> },
  { key: 'leaf', icon: <Leaf size={18} /> },
  { key: 'star', icon: <Star size={18} /> },
  { key: 'coffee', icon: <Coffee size={18} /> },
  { key: 'cart', icon: <ShoppingCart size={18} /> },
];

const ICON_MAP = {
  utensils: <Utensils size={28} />, leaf: <Leaf size={28} />, star: <Star size={28} />, coffee: <Coffee size={28} />, cart: <ShoppingCart size={28} />
};

export default function CategoriesPage() {
  const { categories, loading } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', icon: 'utensils' });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditCat(null); setForm({ name: '', icon: 'utensils' }); setShowForm(true); };
  const openEdit = (cat) => { setEditCat(cat); setForm({ name: cat.name, icon: cat.icon || 'utensils' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editCat) {
        await updateCategory(editCat.id, form);
        toast.success('Category updated');
      } else {
        await addCategory(form);
        toast.success('Category added');
      }
      setShowForm(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Categories</h1>
          <p className="text-white/40 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id || cat.name || i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div className="text-4xl mb-3">{ICON_MAP[cat.icon] || <Utensils size={28} />}</div>
              <p className="text-white font-medium text-sm mb-4 truncate">{cat.name}</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="w-9 h-9 glass rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  aria-label={`Edit ${cat.name}`}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400/60 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all"
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-16 text-white/30">
              <div className="text-5xl mb-3"><List size={48} className="mx-auto" /></div>
              <p>No categories yet</p>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="glass-strong rounded-2xl w-full max-w-sm">
                <div className="p-6 border-b border-white/8 flex items-center justify-between">
                  <h2 className="font-display text-xl text-white">{editCat ? 'Edit Category' : 'Add Category'}</h2>
                  <button onClick={() => setShowForm(false)} className="w-8 h-8 glass rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors"><X size={16} /></button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Icon picker */}
                  <div>
                    <label className="block text-white/60 text-sm mb-3">Icon</label>
                    <div className="grid grid-cols-8 gap-2">
                      {ICON_OPTIONS.map(({ key, icon }) => (
                        <button
                          key={key}
                          onClick={() => setForm(f => ({ ...f, icon: key }))}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            form.icon === key
                              ? 'bg-red-600/20 border border-red-500/40'
                              : 'glass hover:bg-white/8'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <input
                        value={form.icon}
                        onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                        placeholder="Or type any icon key (e.g. utensils)"
                        className="input-field text-center text-sm"
                        maxLength={32}
                      />
                    </div>

                  </div>

                  <div>
                    <label className="block text-white/60 text-sm mb-2">Category Name *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Starters, Desserts..."
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-white/8 flex gap-3">
                  <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                    {saving ? 'Saving...' : editCat ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
