import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Wifi, 
  Copy, 
  Check, 
  ExternalLink,
  Laptop,
  QrCode
} from 'lucide-react';
import { api } from '../services/api';

export default function ConnectPhoneModal({ isOpen, onClose }) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getNetworkIp()
        .then(data => {
          setNetworkInfo(data);
        })
        .catch(err => {
          console.error('Failed to get network IP:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetUrl = networkInfo?.primaryUrl || window.location.origin;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(targetUrl)}&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Open on Phone
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
              <img
                src={qrCodeUrl}
                alt="Scan to open on phone"
                className="w-48 h-48 rounded-xl object-contain"
                onError={(e) => {
                  // Fallback if offline
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }} className="w-48 h-48 flex-col items-center justify-center text-slate-400">
                <QrCode className="w-16 h-16 text-indigo-400 mb-2" />
                <span className="text-xs">Scan or type URL below</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              Connected to same Wi-Fi network
            </p>
          </div>

          {/* Direct URL copy box */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 text-left">
              Phone Browser URL
            </label>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={targetUrl}
                className="bg-transparent flex-1 text-xs font-mono text-slate-900 dark:text-white focus:outline-none px-2 select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Steps */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 text-left border border-slate-200/60 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Quick Setup (30 Seconds)
            </h4>
            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside">
              <li>Connect your phone to the same Wi-Fi as this laptop.</li>
              <li>Scan the QR code with your phone camera or open the URL in Chrome / Safari.</li>
              <li>Log in with your email — your account data is instantly synced!</li>
              <li>Tap <strong>"Add to Home Screen"</strong> in your mobile browser to use it like a native app.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
