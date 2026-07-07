import { VaultItem, VaultSettings } from '../types';

export const INITIAL_REAL_ITEMS: VaultItem[] = [
  {
    id: 'real-1',
    title: 'Mật khẩu Ngân hàng & Tài khoản Đầu tư',
    category: 'note',
    content: 'Tài khoản Techcombank: 19034448888\nMật khẩu giao dịch: Vcb@9988!\nMã bảo mật két sắt cá nhân: 4829\nVí ngoại hối: 0x71C...392B',
    updatedAt: 'Hôm qua, 14:30',
    isSensitive: true,
    favorite: true
  },
  {
    id: 'real-2',
    title: 'Ảnh chụp CCCD & Hộ chiếu',
    category: 'photo',
    content: 'Lưu trữ bản ảnh chụp chất lượng cao CCCD gắp chip và Hộ chiếu để xuất trình khi khẩn cấp ở nước ngoài.',
    imageData: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600',
    updatedAt: '12/05/2026',
    isSensitive: true,
    favorite: true
  },
  {
    id: 'real-3',
    title: 'Hợp đồng thỏa thuận bảo mật quyền sở hữu',
    category: 'file',
    content: 'Tập tin hợp đồng PDF chuyển nhượng cổ phần và thỏa thuận bảo mật kinh doanh năm 2026.',
    fileName: 'Hop_Dong_Bao_Mat_2026_Final.pdf',
    fileSize: '4.2 MB',
    updatedAt: '01/06/2026',
    isSensitive: true,
    favorite: false
  },
  {
    id: 'real-4',
    title: 'Ghi chú sổ tay cá nhân mật',
    category: 'note',
    content: 'Nhật ký cá nhân và danh sách những số điện thoại liên lạc khẩn cấp không lưu trong danh bạ máy.',
    updatedAt: 'Vừa xong',
    isSensitive: false,
    favorite: false
  }
];

export const INITIAL_FAKE_ITEMS: VaultItem[] = [
  {
    id: 'fake-1',
    title: 'Danh sách đi siêu thị cuối tuần',
    category: 'shopping',
    content: 'Mua sắm cho gia đình vào sáng Chủ Nhật tại Co.opmart hoặc Bách Hóa Xanh.',
    updatedAt: 'Hôm nay, 09:15',
    isCompleted: false,
    favorite: true
  },
  {
    id: 'fake-2',
    title: 'Thanh toán tiền điện & nước tháng 7',
    category: 'task',
    content: 'Nhớ kiểm tra app điện lực để thanh toán trước ngày 10/07 tránh bị cắt điện.',
    updatedAt: 'Hôm qua, 18:20',
    isCompleted: true,
    favorite: false
  },
  {
    id: 'fake-3',
    title: 'Công thức nấu phở bò gia truyền',
    category: 'note',
    content: 'Nguyên liệu: Xương ống bò, quế, hồi, thảo quả, hành tây nướng, gừng nướng. Hầm lửa nhỏ trong 8 tiếng để nước dùng trong và ngọt sâu.',
    updatedAt: '28/06/2026',
    isCompleted: false,
    favorite: true
  },
  {
    id: 'fake-4',
    title: 'Lịch họp kiểm điểm dự án quý 3',
    category: 'task',
    content: 'Chuẩn bị slide báo cáo tiến độ kinh doanh và số liệu bán hàng gửi cho trưởng phòng trước thứ Năm.',
    updatedAt: '02/07/2026',
    isCompleted: false,
    favorite: false
  }
];

export const DEFAULT_SETTINGS: VaultSettings = {
  realPin: '8888',
  duressPin: '0000',
  enableFaceId: true,
  autoLockMinutes: 5,
  stealthTitle: 'Ghi chú hằng ngày'
};
