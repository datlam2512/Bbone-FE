# BBONE Frontend

Frontend của BBONE — nền tảng chăm sóc sức khỏe xương khớp, gồm website khách hàng và workspace dành cho nhân viên, quản trị. Ứng dụng được xây dựng bằng React, Vite, Tailwind CSS và Zustand; dữ liệu nghiệp vụ được lấy từ backend qua REST API.

## Yêu cầu

- Node.js `>=22.12.0`
- npm
- Backend BBONE đang chạy nếu muốn đăng nhập và sử dụng dữ liệu động

## Bắt đầu trên Windows

Mở PowerShell tại thư mục dự án:

```powershell
npm.cmd ci
npm.cmd run dev
```

Hoặc chạy `.\dev.cmd` để tự cài dependencies khi chưa có `node_modules` rồi khởi động Vite.

Mở [http://127.0.0.1:5173](http://127.0.0.1:5173). Máy chủ phát triển dùng cổng `5173`.

## Cấu hình backend

Tạo `.env.local` từ `.env.example` nếu cần thay đổi địa chỉ mặc định:

```dotenv
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME=BBONE
BACKEND_URL=http://localhost:5080
VITE_MEDIA_BASE_URL=
```

Trong môi trường phát triển, Vite proxy `/api` và `/media` tới `BACKEND_URL` (mặc định `http://localhost:5080`). `VITE_API_BASE_URL` mặc định là `/api/v1`.

Không đặt mật khẩu, API key, signing key hoặc thông tin bí mật trong biến `VITE_*`; các giá trị này được đóng gói vào mã chạy trên trình duyệt. Khi triển khai production, cấu hình reverse proxy tới backend hoặc API origin và CORS phù hợp. Tài khoản đăng nhập được quản lý bởi backend; frontend không có tài khoản mặc định.

## Lệnh thường dùng

```powershell
npm.cmd run dev          # Chạy Vite ở chế độ phát triển
npm.cmd run lint         # Chạy ESLint
npm.cmd test             # Chạy test tự động
npm.cmd run build        # Tạo bản build production trong dist/
npm.cmd run preview      # Xem thử bản build tại 127.0.0.1:4173
npm.cmd run format:check # Kiểm tra định dạng Prettier
npm.cmd run check        # Lint, test và build
```

`preview` không có proxy phát triển; cần cấu hình backend/reverse proxy cho môi trường tương ứng.

## Các luồng chính

### Website khách hàng

- Trang chủ, danh sách và chi tiết sản phẩm; tìm kiếm, lọc danh mục và phân trang.
- Danh sách phòng khám, thông tin cơ sở, dịch vụ và đường dẫn đặt lịch.
- Trung tâm bài viết và trang đọc bài.
- Đăng nhập, đăng ký, xác minh tài khoản và khôi phục mật khẩu.
- Giỏ hàng khách/tài khoản, áp dụng hoặc bỏ mã giảm giá, báo giá và thanh toán.
- Đặt lịch, xem lịch sử, quản lý hồ sơ/tài khoản, yêu thích và thông báo.
- Sàng lọc triệu chứng theo nội dung do backend cung cấp.

### Workspace nhân viên

Đường dẫn gốc: `/nhan-vien`

- Tổng quan công việc, lịch khám và cập nhật trạng thái theo quyền.
- Ghi chú tiếp đón, danh sách bệnh nhân và đặt lịch tại quầy.
- Quản lý khung giờ; hồ sơ khám và duyệt nội dung y khoa dành cho vai trò được phép.
- Báo cáo theo cơ sở và phân công.

### Workspace quản trị

Đường dẫn gốc: `/quan-tri`

- Dashboard, quản lý người dùng, phòng khám, dịch vụ, sản phẩm và tồn kho.
- Quản lý nội dung/bản sửa bài viết, mã giảm giá, đơn hàng, trả hàng và hoàn tiền.
- Quản lý giao hàng, thư viện ảnh, báo cáo, nhật ký hệ thống, hàng đợi tác vụ và chính sách vận hành.

Quyền hiển thị và điều hướng ở frontend không thay thế kiểm tra quyền của backend. Backend là nguồn quyết định cuối cùng cho quyền truy cập, dữ liệu, giá, tồn kho và chuyển trạng thái.

## Cấu trúc mã nguồn

```text
src/
  app/          # Router, layouts, guards và khởi tạo ứng dụng
  features/     # Tính năng theo nghiệp vụ: auth, catalog, cart, staff, admin...
  shared/
    api/        # API client, lỗi và query string
    components/ # Thành phần UI dùng chung
    config/     # Cấu hình môi trường
    hooks/      # Hook tải dữ liệu và gửi lệnh
    lib/        # Hàm tiện ích
    styles/     # CSS layers, Tailwind và token
tests/          # Kiểm thử tự động
docs/           # Tài liệu phạm vi và hướng dẫn phát triển
```

Các điểm bắt đầu hữu ích:

- `src/main.jsx`: khởi tạo React, router và theme.
- `src/app/router.jsx`: khai báo route và lazy loading.
- `src/shared/api/create-api-client.js`: HTTP, timeout, lỗi và refresh phiên.
- `src/shared/hooks/use-resource.js`: tải dữ liệu, loading/error/retry và hủy request.
- `src/shared/hooks/use-command.js`: thao tác ghi, chống gửi lặp và xử lý phản hồi.

## Trạng thái và bảo mật

- Token xác thực được giữ trong bộ nhớ; không lưu token hoặc hồ sơ y tế vào `localStorage`.
- Giỏ khách chỉ lưu mã sản phẩm và số lượng; giá và tồn kho được tải lại từ backend.
- Dữ liệu y tế không được ghép vào URL hoặc lưu trong trình duyệt để thay thế backend.
- Request có thể bị hủy khi người dùng đổi trang/bộ lọc; lỗi API được đưa ra giao diện thay vì giả lập dữ liệu thành công.
- Frontend có thể ẩn menu theo vai trò, nhưng backend phải kiểm tra quyền với mọi request và đối tượng.

## Giới hạn môi trường

Thanh toán VietQR và một số thao tác giao hàng là mô phỏng theo cấu hình dự án; không coi trạng thái mô phỏng là xác nhận tiền đã vào tài khoản hoặc vận đơn thật. Sàng lọc và hồ sơ y khoa phụ thuộc cấu hình, dữ liệu được backend phê duyệt và quyền người dùng. Không sử dụng dữ liệu seed hoặc môi trường local như dịch vụ y tế tiếp nhận thực tế.

## Tài liệu khác

- [Hướng dẫn phát triển](./docs/DEVELOPMENT.md)
- [Phạm vi giao diện và giới hạn](./docs/UI-COVERAGE.md)
- [Đặt lịch và quản trị](./docs/BOOKING-AND-ADMIN.md)
