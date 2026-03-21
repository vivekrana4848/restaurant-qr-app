// src/utils/billGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, calcTax, calcGrandTotal } from './helpers';

export const generateBillPDF = (order, restaurant) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 200] });
  const currency = restaurant?.currency || '₹';
  const taxRate = restaurant?.taxRate || 5;
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = calcTax(subtotal, taxRate);
  const grandTotal = subtotal + tax;

  let y = 8;
  const cx = 40;

  // Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(restaurant?.name || 'TableSide Kitchen', cx, y, { align: 'center' });
  y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(restaurant?.address || '', cx, y, { align: 'center' });
  y += 4;
  doc.text(`GST: ${restaurant?.gstNumber || 'N/A'}`, cx, y, { align: 'center' });
  y += 4;

  // Divider
  doc.setDrawColor(200);
  doc.line(5, y, 75, y);
  y += 4;

  // Bill info
  doc.setFontSize(8);
  doc.text(`Table: ${order.table}`, 5, y);
  doc.text(`Bill #: ${order.id?.slice(-6).toUpperCase()}`, 75, y, { align: 'right' });
  y += 4;
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 5, y);
  y += 4;
  doc.line(5, y, 75, y);
  y += 4;

  // Items
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 5, y);
  doc.text('Qty', 48, y, { align: 'right' });
  doc.text('Price', 60, y, { align: 'right' });
  doc.text('Amt', 75, y, { align: 'right' });
  y += 3;
  doc.line(5, y, 75, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  for (const item of order.items) {
    const amount = item.price * item.qty;
    const name = item.name.length > 22 ? item.name.slice(0, 22) + '…' : item.name;
    doc.text(name, 5, y);
    doc.text(String(item.qty), 48, y, { align: 'right' });
    doc.text(formatCurrency(item.price, currency), 60, y, { align: 'right' });
    doc.text(formatCurrency(amount, currency), 75, y, { align: 'right' });
    y += 5;
  }

  doc.line(5, y, 75, y);
  y += 4;

  // Totals
  doc.text('Subtotal', 5, y);
  doc.text(formatCurrency(subtotal, currency), 75, y, { align: 'right' });
  y += 4;
  doc.text(`GST (${taxRate}%)`, 5, y);
  doc.text(formatCurrency(tax, currency), 75, y, { align: 'right' });
  y += 4;
  doc.line(5, y, 75, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL', 5, y);
  doc.text(formatCurrency(grandTotal, currency), 75, y, { align: 'right' });
  y += 5;

  // Payment status
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const pStatus = order.paymentStatus === 'cash_paid' ? 'PAID (Cash)'
    : order.paymentStatus === 'upi_paid' ? 'PAID (UPI)' : 'PAYMENT PENDING';
  doc.text(`Status: ${pStatus}`, cx, y, { align: 'center' });
  y += 6;

  doc.line(5, y, 75, y);
  y += 4;
  doc.text('Thank you for dining with us!', cx, y, { align: 'center' });
  y += 4;
  doc.text('Please visit again', cx, y, { align: 'center' });

  doc.save(`Bill_Table${order.table}_${order.id?.slice(-6)}.pdf`);
};
