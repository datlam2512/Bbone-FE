# Hướng dẫn phát triển Bbone-FE

## Đọc code theo thứ tự

1. src/main.jsx: gắn React và CSS.
2. src/app/router.jsx: route gốc, lazy pages và layout.
3. src/app/layouts/PublicLayout.jsx: header, menu mobile, footer.
4. src/features/catalog/pages/ProductsPage.jsx: ví dụ trang đọc dữ liệu BE.
5. src/shared/components/ui/CollectionPage.jsx và shared/hooks/use-resource.js: search, loading/error/empty, AbortController.
6. src/features/auth/services/session.service.js: đăng nhập, nạp hồ sơ, đăng xuất.
7. src/shared/api/create-api-client.js: lỗi, timeout, 401 và single-flight refresh.
8. src/features/auth/stores/auth.store.js, cart/stores/guest-cart.store.js, shared/stores/ui.store.js: state theo trách nhiệm.

## Thêm một tính năng

Ví dụ orders:

```text
features/orders/
  api/orders.api.js
  pages/OrdersPage.jsx
  components/OrderCard.jsx
  hooks/use-orders.js        # Khi có logic riêng
  stores/orders-ui.store.js  # Chỉ khi state cần dùng qua nhiều component
```

API module dùng shared/api/client, không gọi fetch rải rác trong JSX. Dùng shared/api/query-string để bỏ tham số null/undefined. Route ghép ở app/router.jsx; metadata title/description/roles giữ cạnh route nghiệp vụ.

Tên biến theo nghĩa: appointment, product, shipment, cancellationSignal. Không gom mọi thứ vào App.jsx, một file services.js hoặc một store toàn cục. Chỉ tách helper khi có mục đích rõ; không thêm lớp trung gian chỉ để tăng số tầng.

Component tái sử dụng không biết URL nghiệp vụ hoặc role. Feature page gọi API module và ghép UI. Dùng alias @/ cho import giữa module, import tương đối cho file lân cận. Giữ quy tắc dependency: app ghép features và shared; shared không phụ thuộc features, ngoại trừ shared/api/client là điểm nối auth adapter có chủ ý. create-api-client là hàm thuần có dependency injection, test độc lập React.

## Zustand và dữ liệu server

- auth.store: token/phiên/user trong memory.
- ui.store: sidebar + trạng thái menu; chỉ sidebar persist.
- guest-cart.store: chỉ productId và quantity, không giữ giá hoặc thông tin người mua.
- useResource: danh sách nhỏ/đơn giản, hủy kết quả khi unmount. load cần identity ổn định (module-level hoặc useCallback).
- Đừng sao chép cùng dữ liệu API sang nhiều store. Cache/server state phức tạp cần thiết kế invalidation theo tính năng.
- Trang dữ liệu riêng phải phụ thuộc định danh phiên và xóa/unmount state khi logout hoặc đổi người dùng. Không dùng state người A làm placeholder cho người B.

## API client và giao dịch

api.get/post/put/delete xử lý JSON, Bearer, Problem Details và timeout. auth:false dành cho endpoint public/login. FormData được truyền nguyên trạng, không tự đặt Content-Type.

Một lần thao tác giao dịch dùng một Idempotency-Key. Giữ lại key cho cùng payload khi retry do mạng; chỉ tạo key mới cho ý định mới. API client chỉ tự thử lại sau 401/refresh, không tự retry mọi POST khi mạng lỗi. Không sửa version hoặc tự coi 409 là thành công.

Các ngày gửi BE cần UTC ISO có Z; hiển thị bằng Intl phù hợp ngữ cảnh. Tiền dùng số nguyên VND, frontend không quyết định giá/tổng thanh toán cuối cùng.

API có sẵn ở appointments.api là nền cho trang sau, chưa có hold/confirm UI. Cart API chưa tự động merge khi đăng nhập; khi triển khai phải giữ cùng key cho retry và chỉ xóa giỏ khách sau khi merge thành công.

## Route và quyền

PublicLayout cho khách hàng. WorkspaceLayout chọn staff/admin từ route handle. RequireSession chuyển sang đăng nhập khi thiếu user, giữ đường dẫn nội bộ để quay lại; kiểm roles ở route sâu nhất.

Admin sidebar lọc theo metadata admin.routes.js. Thêm route mới phải bổ sung link tương ứng và kiểm quyền BE. Chưa có UI đổi role context; mặc định login theo primary role do BE trả về.

## Tailwind và component

Token Healthcare Blue ở shared/styles/globals.css qua @theme. Dùng class theo token brand/ink thay vì rải mã màu. cn kết hợp clsx và tailwind-merge để truyền className có thể override.

Dùng Button, PageHeading, ResourceState làm ví dụ; không tạo component riêng cho mỗi thẻ div. Ưu tiên semantic HTML, label cho input, focus-visible, aria cho trạng thái và reduced motion. Font dùng local fallback; chưa tải font ngoài.

## Phạm vi và kiểm tra

npm.cmd run check chạy lint, 5 test và build. Các test kiểm tra refresh đồng thời, thay phiên trong lúc refresh, dữ liệu phản hồi của tài khoản cũ, giữ key/body và timeout. Đây chưa phải bộ kiểm thử UI/E2E cho toàn SRS.

Đã xem trang chủ trên trình duyệt, điều hướng trang sản phẩm và trạng thái DB trống, kiểm tra /quan-tri chuyển tới /dang-nhap khi chưa đăng nhập. Không tự thêm dữ liệu demo hoặc thay đổi BE trong đợt dựng cấu trúc này.

PlannedPage đánh dấu các màn hình chưa có chức năng. Khi triển khai một màn hình, thay route bằng lazy page thật, nối API, bổ sung trạng thái rỗng/lỗi và kiểm thử nghiệp vụ liên quan. Không dùng số liệu giả làm dữ liệu thật.

## Triển khai

npm run build tạo dist. Host SPA cần fallback về index.html cho route trình duyệt và reverse proxy /api tới backend. Vite preview chỉ xem bản build, không có dev proxy /api. Nếu dùng origin API riêng, cấu hình VITE_API_BASE_URL lúc build và CORS backend cho đúng origin.

Không commit .env.local, node_modules, dist hoặc .cache. Không đưa secret vào VITE_*. Giữ lockfile; npm audit cần chạy lại khi đổi dependency. Override minimatch chỉ áp dụng cho toolchain ESLint, có ghi lý do trong README.
