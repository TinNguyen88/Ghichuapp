# Khôi phục pipeline deploy GitHub Pages

## Cách dùng
Copy toàn bộ thư mục `.github/` này vào gốc repo (cùng cấp với `package.json`),
rồi commit + push:

```bash
git add .github/
git commit -m "Khoi phuc GitHub Actions deploy pipeline"
git push origin main
```

## Đã xác minh (mục 3 & 4 trong yêu cầu)
- `package-lock.json` hiện có `lockfileVersion: 3` — tương thích `npm ci` trên
  `actions/setup-node@v4` (Node 20). Không cần sửa gì.
- `vite.config.ts`: `base: './'` (đường dẫn tương đối, đúng cho GitHub Pages ở
  dạng `username.github.io/ten-repo/`), `build.outDir: 'dist'` khớp với
  `upload-pages-artifact` đang trỏ vào `./dist`. Không cần sửa gì.

## Về việc Pages hiển thị /src/main.tsx thay vì file đã build (mục 5)

Đây **không phải lỗi trong code hay trong workflow**. File `index.html` gốc
trong repo (source) LUÔN LUÔN chứa dòng:

```html
<script type="module" src="/src/main.tsx"></script>
```

Đây là điều **bình thường** — lúc `npm run build` chạy, Vite tự thay dòng này
bằng file JS đã biên dịch có hash (vd: `/assets/index-xxxx.js`) trong
`dist/index.html`. Nếu trên GitHub Pages bạn vẫn thấy `/src/main.tsx` (trang
trắng hoặc lỗi 404 tài nguyên), nghĩa là Pages đang phục vụ **thẳng file
index.html gốc trong repo**, KHÔNG phải thư mục `dist/` đã build. Nguyên nhân
gần như chắc chắn là:

**Settings → Pages → Source đang để "Deploy from a branch" thay vì "GitHub Actions".**

### Cách sửa
1. Vào repo trên GitHub → **Settings → Pages**.
2. Ở mục **Build and deployment → Source**, chọn **"GitHub Actions"** (không
   chọn "Deploy from a branch").
3. Vào tab **Actions**, chạy lại workflow "Deploy Vault to GitHub Pages" (hoặc
   push một commit mới để tự trigger).
4. Đợi cả 2 job `build` và `deploy` chạy xong (dấu ✓ xanh).
5. Mở link Pages hiển thị trong job `deploy` — lúc này View Source phải thấy
   thẻ script trỏ tới `/assets/index-xxxx.js`, không còn `/src/main.tsx`.

Nếu Source trong Settings → Pages đã đúng là "GitHub Actions" mà vẫn thấy
`/src/main.tsx`, khả năng là trình duyệt đang cache bản cũ — thử mở bằng cửa
sổ ẩn danh (Private/Incognito) để kiểm tra lại.
