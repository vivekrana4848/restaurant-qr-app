// src/pages/admin/MenuManagement.jsx
import { useState } from 'react';
import { Search, UploadCloud, Leaf, Star, CheckCircle, Utensils, Edit2, Trash2, X } from 'lucide-react';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCategories } from '../../hooks/useCategories';
import { useRestaurant } from '../../context/RestaurantContext';
import { addMenuItem, updateMenuItem, deleteMenuItem } from '../../firebase/database';
import { formatCurrency, uploadToCloudinary, formatImageUrl, isValidImageUrl } from '../../utils/helpers';

// All form fields explicitly defined — prevents controlled→uncontrolled warnings
const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  isVeg: true,
  isSpecial: false,
  available: true,
  image: '',
};

export default function MenuManagement() {
  const { items, loading } = useMenuItems();
  const { categories } = useCategories();
  const restaurant = useRestaurant();
  
  const customStyles = {
    control: (base) => ({
      ...base,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '4px',
      boxShadow: 'none',
      color: 'white',
      minHeight: '44px',
    }),

    menu: (base) => ({
      ...base,
      background: '#1A1A1D',
      borderRadius: '12px',
      overflow: 'hidden',
      marginTop: '6px',
    }),

    option: (base, state) => ({
      ...base,
      background: state.isFocused ? '#2A2A2D' : '#1A1A1D',
      color: 'white',
      cursor: 'pointer',
      padding: '10px 12px',
    }),

    singleValue: (base) => ({
      ...base,
      color: 'white',
    }),

    placeholder: (base) => ({
      ...base,
      color: '#888',
    }),
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || item.category === catFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  // FIX: Always merge with EMPTY_FORM so no controlled input ever gets undefined
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...EMPTY_FORM,
      ...item,
      name: item.name ?? '',
      description: item.description ?? '',
      price: String(item.price ?? ''),
      category: item.category ?? '',
      image: item.image ?? '',
      isVeg: item.isVeg ?? true,
      isSpecial: item.isSpecial ?? false,
      available: item.available ?? true,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(f => ({ ...f, image: url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed — check Cloudinary config in helpers.js');
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error('Valid price is required'); return; }
    setSaving(true);
    try {
      const imageUrl = form.image ? formatImageUrl(form.image) : '';
      if (imageUrl && !isValidImageUrl(imageUrl)) {
        toast.error('Please enter a valid image URL (jpg, png, webp)');
        setSaving(false);
        return;
      }

      const data = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image: imageUrl,
      };
      if (editItem) {
        await updateMenuItem(editItem.id, data);
        toast.success('Item updated');
      } else {
        await addMenuItem(data);
        toast.success('Item added to menu');
      }
      closeForm();
    } catch {
      toast.error('Failed to save — check Firebase connection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item? This cannot be undone.')) return;
    try {
      await deleteMenuItem(id);
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleAvailable = async (item) => {
    try {
      await updateMenuItem(item.id, { available: !item.available });
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const toggleSpecial = async (item) => {
    try {
      await updateMenuItem(item.id, { isSpecial: !item.isSpecial });
    } catch {
      toast.error('Failed to update special status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Menu</h1>
          <p className="text-white/40 text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"><Search size={16} /></span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="all" className="text-black bg-white">
  All Categories
    </option>

        {categories.map((c, i) => (
        <option
          key={c.id || c.name || `cat-${i}`}
          value={c.id}
          className="text-black bg-white"
        >
        {c.name}
        </option>
      ))}
        </select>
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <div className="text-5xl mb-3"><Utensils size={40} className="mx-auto" /></div>
          <p>{search || catFilter !== 'all' ? 'No matching items' : 'No menu items yet — add your first!'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <AdminMenuCard
              // FIX: fallback key in case Firebase id is temporarily undefined
              key={item.id || `item-${idx}`}
              item={item}
              restaurant={restaurant}
              categories={categories}
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleAvailable={() => toggleAvailable(item)}
              onToggleSpecial={() => toggleSpecial(item)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div
                className="glass-strong rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="p-6 border-b border-white/8 flex items-center justify-between sticky top-0 glass-strong z-10">
                  <h2 className="font-display text-xl text-white">
                    {editItem ? 'Edit Item' : 'Add New Item'}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="w-8 h-8 glass rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Image */}
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">Image</label>
                    <div className="flex gap-3 items-start">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                        {form.image ? (
                          <img
                            src={formatImageUrl(form.image)}
                            alt="preview"
                            className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.src = '/fallback.svg'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl"><Utensils size={28} /></div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="glass border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors text-center">
                            {uploading ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                                Uploading...
                              </span>
                            ) : (<><UploadCloud size={16} className="inline-block mr-2"/> Upload Image</>)}
                          </div>
                        </label>
                        <input
                          value={form.image}
                          onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                          placeholder="Or paste image URL"
                          className="input-field text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">Name *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Butter Chicken"
                      className="input-field"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Brief description of the dish..."
                      rows={2}
                      className="input-field resize-none"
                    />
                  </div>

                  {/* Price + Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">Price *</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="299"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-2">Category</label>
                      <div className="input-field p-0">
                        <Select
                          options={categoryOptions}
                          value={categoryOptions.find(opt => opt.value === form.category) || null}
                          onChange={(selected) => setForm(f => ({ ...f, category: selected?.value || '' }))}
                          styles={customStyles}
                          placeholder="— Select —"
                          isClearable
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toggle flags */}
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">Flags</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, isVeg: !f.isVeg }))}
                        className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          form.isVeg
                            ? 'bg-green-500/15 border-green-500/30 text-green-400'
                            : 'bg-white/3 border-white/10 text-white/40 hover:text-white/60'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2"><Leaf size={14} /> Veg</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, isSpecial: !f.isSpecial }))}
                        className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          form.isSpecial
                            ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                            : 'bg-white/3 border-white/10 text-white/40 hover:text-white/60'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2"><Star size={14} /> Special</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                        className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          form.available
                            ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                            : 'bg-white/3 border-white/10 text-white/40 hover:text-white/60'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2"><CheckCircle size={14} /> Available</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="p-6 border-t border-white/8 flex gap-3">
                  <button onClick={closeForm} className="btn-ghost flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : editItem ? '✓ Update Item' : '+ Add Item'}
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

// ─── AdminMenuCard ────────────────────────────────────────────────────────────
function AdminMenuCard({ item, restaurant, categories, onEdit, onDelete, onToggleAvailable, onToggleSpecial }) {
  const cat = categories.find(c => c.id === item.category);

  return (
    <div className={`glass rounded-2xl overflow-hidden transition-opacity ${!item.available ? 'opacity-50' : ''}`}>
      {/* Image */}
      <div className="relative h-36 bg-white/5">
                        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl"><Utensils size={28} /></div>
        )}
        {/* Veg/Non-veg badge */}
        <div className="absolute top-2 left-2">
          <span className={item.isVeg ? 'badge-veg inline-flex items-center gap-2' : 'badge-nonveg inline-flex items-center gap-2'}>
            {item.isVeg ? (<><Leaf size={12} /> Veg</>) : (<><Utensils size={12} /> Non-veg</>)}
          </span>
        </div>
        {/* Special badge */}
        {item.isSpecial && (
          <div className="absolute top-2 right-2">
            <span className="badge-special inline-flex items-center gap-2"><Star size={12} /> Special</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
          {cat && (
            <p className="text-white/30 text-xs mt-0.5 inline-flex items-center gap-2"><Utensils size={14} /> {cat.name}</p>
          )}
          <p className="text-red-400 font-bold text-sm mt-1">
            {formatCurrency(item.price, restaurant?.currency)}
          </p>
        </div>

        {/* Toggle row */}
        <div className="flex gap-2">
          <button
            onClick={onToggleAvailable}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              item.available
                ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                : 'bg-white/5 text-white/30 border border-white/10'
            }`}
          >
            {item.available ? (<span className="inline-flex items-center gap-2"><CheckCircle size={14} /> Available</span>) : (<span className="inline-flex items-center gap-2"><X size={14} /> Off</span>)}
          </button>
          <button
            onClick={onToggleSpecial}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              item.isSpecial
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                : 'bg-white/5 text-white/30 border border-white/10'
            }`}
          >
            {item.isSpecial ? (<span className="inline-flex items-center gap-2"><Star size={14} /> Special</span>) : 'Normal'}
          </button>
        </div>

        {/* Edit / Delete row */}
        <div className="flex gap-2">
            <button
            onClick={onEdit}
            className="flex-1 glass py-1.5 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
          >
            <span className="inline-flex items-center gap-2"><Edit2 size={14} /> Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-1.5 rounded-lg text-xs text-red-400/70 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all"
          >
            <span className="inline-flex items-center gap-2"><Trash2 size={14} /> Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
