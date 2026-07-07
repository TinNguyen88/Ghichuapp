import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerSW} from 'virtual:pwa-register';

// Đăng ký Service Worker: cache app shell để mở lại không cần mạng,
// tự kiểm tra bản cập nhật mới trong nền và áp dụng ở lần mở tiếp theo.
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
