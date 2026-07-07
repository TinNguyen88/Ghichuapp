import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { VaultMode, AppTab, VaultItem, VaultSettings } from './types';
import { INITIAL_REAL_ITEMS, INITIAL_FAKE_ITEMS, DEFAULT_SETTINGS } from './data/initialVaultData';
import { AppLockScreen } from './components/AppLockScreen';
import { VaultHeader } from './components/VaultHeader';
import { VaultTabBar } from './components/VaultTabBar';
import { VaultItemsView } from './components/VaultItemsView';
import { RealVaultStorage, FakeVaultStorage, getLockoutRemainingMs, registerFailedAttempt, clearFailedAttempts } from './utils/vaultStorage';
import { idbGetWithLocalStorageMigration, idbSet } from './utils/idbStore';

// Settings không phải màn hình dùng ngay lúc mở app — tách bundle riêng để khởi động nhanh hơn.
const SettingsView = lazy(() => import('./components/SettingsView').then((m) => ({ default: m.SettingsView })));

const SETTINGS_KEY = 'sos_settings_v1';

export default function App() {
  const [mode, setMode] = useState<VaultMode>('locked');
  const [activeTab, setActiveTab] = useState<AppTab>('vault');
  const [lockoutMs, setLockoutMs] = useState<number>(0);
  const [settingsReady, setSettingsReady] = useState(false);
  const [settings, setSettings] = useState<VaultSettings>(DEFAULT_SETTINGS);

  // Nội dung Vault chỉ tồn tại dưới dạng bản rõ (plaintext) trong bộ nhớ RAM của
  // phiên đang mở khóa. Khi khóa lại, state được xóa về rỗng — trên đĩa
  // (IndexedDB) luôn luôn chỉ có bản đã mã hóa AES-256-GCM.
  const [realItems, setRealItems] = useState<VaultItem[]>([]);
  const [fakeItems, setFakeItems] = useState<VaultItem[]>([]);

  // Khóa AES phái sinh từ PIN đang mở, giữ tạm trong RAM để lưu lại thay đổi
  // trong phiên; bị xóa khỏi biến khi khóa app lại.
  const activePinRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);
  const modeRef = useRef<VaultMode>('locked');
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Tải cấu hình + trạng thái khóa tạm từ IndexedDB khi app khởi động
  // (kèm di chuyển tự động từ localStorage nếu là bản cài đặt cũ).
  useEffect(() => {
    (async () => {
      try {
        const saved = await idbGetWithLocalStorageMigration(SETTINGS_KEY);
        setSettings(saved ? JSON.parse(saved) : DEFAULT_SETTINGS);
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
      setLockoutMs(await getLockoutRemainingMs());
      setSettingsReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    idbSet(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, settingsReady]);

  // Chỉ ghi đè dữ liệu đã mã hóa khi đang thực sự mở khóa và đã tải xong lần đầu,
  // để tránh việc ghi mảng rỗng đè lên dữ liệu thật ngay khi app vừa khởi động (còn khóa).
  useEffect(() => {
    if (mode === 'real' && hydratedRef.current && activePinRef.current) {
      RealVaultStorage.save(activePinRef.current, realItems).catch(() => {});
    }
  }, [realItems, mode]);

  useEffect(() => {
    if (mode === 'fake' && hydratedRef.current && activePinRef.current) {
      FakeVaultStorage.save(activePinRef.current, fakeItems).catch(() => {});
    }
  }, [fakeItems, mode]);

  // Khóa ứng dụng — xóa bản rõ khỏi bộ nhớ RAM, trên đĩa chỉ còn dữ liệu đã mã hóa.
  const handleLock = () => {
    activePinRef.current = null;
    hydratedRef.current = false;
    setRealItems([]);
    setFakeItems([]);
    setMode('locked');
  };

  // Tự động khóa theo thời gian không tương tác (Auto-Lock)
  useEffect(() => {
    if (mode === 'locked' || settings.autoLockMinutes === 0) return;

    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleLock();
      }, settings.autoLockMinutes * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [mode, settings.autoLockMinutes]);

  // Tự động khóa ngay khi app bị đưa xuống nền / chuyển tab / tắt màn hình —
  // không chờ hết thời gian auto-lock trong trường hợp này, vì đây là lúc
  // rủi ro lộ dữ liệu cao nhất (máy rời khỏi tay chủ sở hữu).
  useEffect(() => {
    const onHide = () => {
      if (modeRef.current !== 'locked') handleLock();
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) onHide();
    });
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xử lý khi người dùng nhập đủ 4 số PIN trên màn hình khóa.
  // Trả về true nếu mở khóa thành công (thật hoặc giả), false nếu sai PIN.
  const handleSubmitPin = async (pin: string): Promise<boolean> => {
    const remaining = await getLockoutRemainingMs();
    if (remaining > 0) {
      setLockoutMs(remaining);
      return false;
    }

    if (pin === settings.realPin) {
      const items = await RealVaultStorage.load(pin, INITIAL_REAL_ITEMS);
      activePinRef.current = pin;
      setRealItems(items);
      hydratedRef.current = true;
      await clearFailedAttempts();
      setLockoutMs(0);
      setMode('real');
      setActiveTab('vault');
      return true;
    }

    if (pin === settings.duressPin) {
      const items = await FakeVaultStorage.load(pin, INITIAL_FAKE_ITEMS);
      activePinRef.current = pin;
      setFakeItems(items);
      hydratedRef.current = true;
      await clearFailedAttempts();
      setLockoutMs(0);
      setMode('fake');
      setActiveTab('vault');
      return true;
    }

    const newLockoutMs = await registerFailedAttempt();
    setLockoutMs(newLockoutMs);
    return false;
  };

  // Mở nhanh bằng Face ID mô phỏng — coi như đã xác thực danh tính, vẫn đi qua
  // đúng luồng giải mã bằng PIN thật để dữ liệu không bao giờ ở dạng chưa mã hóa lúc rảnh rỗi.
  const handleFaceIdUnlock = async () => {
    await handleSubmitPin(settings.realPin);
  };

  // Cập nhật CRUD cho dữ liệu
  const currentItems = mode === 'real' ? realItems : fakeItems;
  const setCurrentItems = mode === 'real' ? setRealItems : setFakeItems;

  const handleAddItem = (newItem: Omit<VaultItem, 'id' | 'updatedAt'>) => {
    const item: VaultItem = {
      ...newItem,
      id: `${mode === 'real' ? 'real' : 'fake'}-${Date.now()}`,
      updatedAt: 'Vừa xong'
    };
    setCurrentItems([item, ...currentItems]);
  };

  const handleUpdateItem = (updatedItem: VaultItem) => {
    setCurrentItems(
      currentItems.map((it) => (it.id === updatedItem.id ? { ...updatedItem, updatedAt: 'Vừa xong' } : it))
    );
  };

  const handleDeleteItem = (id: string) => {
    setCurrentItems(currentItems.filter((it) => it.id !== id));
  };

  // Đổi PIN: mã hóa lại dữ liệu bằng PIN mới. Nếu vùng chứa liên quan không phải
  // vùng đang mở trong phiên hiện tại, ta giải mã tạm bằng PIN CŨ rồi lưu lại
  // bằng PIN MỚI (không lưu bản rõ vào state, không hiển thị ra giao diện).
  const handleChangePins = async (newRealPin: string, newDuressPin: string) => {
    if (newRealPin !== settings.realPin) {
      if (mode === 'real') {
        await RealVaultStorage.save(newRealPin, realItems);
        activePinRef.current = newRealPin;
      } else {
        const items = await RealVaultStorage.load(settings.realPin, INITIAL_REAL_ITEMS);
        await RealVaultStorage.save(newRealPin, items);
      }
    }

    if (newDuressPin !== settings.duressPin) {
      if (mode === 'fake') {
        await FakeVaultStorage.save(newDuressPin, fakeItems);
        activePinRef.current = newDuressPin;
      } else {
        const items = await FakeVaultStorage.load(settings.duressPin, INITIAL_FAKE_ITEMS);
        await FakeVaultStorage.save(newDuressPin, items);
      }
    }

    setSettings((prev) => ({ ...prev, realPin: newRealPin, duressPin: newDuressPin }));
  };

  // Khôi phục dữ liệu từ tệp sao lưu — lưu mã hóa ngay lập tức cho cả hai không gian,
  // không phụ thuộc vào việc đang ở chế độ nào.
  const handleRestoreData = (restoredReal: VaultItem[], restoredFake: VaultItem[]) => {
    setRealItems(restoredReal);
    setFakeItems(restoredFake);
    if (settings.realPin) RealVaultStorage.save(settings.realPin, restoredReal).catch(() => {});
    if (settings.duressPin) FakeVaultStorage.save(settings.duressPin, restoredFake).catch(() => {});
  };

  // Chưa tải xong cấu hình ban đầu từ IndexedDB
  if (!settingsReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Màn hình Khóa
  if (mode === 'locked') {
    return (
      <AppLockScreen
        settings={settings}
        onSubmitPin={handleSubmitPin}
        onFaceIdUnlock={handleFaceIdUnlock}
        lockoutMs={lockoutMs}
      />
    );
  }

  // Màn hình làm việc chính (Không gian Thật hoặc Giả)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <VaultHeader
        mode={mode}
        settings={settings}
        onLock={handleLock}
      />

      {/* Nội dung chính */}
      <main className="flex-1">
        {activeTab === 'vault' && (
          <VaultItemsView
            items={currentItems}
            mode={mode}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'settings' && (
          <Suspense fallback={<div className="p-6 text-center text-slate-500 text-sm">Đang tải...</div>}>
            <SettingsView
              mode={mode}
              settings={settings}
              onUpdateSettings={setSettings}
              onLockNow={handleLock}
              realItems={realItems}
              fakeItems={fakeItems}
              onRestoreData={handleRestoreData}
              onChangePins={handleChangePins}
            />
          </Suspense>
        )}
      </main>

      {/* Thanh điều hướng dưới cùng (Tab Bar) */}
      <VaultTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode={mode}
      />
    </div>
  );
}
