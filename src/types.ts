export type VaultMode = 'locked' | 'real' | 'fake';

export type VaultItemCategory = 'note' | 'photo' | 'file' | 'shopping' | 'task';

export interface VaultItem {
  id: string;
  title: string;
  category: VaultItemCategory;
  content: string; // Nội dung ghi chú hoặc mô tả
  imageData?: string; // Base64 cho Hình ảnh
  fileName?: string; // Tên tệp cho Tập tin
  fileData?: string; // Base64 cho Tập tin
  fileSize?: string; // Kích thước tệp (ví dụ: "2.4 MB")
  updatedAt: string;
  isCompleted?: boolean; // Cho Danh sách mua sắm hoặc Công việc
  isSensitive?: boolean;
  favorite?: boolean;
}

export interface VaultSettings {
  realPin: string; // Mật khẩu Không gian Thật
  duressPin: string; // Mật khẩu Không gian Giả (Khẩn cấp)
  enableFaceId: boolean; // Bật/tắt Face ID
  autoLockMinutes: number; // Thời gian tự động khóa
  stealthTitle: string; // Tên ứng dụng hiển thị khi ở Không gian Giả
}

export type AppTab = 'vault' | 'settings';
