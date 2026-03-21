// src/pages/admin/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRestaurant } from '../../context/RestaurantContext';
import { updateRestaurant } from '../../firebase/database';
import { useAuth } from '../../context/AuthContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function SettingsPage() {
  const restaurant = useRestaurant();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '', tagline: '', address: '', phone: '',
    gstNumber: '', taxRate: 5, currency: '₹'
  });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || '',
        tagline: restaurant.tagline || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        gstNumber: restaurant.gstNumber || '',
        taxRate: restaurant.taxRate ?? 5,
        currency: restaurant.currency || '₹',
      });
    }
  }, [restaurant]);

  const handleSave = async () => {
    if (!form.name) { toast.error('Restaurant name is required'); return; }
    setSaving(true);
    try {
      await updateRestaurant({ ...form, taxRate: Number(form.taxRate) });
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      toast.error('All password fields are required');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.next.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, pwForm.next);
      setPwForm({ current: '', next: '', confirm: '' });
      toast.success('Password updated successfully');
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setPwSaving(false);
    }
  };

  const TABS = [
    { id: 'general', label: 'General', icon: '🏠' },
    { id: 'billing', label: 'Billing & Tax', icon: '🧾' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'firebase', label: 'Setup Guide', icon: '🔥' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white mb-1">Settings</h1>
        <p className="text-white/40 text-sm">Manage your restaurant configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-red-600/20 border border-red-500/30 text-red-400'
                : 'glass text-white/50 hover:text-white/80'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* General tab */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 space-y-5"
        >
          <h2 className="font-display text-lg text-white">Restaurant Info</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Restaurant Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-field"
                placeholder="TableSide Kitchen"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Phone</label>
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs font-medium mb-1.5 block">Tagline</label>
            <input
              value={form.tagline}
              onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
              className="input-field"
              placeholder="It's not just food, it's an experience"
            />
          </div>
          <div>
            <label className="text-white/50 text-xs font-medium mb-1.5 block">Address</label>
            <textarea
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="input-field resize-none"
              rows={2}
              placeholder="123 Culinary Street, Foodie Town"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : '💾 Save Changes'}
          </button>
        </motion.div>
      )}

      {/* Billing & Tax tab */}
      {activeTab === 'billing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 space-y-5"
        >
          <h2 className="font-display text-lg text-white">Billing & Tax Configuration</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Currency Symbol</label>
              <input
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="input-field"
                placeholder="₹"
                maxLength={3}
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">GST/Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.5"
                value={form.taxRate}
                onChange={e => setForm(f => ({ ...f, taxRate: e.target.value }))}
                className="input-field"
                placeholder="5"
              />
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs font-medium mb-1.5 block">GST Number</label>
            <input
              value={form.gstNumber}
              onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
              className="input-field"
              placeholder="27AABCT1332L1ZV"
            />
            <p className="text-white/25 text-xs mt-1.5">This appears on customer bills</p>
          </div>
          <div className="glass rounded-xl p-4 text-sm">
            <p className="text-white/60 mb-2">Bill preview for ₹100 order:</p>
            <div className="space-y-1 text-white/40 text-xs">
              <div className="flex justify-between"><span>Subtotal</span><span>{form.currency}100.00</span></div>
              <div className="flex justify-between"><span>GST ({form.taxRate}%)</span><span>{form.currency}{(100 * Number(form.taxRate) / 100).toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-white/70 pt-1 border-t border-white/10">
                <span>Grand Total</span>
                <span>{form.currency}{(100 + 100 * Number(form.taxRate) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : '💾 Save Changes'}
          </button>
        </motion.div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 space-y-5"
        >
          <h2 className="font-display text-lg text-white">Change Password</h2>
          <div className="text-white/40 text-sm glass rounded-xl p-3">
            Logged in as: <span className="text-white/70">{user?.email}</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Current Password</label>
              <input
                type="password"
                value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">New Password</label>
              <input
                type="password"
                value={pwForm.next}
                onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                className="input-field"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button onClick={handlePasswordChange} disabled={pwSaving} className="btn-primary flex items-center gap-2">
            {pwSaving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating...</> : '🔐 Update Password'}
          </button>
        </motion.div>
      )}

      {/* Firebase Setup Guide */}
      {activeTab === 'firebase' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {[
            {
              step: '1', title: 'Create Firebase Project',
              items: [
                'Go to console.firebase.google.com',
                'Click "Add project" → follow setup',
                'Enable Google Analytics (optional)',
              ]
            },
            {
              step: '2', title: 'Enable Realtime Database',
              items: [
                'Go to Build → Realtime Database',
                'Click "Create Database"',
                'Choose your region',
                'Start in TEST mode (change rules later)',
              ]
            },
            {
              step: '3', title: 'Enable Authentication',
              items: [
                'Go to Build → Authentication',
                'Click "Get started"',
                'Enable Email/Password provider',
                'Create your admin account manually',
              ]
            },
            {
              step: '4', title: 'Add Firebase Config',
              items: [
                'Go to Project Settings → Your apps',
                'Click "</>" to register web app',
                'Copy the firebaseConfig object',
                'Paste into src/firebase/config.js',
              ]
            },
            {
              step: '5', title: 'Configure Cloudinary (for image uploads)',
              items: [
                'Sign up at cloudinary.com',
                'Go to Settings → Upload → Upload presets',
                'Create an "Unsigned" preset',
                'Update CLOUDINARY_UPLOAD_PRESET and CLOUDINARY_CLOUD_NAME in src/utils/helpers.js',
              ]
            },
          ].map(({ step, title, items }) => (
            <div key={step} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-500/25 flex items-center justify-center text-red-400 font-bold text-sm">
                  {step}
                </div>
                <h3 className="text-white font-medium">{title}</h3>
              </div>
              <ul className="space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                    <span className="text-red-500/60 mt-0.5">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Firebase rules snippet */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-white font-medium mb-3">📋 Recommended Database Rules</h3>
            <pre className="text-xs text-green-400 bg-black/30 rounded-xl p-4 overflow-x-auto leading-relaxed">
{`{
  "rules": {
    "menuItems": { ".read": true, ".write": "auth != null" },
    "categories": { ".read": true, ".write": "auth != null" },
    "orders": { ".read": "auth != null", ".write": true },
    "restaurant": { ".read": true, ".write": "auth != null" }
  }
}`}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}
