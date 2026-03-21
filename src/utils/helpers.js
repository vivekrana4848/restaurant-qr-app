// src/utils/helpers.js

export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${Number(amount).toFixed(2)}`;

export const calcTax = (subtotal, rate) =>
  Math.round(subtotal * rate) / 100;

export const calcGrandTotal = (subtotal, taxRate) =>
  subtotal + calcTax(subtotal, taxRate);

export const STATUS_LABELS = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  closed: 'Closed',
};

export const NEXT_STATUS = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'served',
  served: 'closed',
};

export const NEXT_STATUS_LABEL = {
  pending: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Mark Served',
  served: 'Close Order',
};

export const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const CLOUDINARY_UPLOAD_PRESET = 'restaurant_unsigned'; // Change this
export const CLOUDINARY_CLOUD_NAME = 'your_cloud_name'; // Change this

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  const data = await res.json();
  return data.secure_url;
};

export const TABLE_COUNT = 12;

export const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/[-\w]{25,}/);
    if (match) return `https://drive.google.com/uc?export=view&id=${match[0]}`;
  }
  return url;
};

export const isValidImageUrl = (url) => {
  if (!url) return false;
  if (url.includes('drive.google.com') || url.includes('drive.googleusercontent.com')) return true;
  return /\.(jpeg|jpg|png|webp|gif)$/i.test(url);
};
