# BBONE Frontend

Website BBONE 2.0 là dự án portfolio về chăm sóc sức khỏe xương khớp, xây dựng bằng React. Frontend cung cấp trải nghiệm cho khách hàng cùng các workspace nhân viên và quản trị; dữ liệu nghiệp vụ được lấy từ REST API backend.

> Dự án phục vụ học tập/portfolio. VietQR và vận chuyển có chế độ mô phỏng; không có giao dịch chuyển tiền thật hoặc vận đơn hãng vận chuyển thật.

## Công nghệ

- React 19, Vite 8, JavaScript ES modules.
- React Router cho điều hướng trang; Zustand cho trạng thái client.
- Tailwind CSS 4 và Astryx Design System cho giao diện.
- Fetch API qua lớp client dùng chung; kiểm tra chất lượng với ESLint, Node test runner và Vite build.

## Chạy local

Yêu cầu Node.js `>=22.12.0`, npm và backend đang chạy nếu cần dùng dữ liệu động.

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở `http://127.0.0.1:5173`. Vite proxy các request `/api` và `/media` tới backend `http://localhost:5080`.

### Cấu hình API

Mặc định không cần file môi trường để chạy local. Nếu cần đổi địa chỉ backend, copy `.env.example` thành `.env.local` rồi chỉnh:

```dotenv
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME=BBONE
BACKEND_URL=http://localhost:5080
VITE_MEDIA_BASE_URL=
```

Khởi động lại Vite sau khi thay đổi biến môi trường. Chỉ các biến `VITE_*` được đưa vào bundle trình duyệt: **không đặt mật khẩu, API key, signing key hoặc secret trong các biến này**.

## Tính năng

### Khách hàng

- Trang chủ, danh sách/chi tiết sản phẩm, tìm kiếm và bộ lọc.
- Danh sách, chi tiết phòng khám và luồng chọn dịch vụ, ngày, giờ đặt lịch.
- Bài viết kiến thức và trang nội dung thông tin.
- Đăng ký, đăng nhập, xác minh email, quên/đặt lại mật khẩu.
- Giỏ hàng, mã ưu đãi, báo giá, checkout, lịch sử đơn hàng và yêu cầu hủy/hoàn trả.
- Tài khoản, địa chỉ, lịch hẹn, đơn hàng, yêu thích, thông báo và hồ sơ.
- Bảng câu hỏi sàng lọc triệu chứng; kết quả là gợi ý tham khảo, không phải chẩn đoán.

### Nhân viên và quản trị

- Workspace nhân viên tại `/nhan-vien`: lịch, tiếp đón, ca làm và nghiệp vụ theo quyền/cơ sở.
- Workspace quản trị tại `/quan-tri`: dashboard, người dùng, sản phẩm, phòng khám, dịch vụ, nội dung, kho, đơn hàng, giao hàng, trả hàng, hoàn tiền, báo cáo và cấu hình.
- Biểu mẫu quản trị mở dạng popup; quyền trên frontend chỉ hỗ trợ điều hướng, còn backend mới là nguồn xác thực cuối cùng.

## Cấu trúc dự án

```text
src/
  app/          Router, layouts, route guards, khởi tạo ứng dụng
  features/     Tính năng theo nghiệp vụ (auth, catalog, cart, booking, admin...)
  shared/
    api/        API client, lỗi và query string
    components/ Thành phần dùng chung
    config/     Cấu hình frontend
    hooks/      Hooks tải dữ liệu và gửi lệnh
    lib/        Hàm tiện ích
    styles/     Tailwind và design tokens
tests/          Kiểm thử tự động
docs/           Hướng dẫn, phạm vi và nghiệp vụ
```

Điểm bắt đầu khi đọc mã: `src/main.jsx`, `src/app/router.jsx`, `src/shared/api/create-api-client.js`, `src/shared/hooks/use-resource.js`, `src/shared/hooks/use-command.js`.

## Lệnh phát triển

```powershell
npm.cmd run dev          # Vite development server
npm.cmd run lint         # ESLint
npm.cmd test             # Node test runner
npm.cmd run build        # Production bundle vào dist/
npm.cmd run preview      # Xem thử dist tại 127.0.0.1:4173
npm.cmd run format:check # Kiểm tra Prettier
npm.cmd run check        # Lint + test + build
```

`preview` không sử dụng Vite dev proxy; cần cấu hình API origin/reverse proxy tương ứng.

## Deploy frontend lên Vercel

1. Import repository `Bbone-FE` từ Git provider.
2. Chọn framework Vite, build command `npm run build`, output directory `dist`.
3. Thêm biến môi trường trong Project Settings:

   ```text
   VITE_API_BASE_URL=https://<backend-host>/api/v1
   VITE_MEDIA_BASE_URL=https://<backend-host>
   VITE_APP_NAME=BBONE
   ```

4. Thêm URL Vercel chính xác vào cấu hình CORS của backend (`Cors__Origins__0`) rồi deploy lại backend.
5. Kiểm tra đăng nhập, sản phẩm, ảnh `/media`, đặt lịch và tải trực tiếp/refresh các route con. `vercel.json` trong repo tự rewrite các deep link về `/index.html` để React Router xử lý route.

Không đặt mật khẩu hay secret trong Vercel `VITE_*`; các giá trị này được công khai trong mã frontend. Xem hướng dẫn backend trong repo `Bbone-BE` để cấu hình Render/PostgreSQL và chế độ demo.

## Bảo mật và giới hạn

- Access token nằm trong bộ nhớ; frontend không lưu token hoặc hồ sơ sức khỏe vào `localStorage`.
- Giỏ hàng phía client chỉ giữ mã sản phẩm và số lượng; backend tính lại giá, tồn kho và quyền trên mỗi thao tác.
- Thanh toán VietQR có thể bật mô phỏng cho portfolio. Giao diện thể hiện rõ “mô phỏng, không thu tiền thật”; không được hiểu là tiền đã vào tài khoản.
- Sàng lọc sức khỏe không chẩn đoán và không thay thế khám trực tiếp.
- Dữ liệu seed và tài khoản Development chỉ dùng để trình diễn; không sử dụng như dữ liệu sản xuất.

## Tài liệu

- [Hướng dẫn sử dụng website](./docs/USER-GUIDE.md)
- [Hướng dẫn phát triển](./docs/DEVELOPMENT.md)
- [Phạm vi giao diện](./docs/UI-COVERAGE.md)
- [Đặt lịch và quản trị](./docs/BOOKING-AND-ADMIN.md)
