import React, { useEffect, useState } from 'react';
import { Share, X } from 'lucide-react';

const DISMISS_KEY = 'sos_ios_hint_dismissed_v1';

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone(): boolean {
  // navigator.standalone chỉ tồn tại trên Safari iOS
  return (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
}

export const IOSInstallHint: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY) === '1';
    setVisible(isIos() && !isStandalone() && !dismissed);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto mb-3 relative z-10">
      <div className="flex items-start space-x-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 backdrop-blur-md">
        <Share className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-300 leading-snug flex-1">
          Để dùng nhanh như một app riêng: nhấn nút <strong>Chia sẻ</strong> ở thanh Safari,
          rồi chọn <strong>"Thêm vào Màn hình chính"</strong>.
        </p>
        <button onClick={dismiss} className="text-slate-500 hover:text-slate-300 shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
