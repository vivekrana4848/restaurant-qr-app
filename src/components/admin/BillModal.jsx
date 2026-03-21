// src/components/admin/BillModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Printer, DownloadCloud } from 'lucide-react';
import { formatCurrency, calcTax } from '../../utils/helpers';
import { generateBillPDF } from '../../utils/billGenerator';

export default function BillModal({ order, restaurant, onClose }) {
  const currency = restaurant?.currency || '₹';
  const taxRate = restaurant?.taxRate || 5;
  const subtotal = order.subtotal || order.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0;
  const tax = calcTax(subtotal, taxRate);
  const grandTotal = subtotal + tax;

  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=400,height=600');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - Table ${order.table}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 13px; padding: 20px; max-width: 320px; margin: 0 auto; color: #000; }
          h1 { font-size: 16px; text-align: center; margin-bottom: 4px; }
          .center { text-align: center; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .divider { border-top: 1px dashed #999; margin: 8px 0; }
          .bold { font-weight: bold; }
          .total { font-size: 15px; font-weight: bold; }
          .small { font-size: 11px; color: #555; }
          .dot-green { display: inline-block; width: 8px; height: 8px; background: green; margin-right: 4px; }
          .dot-red { display: inline-block; width: 8px; height: 8px; background: red; margin-right: 4px; }
        </style>
      </head>
      <body>
        <h1>${restaurant?.name || 'TableSide Kitchen'}</h1>
        <p class="center small">${restaurant?.address || ''}</p>
        <p class="center small">GST: ${restaurant?.gstNumber || 'N/A'}</p>
        <div class="divider"></div>
        <div class="row"><span class="bold">Table: ${order.table}</span><span class="small">#${order.id?.slice(-6).toUpperCase()}</span></div>
        <div class="row"><span class="small">${new Date(order.createdAt).toLocaleString()}</span></div>
        <div class="divider"></div>
        <div class="row bold"><span style="flex:2">Item</span><span>Qty</span><span>Price</span><span>Amt</span></div>
        <div class="divider"></div>
        ${order.items?.map(item => `
          <div class="row">
            <span style="flex:2;overflow:hidden"><span class="${item.isVeg ? 'dot-green' : 'dot-red'}"></span>${item.name.slice(0, 18)}</span>
            <span>${item.qty}</span>
            <span>${formatCurrency(item.price, currency)}</span>
            <span>${formatCurrency(item.price * item.qty, currency)}</span>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="row"><span>Subtotal</span><span>${formatCurrency(subtotal, currency)}</span></div>
        <div class="row"><span>GST (${taxRate}%)</span><span>${formatCurrency(tax, currency)}</span></div>
        <div class="divider"></div>
        <div class="row total"><span>GRAND TOTAL</span><span>${formatCurrency(grandTotal, currency)}</span></div>
        <div class="divider"></div>
        <p class="center small">${order.paymentStatus === 'cash_paid' ? 'PAID - Cash' : order.paymentStatus === 'upi_paid' ? 'PAID - UPI' : 'PAYMENT PENDING'}</p>
        <p class="center" style="margin-top:12px">Thank you for dining with us!</p>
        <p class="center small">Please visit again</p>
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 300);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/8">
            <div>
              <h2 className="font-display text-xl text-white">Bill</h2>
              <p className="text-white/40 text-xs mt-0.5">Table {order.table} · #{order.id?.slice(-6).toUpperCase()}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 glass rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Bill content */}
          <div className="p-6 space-y-4">
            {/* Restaurant info */}
            <div className="text-center space-y-0.5 pb-4 border-b border-dashed border-white/10">
              <p className="font-display text-white font-semibold">{restaurant?.name}</p>
              <p className="text-white/40 text-xs">{restaurant?.address}</p>
              <p className="text-white/30 text-xs">GST: {restaurant?.gstNumber}</p>
            </div>

            {/* Meta */}
            <div className="flex justify-between text-xs text-white/40">
              <span>{new Date(order.createdAt).toLocaleString()}</span>
              <span>Table {order.table}</span>
            </div>

            {/* Items */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-12 text-xs text-white/30 font-semibold pb-1 border-b border-white/8">
                <span className="col-span-5">Item</span>
                <span className="col-span-2 text-right">Qty</span>
                <span className="col-span-2 text-right">Rate</span>
                <span className="col-span-3 text-right">Total</span>
              </div>
              {order.items?.map((item, i) => (
                <div key={i} className="grid grid-cols-12 text-sm">
                  <div className="col-span-5 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-white/80 truncate text-xs">{item.name}</span>
                  </div>
                  <span className="col-span-2 text-right text-white/50 text-xs">{item.qty}</span>
                  <span className="col-span-2 text-right text-white/50 text-xs">{formatCurrency(item.price, currency)}</span>
                  <span className="col-span-3 text-right text-white text-xs font-medium">{formatCurrency(item.price * item.qty, currency)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-3 border-t border-white/8">
              <div className="flex justify-between text-sm text-white/60">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>GST ({taxRate}%)</span>
                <span>{formatCurrency(tax, currency)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/8">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>

            {/* Payment status */}
            <div className="text-center pt-1">
              <span className={order.paymentStatus?.includes('paid')
                ? 'text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full'
                : 'text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full'
              }>
                {order.paymentStatus === 'cash_paid' ? (<span className="inline-flex items-center gap-2"><CreditCard size={12} /> Paid via Cash</span>)
                  : order.paymentStatus === 'upi_paid' ? (<span className="inline-flex items-center gap-2"><Smartphone size={12} /> Paid via UPI</span>)
                  : (<span className="inline-flex items-center gap-2"><Printer size={12} /> Payment Pending</span>)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 glass py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <span className="inline-flex items-center gap-2"><Printer size={16} /> Print</span>
            </button>
            <button
              onClick={() => generateBillPDF(order, restaurant)}
              className="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-2"
            >
              <span className="inline-flex items-center gap-2"><DownloadCloud size={16} /> Download PDF</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
