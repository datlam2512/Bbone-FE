# Hướng dẫn sử dụng BBONE

> Tài liệu dành cho bản chạy local/portfolio. Một số thao tác thanh toán, vận chuyển và dữ liệu dùng cấu hình mô phỏng; đây không phải dịch vụ đặt khám hay mua bán đang vận hành thực tế.

## 1. Mở website

1. Khởi động backend theo [README backend](../../Bbone-BE/README.md), sau đó khởi động frontend bằng `npm run dev` trong thư mục `Bbone-FE`.
2. Mở `http://127.0.0.1:5173`. API mặc định được Vite chuyển tiếp đến `http://localhost:5080`.
3. Nếu API chạy ở cổng khác, cập nhật `BACKEND_URL` trong `.env.local` của frontend rồi khởi động lại Vite.

## 2. Trang dành cho khách hàng

- **Trang chủ**: xem banner, dịch vụ, sản phẩm, cơ sở y tế và bài viết; dùng menu để đi tới từng khu vực.
- **Sản phẩm** (`/san-pham`): tìm kiếm/lọc sản phẩm, mở trang chi tiết, chọn biến thể/size khi có, chọn số lượng và thêm vào giỏ. Giá, tình trạng hàng và đơn hàng được backend kiểm tra lại.
- **Giỏ hàng và thanh toán** (`/gio-hang`, `/thanh-toan`): kiểm tra số lượng, thông tin nhận hàng, mã ưu đãi và phương thức thanh toán. VietQR hiện là luồng mô phỏng; không chuyển tiền thật theo mã QR này.
- **Phòng khám** (`/phong-kham`): lọc và xem chi tiết cơ sở, dịch vụ. Chọn ngày/giờ còn trống rồi gửi yêu cầu tại `/dat-lich`; lịch mô phỏng không xác nhận rằng cơ sở đã tiếp nhận lịch thật.
- **Kiến thức** (`/kien-thuc`): tìm và đọc bài viết. Nội dung có thể yêu cầu duyệt trước khi xuất bản.
- **Kiểm tra sức khỏe** (`/kiem-tra-suc-khoe`): trả lời câu hỏi sàng lọc và xem gợi ý hướng dẫn; đây không phải chẩn đoán y khoa.
- **Tài khoản** (`/tai-khoan`): theo dõi lịch hẹn/đơn hàng và quản lý thông tin, địa chỉ, thông báo, yêu thích, hồ sơ.

## 3. Đăng nhập và tài khoản thử nghiệm

Tài khoản được tạo bởi backend. Trên database mới, bootstrap Admin và các tài khoản seed dùng email/mật khẩu do người chạy backend nhập lúc khởi động; không có mật khẩu mặc định được cài sẵn.

Để tạo tài khoản thử nghiệm trên database Development trống, chạy từ thư mục backend:

```powershell
.\dev.cmd -AdminEmail 'admin@bbone.local' -SeedDemo
```

Khi được hỏi, nhập mật khẩu mạnh dài ít nhất 16 ký tự. Dùng mật khẩu đó cho các email sau:

| Role | Email đăng nhập | Dùng để |
|---|---|---|
| Admin | Email đã nhập ở `-AdminEmail` (ví dụ `admin@bbone.local`) | Quản trị toàn hệ thống |
| Customer | `customer@bbone.example` | Luồng mua hàng, lịch hẹn và tài khoản khách |
| Doctor | `doctor@bbone.example` | Workspace bác sĩ và duyệt nội dung y khoa |
| Receptionist | `receptionist@bbone.example` | Tiếp đón và lịch tại cơ sở |
| ClinicManager | `clinicmanager@bbone.example` | Theo dõi vận hành cơ sở và báo cáo được cấp |
| Commerce | `commerce@bbone.example` | Sản phẩm, đơn, kho, giao hàng, trả hàng, mã ưu đãi |
| Finance | `finance@bbone.example` | Đối soát, hoàn tiền và báo cáo tài chính |
| Editor | `editor@bbone.example` | Soạn nội dung và quản lý thư viện theo quyền |
| Reviewer | `reviewer@bbone.example` | Duyệt nội dung không yêu cầu thẩm định y khoa |

Mật khẩu là giá trị bạn tự nhập khi seed, không phải mật khẩu có thể khôi phục từ tài liệu này. Seed demo chỉ thêm tài khoản khi database chưa có cơ sở; nếu dữ liệu đã tồn tại, lệnh seed không tự tạo lại hoặc đổi mật khẩu. Không dùng các tài khoản này trong production.

## 4. Quản trị website

Đăng nhập role được cấp quyền rồi mở `/quan-tri`. Menu chỉ hiện các khu vực phù hợp với role; backend vẫn kiểm tra quyền ở từng API.

| Khu vực | Tác vụ chính |
|---|---|
| Tổng quan | Xem số liệu và lối tắt theo role |
| Sản phẩm | Tìm, phân trang, thêm/sửa sản phẩm; điều chỉnh tồn; tải ảnh lên |
| Phòng khám / Dịch vụ | Quản lý thông tin cơ sở, ảnh và dịch vụ |
| Nội dung | Soạn bài, sửa bản nháp, xem hàng đợi duyệt và công bố theo quyền |
| Người dùng | Tìm tài khoản, mời nhân viên, phân vai trò và cơ sở; thao tác nhạy cảm cần xác nhận |
| Mã giảm giá | Tạo mã và bật/tắt mã áp dụng cho đơn mới |
| Kho theo lô | Nhập lô, theo dõi hạn dùng, cách ly/gỡ cách ly sau khi ghi lý do |
| Đơn hàng / Giao hàng | Xem chi tiết trong cửa sổ thao tác, cập nhật trạng thái hợp lệ, xử lý yêu cầu hủy và vận đơn mô phỏng |
| Trả hàng / Hoàn tiền | Duyệt yêu cầu, kiểm nhận hàng và ghi nhận chứng từ hoàn theo đúng quyền |
| Báo cáo / Nhật ký / Tác vụ / Cấu hình | Chỉ dành cho role được cấp quyền; xem dữ liệu và ghi nhận thay đổi vận hành |

Các thao tác thêm/sửa/duyệt được mở trong popup để giữ bảng và bộ lọc phía sau. Kiểm tra nội dung, phiên bản và xác nhận trong biểu mẫu trước khi lưu. Đóng popup bằng nút **Đóng** hoặc phím `Esc`; dữ liệu chỉ thay đổi sau khi API báo lưu thành công.

## 5. Workspace nhân viên

Mở `/nhan-vien` bằng role Doctor, Receptionist hoặc ClinicManager phù hợp. Các mục khả dụng phụ thuộc quyền và cơ sở được phân công. Dùng tài khoản seed để xem giao diện; dữ liệu demo không đại diện lịch khám đang được cơ sở thật tiếp nhận.

## 6. Giới hạn cần nhớ

- VietQR/hoàn tiền và vận chuyển trong cấu hình portfolio không thực hiện chuyển tiền hoặc gọi hãng vận chuyển thật.
- Tài khoản seed chỉ dành cho Development; không tái sử dụng mật khẩu ở dịch vụ khác.
- Sàng lọc sức khỏe chỉ cung cấp gợi ý, không thay thế khám trực tiếp hay kết luận của nhân viên y tế.
- Quyền truy cập do backend quyết định. Nếu bị từ chối, dùng đúng tài khoản/role và cơ sở được phân công.
