import React, { useState, useEffect } from 'react';
import { Shield, Lock, Delete, Smartphone, AlertTriangle } from 'lucide-react';
import { VaultSettings } from '../types';
import { IOSInstallHint } from './IOSInstallHint';

interface AppLockScreenProps {
  settings: VaultSettings;
  onSubmitPin: (pin: string) => Promise<boolean>;
  onFaceIdUnlock: () => Promise<void>;
  lockoutMs: number;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  settings,
  onSubmitPin,
  onFaceIdUnlock,
  lockoutMs
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [faceIdState, setFaceIdState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [remainingLockSec, setRemainingLockSec] = useState<number>(Math.ceil(lockoutMs / 1000));

  useEffect(() => {
    setRemainingLockSec(Math.ceil(lockoutMs / 1000));
  }, [lockoutMs]);

  // Đếm ngược thời gian bị khóa tạm sau nhiều lần nhập sai
  useEffect(() => {
    if (remainingLockSec <= 0) return;
    const t = setInterval(() => {
      setRemainingLockSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [remainingLockSec > 0]);

  const isLocked = remainingLockSec > 0;

  // Tự động mô phỏng quét Face ID khi vừa mở app nếu người dùng đã bật Face ID
  useEffect(() => {
    if (settings.enableFaceId) {
      const timer = setTimeout(() => {
        setFaceIdState('scanning');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [settings.enableFaceId]);

  const handleDigit = (digit: string) => {
    if (isAuthenticating || isLocked) return;
    setError(null);
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);

      if (nextPin.length === 4) {
        setIsAuthenticating(true);
        setTimeout(async () => {
          const ok = await onSubmitPin(nextPin);
          if (!ok) {
            setError('Mật khẩu không đúng. Vui lòng thử lại.');
            setPin('');
            setIsAuthenticating(false);
          }
          // Nếu ok=true, component cha sẽ chuyển màn hình (real hoặc fake) — không cần làm gì thêm ở đây.
        }, 180);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !isAuthenticating) {
      setPin(pin.slice(0, -1));
      setError(null);
    }
  };

  const simulateFaceId = () => {
    if (isAuthenticating || isLocked) return;
    setFaceIdState('scanning');
    setIsAuthenticating(true);
    setTimeout(() => {
      setFaceIdState('success');
      setTimeout(async () => {
        await onFaceIdUnlock();
      }, 350);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 select-none relative overflow-hidden">
      {/* Hiệu ứng nền tĩnh tối giản */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <IOSInstallHint />

      {/* Header ứng dụng S.O.S */}
      <div className="w-full max-w-sm flex flex-col items-center pt-10 space-y-4 relative z-10">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-xl shadow-emerald-500/20 border border-emerald-400/30">
            <Shield className="w-8 h-8 text-slate-950 fill-slate-950/20" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center">
            <Lock className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">S.O.S</h1>
          <p className="text-xs text-slate-400">Ứng dụng bảo vệ dữ liệu cá nhân</p>
        </div>
      </div>

      {/* Nhập mã PIN và Face ID */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-8 my-auto relative z-10">
        <div className="text-center">
          <span className="text-xs font-medium text-slate-300">Nhập mật khẩu 4 chữ số</span>
        </div>

        {/* Các chấm hiển thị PIN */}
        <div className="flex items-center justify-center space-x-6 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-400/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Thông báo lỗi nếu sai mã */}
        <div className="h-6 flex items-center justify-center">
          {error && (
            <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-medium bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/60">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Nút Face ID */}
        {settings.enableFaceId && (
          <button
            onClick={simulateFaceId}
            disabled={isAuthenticating || isLocked}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all active:scale-95 ${
              faceIdState === 'scanning'
                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 animate-pulse'
                : faceIdState === 'success'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 shadow-md'
            }`}
          >
            <Smartphone className={`w-4 h-4 ${faceIdState === 'scanning' ? 'animate-bounce text-emerald-400' : ''}`} />
            <span>
              {faceIdState === 'scanning'
                ? 'Đang nhận diện Face ID...'
                : faceIdState === 'success'
                ? 'Đã xác thực Face ID!'
                : 'Mở bằng Face ID'}
            </span>
          </button>
        )}

        {/* Bàn phím số thao tác một tay */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full px-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              disabled={isAuthenticating || isLocked}
              className="w-20 h-20 mx-auto rounded-full bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700/80 border border-slate-800/80 flex flex-col items-center justify-center transition-all active:scale-95 shadow-md group"
            >
              <span className="text-2xl font-medium text-white group-hover:text-emerald-300 transition-colors">{digit}</span>
            </button>
          ))}

          {/* Hàng dưới cùng: Trống, 0, Xóa */}
          <div className="w-20 h-20 mx-auto" />

          <button
            onClick={() => handleDigit('0')}
            disabled={isAuthenticating || isLocked}
            className="w-20 h-20 mx-auto rounded-full bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700/80 border border-slate-800/80 flex items-center justify-center transition-all active:scale-95 shadow-md group"
          >
            <span className="text-2xl font-medium text-white group-hover:text-emerald-300 transition-colors">0</span>
          </button>

          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <button
              onClick={handleDelete}
              disabled={isAuthenticating || isLocked || pin.length === 0}
              className="w-14 h-14 rounded-full bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 border border-slate-800 flex items-center justify-center transition-all active:scale-95"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer hỗ trợ thông tin nhanh cho trải nghiệm — KHÔNG hiển thị PIN dưới bất kỳ hình thức nào */}
      <div className="w-full max-w-sm pb-6 text-center space-y-2 relative z-10">
        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800/60 backdrop-blur-md">
          {isLocked ? (
            <div className="flex items-center justify-center space-x-1.5 text-rose-400 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Đã khóa tạm do nhập sai nhiều lần. Thử lại sau {remainingLockSec}s.</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 leading-tight">
              Hoạt động hoàn toàn Offline trên thiết bị. Nội dung được mã hóa AES-256-GCM
              và chỉ được giải mã trong bộ nhớ tạm sau khi nhập đúng PIN.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
