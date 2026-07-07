import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  Image as ImageIcon, 
  File, 
  CheckSquare, 
  ShoppingCart, 
  Trash2, 
  Edit3, 
  Star, 
  Clock,
  X,
  Save,
  Upload,
  Download,
  Check
} from 'lucide-react';
import { VaultItem, VaultItemCategory, VaultMode } from '../types';

interface VaultItemsViewProps {
  items: VaultItem[];
  mode: VaultMode;
  onAddItem: (item: Omit<VaultItem, 'id' | 'updatedAt'>) => void;
  onUpdateItem: (item: VaultItem) => void;
  onDeleteItem: (id: string) => void;
}

export const VaultItemsView: React.FC<VaultItemsViewProps> = ({
  items,
  mode,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form State cho Tạo mới / Chỉnh sửa
  const [formData, setFormData] = useState<{
    title: string;
    category: VaultItemCategory;
    content: string;
    imageData?: string;
    fileName?: string;
    fileData?: string;
    fileSize?: string;
    favorite: boolean;
    isCompleted?: boolean;
  }>({
    title: '',
    category: mode === 'real' ? 'note' : 'shopping',
    content: '',
    imageData: '',
    fileName: '',
    fileData: '',
    fileSize: '',
    favorite: false,
    isCompleted: false
  });

  const isFake = mode === 'fake';

  const categories = isFake
    ? [
        { id: 'all', label: 'Tất cả', icon: FileText },
        { id: 'shopping', label: 'Mua sắm', icon: ShoppingCart },
        { id: 'task', label: 'Công việc', icon: CheckSquare },
        { id: 'note', label: 'Ghi chú', icon: FileText }
      ]
    : [
        { id: 'all', label: 'Tất cả', icon: FileText },
        { id: 'note', label: 'Ghi chú mật', icon: FileText },
        { id: 'photo', label: 'Hình ảnh', icon: ImageIcon },
        { id: 'file', label: 'Tập tin', icon: File }
      ];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openCreateModal = () => {
    setFormData({
      title: '',
      category: isFake ? 'shopping' : 'note',
      content: '',
      imageData: '',
      fileName: '',
      fileData: '',
      fileSize: '',
      favorite: false,
      isCompleted: false
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedItem(null);
  };

  const openEditModal = (item: VaultItem) => {
    setFormData({
      title: item.title,
      category: item.category,
      content: item.content || '',
      imageData: item.imageData || '',
      fileName: item.fileName || '',
      fileData: item.fileData || '',
      fileSize: item.fileSize || '',
      favorite: item.favorite || false,
      isCompleted: item.isCompleted || false
    });
    setSelectedItem(item);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề!");
      return;
    }

    if (isCreating) {
      onAddItem(formData);
    } else if (isEditing && selectedItem) {
      onUpdateItem({
        ...selectedItem,
        ...formData
      });
    }

    setIsCreating(false);
    setIsEditing(false);
    setSelectedItem(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'photo') {
        setFormData((prev) => ({ ...prev, imageData: base64 }));
      } else {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        setFormData((prev) => ({
          ...prev,
          fileName: file.name,
          fileData: base64,
          fileSize: sizeMb
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'photo' | 'file') => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'photo') {
        setFormData((prev) => ({ ...prev, imageData: base64 }));
      } else {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        setFormData((prev) => ({
          ...prev,
          fileName: file.name,
          fileData: base64,
          fileSize: sizeMb
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleComplete = (item: VaultItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateItem({
      ...item,
      isCompleted: !item.isCompleted
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24 space-y-4 select-none">
      {/* Thanh tìm kiếm và Nút Tạo mới */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={isFake ? "Tìm kiếm ghi chú, công việc..." : "Tìm kiếm dữ liệu mật..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={openCreateModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-2xl transition-all active:scale-95 shadow-md shadow-emerald-600/20 shrink-0 flex items-center justify-center"
          title="Thêm mới"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Bộ lọc danh mục kiểu iOS Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Danh sách dữ liệu */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 text-center space-y-3 my-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-white text-sm">Chưa có dữ liệu nào</h3>
            <p className="text-xs text-slate-400">
              Bấm vào biểu tượng <strong className="text-emerald-400">+</strong> ở góc trên để tạo mới.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const isFav = item.favorite;
            const isCompleted = item.isCompleted;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`bg-slate-900 border rounded-2xl p-4 transition-all cursor-pointer active:scale-[0.99] shadow-sm flex items-start justify-between group ${
                  isFav ? 'border-amber-500/40 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  {/* Biểu tượng phân loại hoặc Checkbox */}
                  {(item.category === 'shopping' || item.category === 'task') ? (
                    <button
                      onClick={(e) => handleToggleComplete(item, e)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 hover:border-emerald-400'
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 shrink-0 mt-0.5">
                      {item.category === 'photo' && <ImageIcon className="h-4 w-4" />}
                      {item.category === 'file' && <File className="h-4 w-4" />}
                      {item.category === 'note' && <FileText className="h-4 w-4" />}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h4 className={`font-semibold text-sm truncate ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      {isFav && <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>

                    <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                      {item.content || (item.fileName ? `Tệp: ${item.fileName}` : 'Không có mô tả')}
                    </p>

                    {/* Meta tags cho Hình ảnh & Tập tin */}
                    {item.category === 'photo' && item.imageData && (
                      <div className="mt-2">
                        <img src={item.imageData} alt={item.title} className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                      </div>
                    )}

                    {item.category === 'file' && item.fileName && (
                      <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono">
                        <File className="w-3 h-3 text-emerald-400" />
                        <span className="truncate max-w-[150px]">{item.fileName}</span>
                        {item.fileSize && <span className="text-slate-500">({item.fileSize})</span>}
                      </div>
                    )}

                    <div className="flex items-center space-x-2 mt-2 text-[10px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{item.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MÀN HÌNH CHI TIẾT (Detail Modal) */}
      {selectedItem && !isEditing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 uppercase tracking-wider">
                  {selectedItem.category === 'note' && 'Ghi chú'}
                  {selectedItem.category === 'photo' && 'Hình ảnh'}
                  {selectedItem.category === 'file' && 'Tập tin'}
                  {selectedItem.category === 'shopping' && 'Mua sắm'}
                  {selectedItem.category === 'task' && 'Công việc'}
                </span>
                {selectedItem.favorite && (
                  <span className="text-xs font-medium text-amber-400 flex items-center space-x-1 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-800/40">
                    <Star className="h-3 w-3 fill-current" />
                    <span>Quan trọng</span>
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white leading-tight">
                {selectedItem.title}
              </h2>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-sans">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedItem.content || 'Không có mô tả chi tiết.'}
                </p>

                {selectedItem.imageData && (
                  <div className="pt-2">
                    <img src={selectedItem.imageData} alt={selectedItem.title} className="w-full max-h-72 object-contain rounded-xl border border-slate-800 bg-slate-900" />
                  </div>
                )}

                {selectedItem.fileName && (
                  <div className="pt-2 flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-2 min-w-0">
                      <File className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-white block truncate">{selectedItem.fileName}</span>
                        {selectedItem.fileSize && <span className="text-[10px] text-slate-400">{selectedItem.fileSize}</span>}
                      </div>
                    </div>
                    {selectedItem.fileData && (
                      <a
                        href={selectedItem.fileData}
                        download={selectedItem.fileName}
                        className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải về</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Cập nhật: {selectedItem.updatedAt}</span>
                </span>
                <span>ID: {selectedItem.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn xóa mục này không?")) {
                    onDeleteItem(selectedItem.id);
                    setSelectedItem(null);
                  }
                }}
                className="flex items-center space-x-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors border border-rose-800/80 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                <span>Xóa</span>
              </button>

              <button
                onClick={() => openEditModal(selectedItem)}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors border border-slate-700 active:scale-95"
              >
                <Edit3 className="h-4 w-4 text-emerald-400" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MÀN HÌNH TẠO MỚI / CHỈNH SỬA (Form Modal) */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white">
                {isCreating ? 'Tạo mới dữ liệu' : 'Chỉnh sửa dữ liệu'}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Phân loại
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as VaultItemCategory })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {isFake ? (
                    <>
                      <option value="shopping">Danh sách mua sắm</option>
                      <option value="task">Công việc</option>
                      <option value="note">Ghi chú</option>
                    </>
                  ) : (
                    <>
                      <option value="note">Ghi chú mật</option>
                      <option value="photo">Hình ảnh</option>
                      <option value="file">Tập tin đính kèm</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tiêu đề <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tiêu đề..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nội dung ghi chú hoặc mô tả
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung chi tiết..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Upload Hình ảnh nếu chọn phân loại 'photo' */}
              {formData.category === 'photo' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Hình ảnh đính kèm (Lưu cục bộ 100% Offline)
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, 'photo')}
                    className="border-2 border-dashed border-slate-800 hover:border-emerald-500/60 rounded-2xl p-4 text-center cursor-pointer bg-slate-950 transition-colors"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="hidden"
                      id="upload-photo-input"
                    />
                    <label htmlFor="upload-photo-input" className="cursor-pointer block">
                      {formData.imageData ? (
                        <div className="space-y-2">
                          <img src={formData.imageData} alt="Preview" className="h-36 mx-auto object-contain rounded-xl border border-slate-800" />
                          <span className="text-xs text-emerald-400 block font-medium">Bấm hoặc kéo thả để thay đổi ảnh</span>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          <Upload className="h-8 w-8 text-slate-500 mx-auto" />
                          <span className="text-xs text-slate-400 block font-medium">Bấm để chọn hoặc kéo thả ảnh vào đây</span>
                          <span className="text-[10px] text-slate-500 block">Hỗ trợ PNG, JPG, WEBP</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Upload Tập tin nếu chọn phân loại 'file' */}
              {formData.category === 'file' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tập tin đính kèm (Lưu cục bộ 100% Offline)
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, 'file')}
                    className="border-2 border-dashed border-slate-800 hover:border-emerald-500/60 rounded-2xl p-4 text-center cursor-pointer bg-slate-950 transition-colors"
                  >
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'file')}
                      className="hidden"
                      id="upload-file-input"
                    />
                    <label htmlFor="upload-file-input" className="cursor-pointer block">
                      {formData.fileName ? (
                        <div className="space-y-1 py-2">
                          <File className="h-8 w-8 text-emerald-400 mx-auto" />
                          <span className="text-xs text-white font-medium block truncate">{formData.fileName}</span>
                          <span className="text-[10px] text-slate-400 block">{formData.fileSize} - Bấm để thay đổi tệp</span>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          <Upload className="h-8 w-8 text-slate-500 mx-auto" />
                          <span className="text-xs text-slate-400 block font-medium">Bấm để chọn hoặc kéo thả tập tin vào đây</span>
                          <span className="text-[10px] text-slate-500 block">Hỗ trợ PDF, DOCX, TXT, ZIP...</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.favorite}
                    onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-slate-300">Đánh dấu quan trọng (Ghim lên đầu)</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>{isCreating ? 'Tạo mới' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
