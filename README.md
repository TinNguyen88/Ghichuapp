<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/365b8338-e92c-40f8-bef2-eb3504051735

## Kiến trúc hiện tại (v2.0)

- **Lưu trữ**: IndexedDB (bền hơn localStorage, hạn mức lớn hơn, ít bị Safari tự dọn dẹp
  hơn). Có tự động di chuyển dữ liệu từ bản localStorage cũ nếu người dùng nâng cấp.
- **Mã hóa**: AES-256-GCM, khóa suy ra từ đúng PIN đã nhập (PBKDF2, salt ngẫu nhiên
  riêng từng máy). Dữ liệu chỉ tồn tại dạng giải mã trong RAM khi đang mở khóa.
- **Tự khóa**: theo thời gian không thao tác, VÀ ngay khi app bị đưa xuống nền/chuyển
  tab/tắt màn hình (`visibilitychange`, `pagehide`) — không chờ hết thời gian chờ trong
  trường hợp này vì đây là lúc rủi ro cao nhất.
- **PWA**: Service Worker qua `vite-plugin-pwa`, cache toàn bộ app shell để mở lại không
  cần mạng, tự phát hiện bản cập nhật mới trong nền.
- **Bundle**: màn hình Cài đặt được tách riêng (`React.lazy`) để khởi động nhanh hơn.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Đưa lên GitHub Pages

Repo đã có sẵn `.github/workflows/deploy.yml`: mỗi lần push vào nhánh `main`, GitHub Actions
sẽ tự `npm ci` → `npm run build` → deploy thư mục `dist/` lên GitHub Pages. Bạn chỉ cần:

```
git add .
git commit -m "Nâng cấp bảo mật + PWA cho iPhone"
git push origin main
```

rồi bật GitHub Pages (Settings → Pages → Source: GitHub Actions) nếu chưa bật.

## Cài lên iPhone để dùng (Add to Home Screen)

App này là một trang web (PWA), được deploy tự động lên GitHub Pages qua
`.github/workflows/deploy.yml` mỗi khi push vào nhánh `main`.

1. Trên **iPhone, mở đúng bằng Safari** (bắt buộc — Chrome/Facebook/Zalo trên iOS
   không hỗ trợ "Thêm vào Màn hình chính" đầy đủ) và truy cập link GitHub Pages của repo.
2. Nhấn nút **Chia sẻ** (hình vuông có mũi tên lên) ở thanh dưới cùng.
3. Chọn **"Thêm vào Màn hình chính"** (Add to Home Screen).
4. App sẽ xuất hiện trên màn hình chính với tên **"Ghi chú"** (tên ngụy trang) và
   biểu tượng ghi chú — không có chữ "Vault" hay biểu tượng khiên ở đâu cả.
5. Mở từ icon đó, app chạy toàn màn hình như native app, không thanh địa chỉ Safari.

App tự có sẵn banner nhỏ gợi ý bước này ngay trên màn hình khóa nếu đang mở bằng Safari
trên iPhone (có thể bấm tắt).

## Tình trạng bảo mật thực tế (đọc trước khi tin tưởng dùng cho dữ liệu quan trọng)

`Documentation/VAULT_ARCHITECTURE_SPEC.md` mô tả một ứng dụng **iOS gốc (native, viết bằng
Swift)** với Secure Enclave, Action Button, Back Tap, RAM zeroing bằng `memset_s`... Đây là
bản **thiết kế/kế hoạch**, KHÔNG phải mô tả những gì code trong repo này đang làm. Repo này
là một **web app (React + Vite)** chạy trong Safari — về mặt kỹ thuật, một trang web
không thể truy cập Secure Enclave, không thể bind vào nút Action Button, không có
App Intents hay memory zeroing ở tầng hệ điều hành. Nếu dùng thật cho tình huống bị ép buộc,
đừng dựa vào các tính năng phần cứng nói trên — chúng chưa tồn tại trong bản này.

Những gì bản web này **thực sự làm** (sau khi sửa):
- Nội dung 2 không gian (Thật/Giả) được mã hóa **AES-256-GCM** thật sự khi lưu trên máy,
  khóa mã hóa được suy ra từ đúng PIN bạn nhập — không còn lưu dạng JSON thuần.
- PIN không còn hiển thị lộ liễu ở màn hình khóa.
- Có khóa tạm (lockout) sau nhiều lần nhập sai để làm chậm việc dò PIN qua bàn phím.
- Sao lưu/khôi phục `.sos` vẫn mã hóa AES-256-GCM như trước.

Giới hạn cố hữu cần biết:
- PIN chỉ 4 chữ số = 10.000 khả năng. Với ai có quyền mở DevTools/Web Inspector trên máy
  (cần cắm dây vào Mac + bật cài đặt riêng, không phải ai cũng làm được ngay tại chỗ),
  việc dò toàn bộ 10.000 khả năng bằng cách gọi thẳng hàm giải mã là khả thi trong thời gian ngắn.
  Đây là giới hạn của việc dùng PIN ngắn cho một web app chạy hoàn toàn phía client, không
  phải lỗi có thể vá bằng code — muốn an toàn hơn thật sự cần mật khẩu dài hơn hoặc app native
  có phần cứng hỗ trợ như trong spec.
- Dữ liệu nằm trong IndexedDB của Safari (bền hơn localStorage, nhưng vẫn là "Website Data").
  Nếu người dùng chủ động xóa dữ liệu duyệt web của trang này, dữ liệu **mất vĩnh viễn**
  nếu chưa xuất file backup `.sos`. Luôn xuất backup định kỳ.
- Không có tính năng phá màn hình khẩn cấp bằng Back Tap/Action Button như spec mô tả — chỉ có
  thao tác nhập PIN giả trên bàn phím.
