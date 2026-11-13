# BBONE Frontend

Website BBONE 2.0 dành cho khách hàng, phòng khám và nhân viên quản trị. Ứng dụng viết bằng React và Vite, gọi dữ liệu nghiệp vụ qua REST API của [BBONE Backend](../Bbone-BE/README.md).

> Dự án portfolio. Thanh toán VietQR và giao vận có thể chạy ở chế độ mô phỏng; không có giao dịch tiền thật hoặc vận đơn hãng vận chuyển thật.

## Công nghệ

- React 19, JavaScript ES modules, Vite 8.
- React Router, Zustand, Tailwind CSS 4 và Astryx Design System.
- Fetch API qua client dùng chung; Node test runner, ESLint và Vite build.

## Yêu cầu

- Node.js `>=22.12.0` và npm.
- Backend đang chạy tại `http://localhost:5080` nếu cần dữ liệu động.

## Chạy local

Tại thư mục frontend:

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở `http://127.0.0.1:5173`. Vite proxy các request `/api` và `/media` tới `http://localhost:5080`.

Mặc định không cần file môi trường. Nếu backend chạy ở địa chỉ khác, tạo `.env.local`:

```dotenv
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME=BBONE
BACKEND_URL=http://localhost:5080
VITE_MEDIA_BASE_URL=
```

Khởi động lại Vite sau khi sửa biến. Chỉ biến `VITE_*` được đóng gói vào trình duyệt; không đặt mật khẩu, API key, signing key hay secret trong đó. `BACKEND_URL` chỉ dùng cho proxy của Vite khi phát triển.

## Các luồng chính

- Khách hàng: đăng ký/đăng nhập, xác minh email, sản phẩm, bài viết, đặt lịch, giỏ hàng, đơn, thông báo và hồ sơ.
- Phòng khám/nhân viên: workspace theo vai trò và cơ sở tại `/nhan-vien`.
- Quản trị: workspace tại `/quan-tri` để quản lý sản phẩm, phòng khám, lịch, nội dung, đơn, kho và tài khoản theo quyền.
- Upload ảnh sản phẩm, phòng khám, bài viết gọi backend; backend xử lý ảnh, lưu object trong Supabase Storage và trả URL để biểu mẫu lưu cùng bản ghi. Không upload ảnh riêng tư hoặc hồ sơ sức khỏe qua luồng ảnh catalogue.

Xem [hướng dẫn sử dụng](./docs/USER-GUIDE.md), [hướng dẫn phát triển](./docs/DEVELOPMENT.md), [phạm vi giao diện](./docs/UI-COVERAGE.md) và [đặt lịch/quản trị](./docs/BOOKING-AND-ADMIN.md).

## Lệnh phát triển

```powershell
npm.cmd run dev          # Vite development server
npm.cmd run lint         # ESLint
npm.cmd test             # Node test runner
npm.cmd run build        # Production bundle trong dist/
npm.cmd run preview      # Xem thử production build
npm.cmd run format:check # Kiểm tra Prettier
npm.cmd run check        # Lint + test + build
```

`preview` không dùng Vite dev proxy; cần API origin hoặc reverse proxy production tương ứng.

## Deploy lên Vercel

1. Import repository frontend và chọn **Vite**.
2. Build command: `npm run build`; output directory: `dist`.
3. Trong **Project Settings → Environment Variables**, đặt:

   ```text
   VITE_API_BASE_URL=https://<api-domain>.onrender.com/api/v1
   VITE_MEDIA_BASE_URL=https://<api-domain>.onrender.com
   VITE_APP_NAME=BBONE
   ```

4. Trên Render, thêm origin frontend chính xác vào `Cors__Origins__0` rồi deploy lại backend.
5. Kiểm tra trang chủ, đăng nhập, route con, tải trực tiếp/refresh trang phòng khám, đặt lịch, sản phẩm và ảnh.

`vercel.json` rewrite route con về `/index.html`, giúp React Router xử lý khi tải lại trang. Ảnh Supabase dùng URL đầy đủ; `VITE_MEDIA_BASE_URL` chủ yếu hỗ trợ đường dẫn media cũ như `/media/...`.

Không lưu bất kỳ secret nào trong biến `VITE_*`: các giá trị này công khai trong bundle trình duyệt. URL API và cấu hình Supabase Storage thuộc backend; xem README backend để cấu hình Render, database, bucket và email.

## Ghi chú bảo mật và dữ liệu

- Access token chỉ giữ trong bộ nhớ; frontend không lưu token hay hồ sơ sức khỏe trong `localStorage`.
- Backend là nguồn xác thực cuối cùng cho quyền, giá, tồn kho và dữ liệu đặt lịch. Ẩn nút trên giao diện không thay thế kiểm tra quyền phía server.
- Giỏ hàng chỉ giữ mã sản phẩm/số lượng; backend tính lại giá và tồn kho.
- Sàng lọc triệu chứng chỉ cung cấp thông tin tham khảo, không phải chẩn đoán.
- Tài khoản/dữ liệu demo chỉ dành Development.

## Cấu trúc mã

```text
src/
  app/          Router, layout, route guards, khởi tạo ứng dụng
  features/     Tính năng theo nghiệp vụ
  shared/       API client, component, hook, config và tiện ích
tests/          Kiểm thử tự động
docs/           Hướng dẫn và phạm vi nghiệp vụ
```

Điểm bắt đầu để đọc mã: `src/main.jsx`, `src/app/router.jsx`, `src/shared/api/create-api-client.js`, `src/shared/hooks/use-resource.js` và `src/shared/hooks/use-command.js`.