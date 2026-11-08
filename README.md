# BBONE Frontend

Nền ReactJS/JSX + Vite + Zustand + Tailwind CSS, tổ chức theo tính năng để phát triển website khách hàng, nhân viên và quản trị. Đây là giai đoạn dựng cấu trúc, chưa phải giao diện đầy đủ theo SRS.

## Chạy trên Windows

Yêu cầu Node.js >= 22.12 và npm. Mở terminal ở D:\Code\Bbone\Bbone-FE:

```powershell
.\dev.cmd
```

Hoặc nhấp đúp dev.cmd. Lần đầu script chạy npm ci nếu chưa có node_modules. Mở http://127.0.0.1:5173. Frontend dùng cổng 5173 cố định; nếu đã có một phiên đang chạy, dùng phiên đó hoặc dừng bằng Ctrl+C trước khi chạy lại.

Các lệnh khác:

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run check
npm.cmd run format:check
npm.cmd run build
npm.cmd run preview
```

check chạy ESLint, kiểm thử API client và build production. preview phục vụ bản build tại http://127.0.0.1:4173, không có dev proxy.

## Kết nối backend

Mặc định trình duyệt gọi /api/v1. Khi chạy dev, Vite chuyển /api tới http://localhost:5080; cần chạy BE nếu muốn dùng dữ liệu và đăng nhập. Cấu hình tùy chọn trong .env.local dựa trên .env.example:

```dotenv
VITE_API_BASE_URL=/api/v1
BACKEND_URL=http://localhost:5080
```

VITE_* được đưa vào mã trình duyệt: không đặt mật khẩu, signing key hoặc API secret tại đây. Production cần reverse proxy /api tới BE, hoặc cấu hình VITE_API_BASE_URL là origin API và cho phép đúng origin ở CORS của backend.

Đăng nhập dùng tài khoản của BE. FE không có tài khoản/mật khẩu mặc định. Database chưa seed sẽ hiển thị trạng thái trống trên các trang danh sách.

## Cấu trúc

```text
src/
  app/
    router.jsx          # Ghép route và lazy loading
    guards/             # Kiểm phiên/vai trò ở giao diện
    layouts/            # Public, Staff/Admin workspace
  features/
    home/               # Trang chủ khung
    auth/               # API, phiên, store và đăng nhập
    account/            # Trang thông tin tài khoản
    catalog/            # Danh sách sản phẩm và API
    clinics/            # Danh sách phòng khám và API
    knowledge/          # Danh sách bài viết và API
    appointments/       # Hợp đồng API, khai báo route
    cart/               # API giỏ đăng nhập + store giỏ khách
    screening/          # Khai báo route sàng lọc
    staff/              # Route/vai trò nhân viên
    admin/              # Route/vai trò quản trị
  shared/
    api/                # Fetch client, lỗi, refresh, query string
    components/         # UI và trạng thái dùng chung
    config/             # Biến môi trường
    hooks/              # Hook đọc dữ liệu có hủy request
    lib/                # Format và ghép class Tailwind
    stores/             # State giao diện dùng chung
    styles/             # Tailwind và token giao diện
tests/                  # Các bất biến của API client
docs/                   # Hướng dẫn phát triển
```

## Phạm vi đã có

- Trang chủ khung theo tông Healthcare Blue; responsive header/menu.
- Ba layout: public và workspace nhân viên/quản trị.
- React Router với lazy pages, trang lỗi và kiểm quyền theo metadata.
- Danh sách sản phẩm, phòng khám, bài viết lấy dữ liệu BE; có loading/error/empty/retry và tìm kiếm cơ bản. Chưa có trang chi tiết, bộ lọc nâng cao hoặc phân trang đầy đủ.
- Form đăng nhập, MFA tùy chọn, GET /me, đăng xuất và hồ sơ chỉ đọc. Chưa kiểm thử đăng nhập end-to-end bằng tài khoản thật.
- Zustand auth, UI và giỏ khách; API client làm mới token theo single-flight, giữ nguyên Idempotency-Key khi retry 401, không trả dữ liệu của phiên cũ cho tài khoản mới.
- Booking, screening, cart UI, lịch sử, dashboard, giao hàng và các trang quản trị hiện là PlannedPage: có route để nối tiếp triển khai, không có hành động giả.

## Quy ước state

Token và hồ sơ đăng nhập chỉ ở memory, không persist vào localStorage. Reload trình duyệt cần đăng nhập lại; refresh token chỉ tự làm mới trong phiên tab còn mở. Muốn duy trì đăng nhập qua reload cần thiết kế session/cookie cùng backend ở bước sau.

Chỉ persist tùy chọn sidebar và giỏ khách gồm productId/quantity, có kiểm tra dữ liệu khi hydrate. Không persist hồ sơ y tế, mật khẩu, giá/tổng tiền hoặc device secret. Giỏ đăng nhập thuộc BE; luồng tự gộp giỏ sau đăng nhập chưa nối vào UI.

Quyền phía FE phục vụ điều hướng. BE phải tiếp tục kiểm quyền mọi đối tượng; không coi ẩn menu là bảo mật.

## Tài liệu và dependency

Đọc docs/DEVELOPMENT.md trước khi thêm tính năng. Sử dụng hướng dẫn chính thức của [Tailwind với Vite](https://tailwindcss.com/docs/installation/using-vite) và [Zustand persist](https://zustand.docs.pmnd.rs/reference/middlewares/persist).

ESLint dùng bản 10; overrides minimatch 11.0.5 cho ESLint/config-array xử lý GHSA-g3hv-75wg-m249. npm audit tại thời điểm bàn giao không có advisory. Giữ package-lock.json và dùng npm ci; xem lại override khi nâng toolchain.
