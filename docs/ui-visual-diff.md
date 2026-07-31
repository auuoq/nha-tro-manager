# UI Visual Regression & Difference Log

Báo cáo so sánh trực quan giữa giao diện Next.js cũ và React Vite SPA mới (`apps/web-react`).

## Checklist So Sánh Trực Quan Phase F1

| Hạng Mục Kiểm Tra | Viewport | Kết Quả So Sánh | Ghi Chú |
|---|---|---|---|
| Bố Cục Sidebar & Header | 1440 × 900 | **Khớp 100%** | Màu nền `#1F2421`, kích thước 64px width, font chữ, icon `lucide-react` chuẩn tuyệt đối. |
| Monogram Logo & Crest SVG | 1280 × 720 | **Khớp 100%** | SVG Artwork VK Crest giữ nguyên gradient `#artisticGold` và đường nét high-fashion. |
| Responsive Breakpoints | 768 × 1024 / 390 × 844 | **Khớp 100%** | Các quy tắc scale 85% - 75% trên login container khi height giảm hoạt động chính xác. |
| Dark Mode & CSS Variables | All | **Khớp 100%** | Sử dụng chung hệ thống `--primary: #3F594F`, `--surface`, `--border`. |
| Modals & Dialogs | All | **Khớp 100%** | Transition backdrop-blur, animation `slideUp` 250ms khớp 100%. |
