'use client';

import React, { useState } from 'react';
import { Smartphone, RotateCw, RefreshCw, QrCode, Monitor } from 'lucide-react';
import Link from 'next/link';

const DEVICES = [
  { id: 'iphone-15', name: 'iPhone 15 / 14 Pro (393×852)', width: 393, height: 852 },
  { id: 'iphone-standard', name: 'Standard Mobile (390×844)', width: 390, height: 844 },
  { id: 'pixel-7', name: 'Pixel 7 / Android (412×915)', width: 412, height: 915 },
  { id: 'compact', name: 'Compact Phone (360×780)', width: 360, height: 780 },
];

export default function MobilePreviewPage() {
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[1]); // 390x844
  const [isLandscape, setIsLandscape] = useState(false);
  const [key, setKey] = useState(0);
  const [networkUrl, setNetworkUrl] = useState('http://192.168.1.108:3000');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const port = window.location.port ? `:${window.location.port}` : '';
      setNetworkUrl(`http://192.168.1.108${port}`);
    }
  }, []);

  const currentWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
  const currentHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

  const refreshIframe = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-4 px-3 sm:py-6 sm:px-4 overflow-x-hidden">
      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 mb-4 sm:mb-6 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-sm sm:text-lg flex items-center gap-2">
              <span>AryaSaarthi Mobile POV Simulator</span>
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Preview
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Interactive 1:1 mobile viewport testing simulator
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Device Selector */}
          <select
            value={selectedDevice.id}
            onChange={(e) => {
              const dev = DEVICES.find((d) => d.id === e.target.value);
              if (dev) setSelectedDevice(dev);
            }}
            className="bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 outline-none focus:border-emerald-500 transition-colors"
          >
            {DEVICES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Orientation Toggle */}
          <button
            onClick={() => setIsLandscape(!isLandscape)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
            title="Rotate Device"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isLandscape ? 'Portrait' : 'Landscape'}</span>
          </button>

          {/* Refresh Frame */}
          <button
            onClick={refreshIframe}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
            title="Reload Page"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reload</span>
          </button>

          {/* Back to Desktop */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow transition-colors"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop View</span>
          </Link>
        </div>
      </div>

      {/* Network Notice / Direct Phone Access */}
      <div className="w-full max-w-5xl bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 mb-4 sm:mb-6 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Physical phone on same Wi-Fi:
          </span>
          <code className="bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300 font-mono font-bold">
            {networkUrl}
          </code>
        </div>
        <span className="text-[11px] text-emerald-400/80">
          Viewport: {currentWidth}px × {currentHeight}px
        </span>
      </div>

      {/* Smartphone Device Frame Container */}
      <div className="relative flex justify-center items-center my-auto w-full max-w-full overflow-x-auto py-2">
        <div
          className="relative bg-slate-900 rounded-[48px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_8px_#1e293b,0_0_0_10px_#334155] border border-slate-700 shrink-0 mx-auto transition-all duration-300"
          style={{
            width: currentWidth + 20,
            height: currentHeight + 20,
          }}
        >
          {/* Dynamic Island / Camera Notch (pointer-events-none so it doesn't block touch) */}
          {!isLandscape && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2.5 pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-slate-900/90 border border-slate-700/60" />
            </div>
          )}

          {/* Device Screen (Iframe) */}
          <div
            className="relative w-full h-full rounded-[38px] overflow-hidden bg-slate-50 shadow-inner"
            style={{ width: currentWidth, height: currentHeight }}
          >
            <iframe
              key={key}
              src="/"
              title="AryaSaarthi Mobile POV"
              className="w-full h-full border-0"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>

          {/* Bottom Home Indicator Bar */}
          {!isLandscape && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-30 pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}
