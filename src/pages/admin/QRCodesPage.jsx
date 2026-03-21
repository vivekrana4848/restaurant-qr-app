// src/pages/admin/QRCodesPage.jsx
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useRestaurant } from '../../context/RestaurantContext';
import { TABLE_COUNT } from '../../utils/helpers';

export default function QRCodesPage() {
  const restaurant = useRestaurant();
  const [tableCount, setTableCount] = useState(TABLE_COUNT);
  const [baseUrl, setBaseUrl] = useState(() => window.location.origin);
  const printRef = useRef(null);

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  const getTableUrl = (num) => `${baseUrl}/menu?table=${num}`;

  const handlePrintAll = () => {
    const content = printRef.current;
    const printWin = window.open('', '_blank', 'width=900,height=700');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Table QR Codes — ${restaurant?.name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Helvetica Neue', sans-serif; background: white; padding: 20px; }
          h1 { text-align: center; font-size: 20px; margin-bottom: 4px; }
          .subtitle { text-align: center; color: #666; font-size: 12px; margin-bottom: 24px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .card { border: 1.5px solid #e5e5e5; border-radius: 12px; padding: 16px; text-align: center; break-inside: avoid; }
          .card svg { display: block; margin: 0 auto 10px; }
          .table-num { font-size: 18px; font-weight: bold; margin-bottom: 2px; }
          .url { font-size: 9px; color: #999; word-break: break-all; }
          .restaurant { font-size: 11px; color: #555; margin-bottom: 8px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <h1>${restaurant?.name || 'TableSide Kitchen'}</h1>
        <p class="subtitle">Scan the QR code to order from your table</p>
        <div class="grid">
          ${tables.map(n => `
            <div class="card">
              <div class="restaurant">${restaurant?.name || 'TableSide'}</div>
              ${document.getElementById(`qr-table-${n}`)?.innerHTML || ''}
              <div class="table-num">Table ${n}</div>
              <div class="url">${getTableUrl(n)}</div>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  };

  const downloadSingle = (tableNum) => {
    const svgEl = document.getElementById(`qr-table-${tableNum}`)?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 340;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 300, 340);
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 25, 20, 250, 250);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 22px Helvetica';
      ctx.textAlign = 'center';
      ctx.fillText(`Table ${tableNum}`, 150, 300);
      ctx.font = '11px Helvetica';
      ctx.fillStyle = '#888';
      ctx.fillText(restaurant?.name || 'TableSide', 150, 325);
      const link = document.createElement('a');
      link.download = `QR_Table_${tableNum}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">QR Codes</h1>
          <p className="text-white/40 text-sm">Generate and print QR codes for each table</p>
        </div>
        <button
          onClick={handlePrintAll}
          className="btn-primary flex items-center gap-2"
        >
          🖨️ Print All QR Codes
        </button>
      </div>

      {/* Config */}
      <div className="glass rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
        <div className="flex-1">
          <label className="text-white/50 text-xs font-medium mb-2 block">Base URL</label>
          <input
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            className="input-field text-sm"
            placeholder="https://yourapp.com"
          />
          <p className="text-white/25 text-xs mt-1.5">
            Set this to your deployed domain in production
          </p>
        </div>
        <div className="sm:w-40">
          <label className="text-white/50 text-xs font-medium mb-2 block">Number of Tables</label>
          <input
            type="number"
            min="1"
            max="50"
            value={tableCount}
            onChange={e => setTableCount(Math.max(1, Math.min(50, Number(e.target.value))))}
            className="input-field text-sm"
          />
        </div>
      </div>

      {/* QR grid */}
      <div ref={printRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tables.map((num, i) => (
          <motion.div
            key={num}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-2xl p-4 flex flex-col items-center gap-3 group hover:border-white/15 transition-all"
          >
            {/* QR code */}
            <div
              id={`qr-table-${num}`}
              className="bg-white rounded-xl p-2 w-full aspect-square flex items-center justify-center"
            >
              <QRCodeSVG
                value={getTableUrl(num)}
                size={120}
                level="M"
                includeMargin={false}
                imageSettings={{
                  src: '',
                  excavate: false,
                }}
              />
            </div>

            {/* Label */}
            <div className="text-center">
              <p className="text-white font-bold text-sm">Table {num}</p>
              <p className="text-white/25 text-[10px] break-all leading-tight mt-0.5">
                /menu?table={num}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => downloadSingle(num)}
                className="flex-1 glass py-1.5 rounded-xl text-[11px] text-white/60 hover:text-white transition-colors"
                title="Download PNG"
              >
                ⬇ PNG
              </button>
              <a
                href={getTableUrl(num)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 glass py-1.5 rounded-xl text-[11px] text-white/60 hover:text-white transition-colors text-center"
                title="Test link"
              >
                ↗ Test
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Instructions */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <h3 className="font-display text-lg text-white mb-4">How to use</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: '1', icon: '🖨️', title: 'Print QR Codes', desc: 'Click "Print All" to print all table QR codes on a single sheet, or download individual PNGs.' },
            { step: '2', icon: '🪑', title: 'Place at Tables', desc: 'Cut and laminate each QR code. Place them in a stand or stick them on each table.' },
            { step: '3', icon: '📱', title: 'Customers Scan', desc: 'Customers scan the QR code with their phone camera. No app needed — opens directly in browser.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/25 flex items-center justify-center text-red-400 font-bold text-sm flex-shrink-0">
                {step}
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-1">{icon} {title}</p>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
