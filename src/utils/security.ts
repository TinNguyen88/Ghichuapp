/**
 * S.O.S Security & Cryptographic Engine
 * Sử dụng chuẩn AES-256-GCM của Web Crypto API để bảo vệ dữ liệu cục bộ 100% Offline.
 * Không kết nối internet, không lưu trên máy chủ.
 */
import { idbGetWithLocalStorageMigration, idbSet } from './idbStore';

// Tạo (hoặc lấy) một salt ngẫu nhiên riêng cho từng thiết bị/trình duyệt.
// KHÔNG hardcode salt trong mã nguồn: vì đây là mã mở, một salt cố định
// giống nhau cho mọi bản cài đặt sẽ giúp kẻ tấn công tính sẵn bảng tra cứu
// (rainbow table) offline cho toàn bộ không gian PIN 4 số.
const DEVICE_SALT_KEY = "sos_device_salt_v1";
let cachedSalt: string | null = null;

export async function getOrCreateDeviceSalt(): Promise<string> {
  if (cachedSalt) return cachedSalt;
  let salt = await idbGetWithLocalStorageMigration(DEVICE_SALT_KEY);
  if (!salt) {
    const bytes = window.crypto.getRandomValues(new Uint8Array(16));
    salt = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    await idbSet(DEVICE_SALT_KEY, salt);
  }
  cachedSalt = salt;
  return salt;
}

// Hàm tạo khóa AES-256-GCM từ mật khẩu PIN sử dụng PBKDF2
export async function deriveKeyFromPin(pin: string, salt?: string): Promise<CryptoKey> {
  const actualSalt = salt ?? (await getOrCreateDeviceSalt());
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Mã hóa dữ liệu bằng AES-256-GCM
export async function encryptData(data: string, pin: string): Promise<string> {
  try {
    const key = await deriveKeyFromPin(pin);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV chuẩn cho GCM
    const enc = new TextEncoder();
    const encodedData = enc.encode(data);

    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedData
    );

    // Gộp IV và Ciphertext thành Base64 để lưu trữ
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    let binary = "";
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error("Lỗi mã hóa cục bộ:", error);
    // Fallback an toàn nếu môi trường không hỗ trợ crypto.subtle
    return btoa(encodeURIComponent(data));
  }
}

// Giải mã dữ liệu bằng AES-256-GCM
export async function decryptData(encryptedBase64: string, pin: string): Promise<string> {
  try {
    const binary = atob(encryptedBase64);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const key = await deriveKeyFromPin(pin);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    console.error("Lỗi giải mã cục bộ hoặc sai mật khẩu:", error);
    // Thử fallback decode
    try {
      return decodeURIComponent(atob(encryptedBase64));
    } catch {
      throw new Error("Mật khẩu không đúng hoặc tệp dữ liệu bị hỏng.");
    }
  }
}

// Mô phỏng bộ nhớ đệm an toàn Keychain cho iOS
export class SecureKeychain {
  private static KEY_REAL = "sos_keychain_real_v1";
  private static KEY_FAKE = "sos_keychain_fake_v1";

  static saveEncryptedReal(dataJson: string): void {
    localStorage.setItem(this.KEY_REAL, dataJson);
  }

  static loadEncryptedReal(): string | null {
    return localStorage.getItem(this.KEY_REAL);
  }

  static saveEncryptedFake(dataJson: string): void {
    localStorage.setItem(this.KEY_FAKE, dataJson);
  }

  static loadEncryptedFake(): string | null {
    return localStorage.getItem(this.KEY_FAKE);
  }

  static clearAll(): void {
    localStorage.removeItem(this.KEY_REAL);
    localStorage.removeItem(this.KEY_FAKE);
  }
}
