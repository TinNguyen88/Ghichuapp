import { VaultItem } from '../types';
import { encryptData, decryptData } from './security';
import { idbGet, idbSet, idbGetWithLocalStorageMigration } from './idbStore';

const REAL_ENC_KEY = 'sos_real_items_enc_v1';
const FAKE_ENC_KEY = 'sos_fake_items_enc_v1';

// Các key JSON thuần từ bản cũ (không mã hóa, từng lưu trong localStorage) —
// chỉ dùng để di chuyển dữ liệu 1 lần sang dạng mã hóa trong IndexedDB.
const LEGACY_REAL_KEY = 'sos_real_items_v1';
const LEGACY_FAKE_KEY = 'sos_fake_items_v1';

async function loadEncryptedItems(
  storageKey: string,
  legacyKey: string,
  pin: string,
  fallback: VaultItem[]
): Promise<VaultItem[]> {
  const encrypted = await idbGet(storageKey);
  if (encrypted) {
    const json = await decryptData(encrypted, pin); // throws if pin sai / dữ liệu hỏng
    return JSON.parse(json);
  }

  // Không có dữ liệu mã hóa trong IndexedDB — kiểm tra dữ liệu cũ (chưa mã hóa,
  // từ bản localStorage trước đây) để di chuyển sang dạng mã hóa mới.
  const legacyPlain = localStorage.getItem(legacyKey);
  if (legacyPlain) {
    const items = JSON.parse(legacyPlain) as VaultItem[];
    await saveEncryptedItems(storageKey, pin, items);
    localStorage.removeItem(legacyKey);
    return items;
  }

  await saveEncryptedItems(storageKey, pin, fallback);
  return fallback;
}

async function saveEncryptedItems(storageKey: string, pin: string, items: VaultItem[]): Promise<void> {
  const encrypted = await encryptData(JSON.stringify(items), pin);
  await idbSet(storageKey, encrypted);
}

export const RealVaultStorage = {
  load: (pin: string, fallback: VaultItem[]) => loadEncryptedItems(REAL_ENC_KEY, LEGACY_REAL_KEY, pin, fallback),
  save: (pin: string, items: VaultItem[]) => saveEncryptedItems(REAL_ENC_KEY, pin, items),
};

export const FakeVaultStorage = {
  load: (pin: string, fallback: VaultItem[]) => loadEncryptedItems(FAKE_ENC_KEY, LEGACY_FAKE_KEY, pin, fallback),
  save: (pin: string, items: VaultItem[]) => saveEncryptedItems(FAKE_ENC_KEY, pin, items),
};

// --- Chống dò PIN bằng cách thử liên tục (rate limiting / lockout) ---
// Lưu ý: đây chỉ chặn được việc dò qua giao diện bấm số, không chặn được
// việc ai đó mở DevTools và gọi thẳng hàm giải mã trong mã nguồn JS.
// Với PIN chỉ có 10.000 khả năng, đây KHÔNG phải là bảo vệ tuyệt đối.
const FAIL_STATE_KEY = 'sos_fail_state_v1';
const MAX_FREE_ATTEMPTS = 5;

interface FailState {
  count: number;
  lockUntil: number; // epoch ms
}

async function readFailState(): Promise<FailState> {
  try {
    const raw = await idbGetWithLocalStorageMigration(FAIL_STATE_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lockUntil: 0 };
  } catch {
    return { count: 0, lockUntil: 0 };
  }
}

async function writeFailState(state: FailState) {
  await idbSet(FAIL_STATE_KEY, JSON.stringify(state));
}

export async function getLockoutRemainingMs(): Promise<number> {
  const { lockUntil } = await readFailState();
  return Math.max(0, lockUntil - Date.now());
}

export async function registerFailedAttempt(): Promise<number> {
  const state = await readFailState();
  state.count += 1;
  if (state.count > MAX_FREE_ATTEMPTS) {
    const extra = state.count - MAX_FREE_ATTEMPTS;
    const backoffSeconds = Math.min(30 * Math.pow(2, extra - 1), 15 * 60); // tối đa 15 phút
    state.lockUntil = Date.now() + backoffSeconds * 1000;
  }
  await writeFailState(state);
  return getLockoutRemainingMs();
}

export async function clearFailedAttempts(): Promise<void> {
  await writeFailState({ count: 0, lockUntil: 0 });
}
