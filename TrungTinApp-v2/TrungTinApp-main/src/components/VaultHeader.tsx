import React from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { VaultMode, VaultSettings } from '../types';

interface VaultHeaderProps {
  mode: VaultMode;
  settings: VaultSettings;
  onLock: () => void;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  mode,
  settings,
  onLock
}) => {
  if (mode === 'fake') {
    // KHÔNG GIAN GIẢ: Hiển thị hoàn toàn bình thường như một ứng dụng ghi chú thường ngày
    return (
      <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-2.5">
              <div className="bg-slate-800 p-2 rounded-xl text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white">{settings.stealthTitle}</span>
                <span className="text-[11px] text-slate-400 block -mt-0.5 font-sans">Ghi chú &amp; Công việc</span>
              </div>
            </div>

            <button
              onClick={onLock}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border border-slate-700/80 active:scale-95"
            >
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Khóa</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // KHÔNG GIAN THẬT: Giao diện S.O.S tối giản, tinh tế, an toàn
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-md">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-md shadow-emerald-500/20">
              <Shield className="h-5 w-5 text-slate-950 fill-slate-950/20" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base tracking-tight text-white">S.O.S</span>
                <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-950/80 text-emerald-400 rounded-md border border-emerald-800/60">
                  Không gian Thật
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">Bảo vệ dữ liệu cục bộ</span>
            </div>
          </div>

          <button
            onClick={onLock}
            className="flex items-center space-x-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-rose-800/80 active:scale-95"
          >
            <Lock className="h-3.5 w-3.5 text-rose-400" />
            <span>Khóa ngay</span>
          </button>
        </div>
      </div>
    </header>
  );
};
