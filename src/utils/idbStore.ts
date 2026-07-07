import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'sos_vault_db_v1';
const STORE = 'kv';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

export async function idbGet(key: string): Promise<string | null> {
  const db = await getDb();
  const val = await db.get(STORE, key);
  return val === undefined ? null : (val as string);
}

export async function idbSet(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.put(STORE, value, key);
}

export async function idbDelete(key: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, key);
}

/**
 * Đọc một key, và nếu chưa có trong IndexedDB nhưng còn tồn tại trong
 * localStorage (dữ liệu từ bản cũ), tự động chuyển sang IndexedDB rồi xóa
 * bản cũ ở localStorage. IndexedDB có hạn mức lưu trữ lớn hơn nhiều và ít bị
 * Safari tự động dọn dẹp hơn so với localStorage.
 */
export async function idbGetWithLocalStorageMigration(key: string): Promise<string | null> {
  const existing = await idbGet(key);
  if (existing !== null) return existing;

  const legacy = localStorage.getItem(key);
  if (legacy !== null) {
    await idbSet(key, legacy);
    localStorage.removeItem(key);
    return legacy;
  }
  return null;
}
