# Đặt lịch và quản trị BBONE

## Luồng khách hàng

1. Vào `/dat-lich`, chọn cơ sở và dịch vụ đang hoạt động.
2. Chọn ngày còn chỗ, rồi chọn giờ bắt đầu–kết thúc. Ngày hiện tại có thể hết giờ khám; chọn ngày khác trong danh sách 14 ngày hoặc nhập ngày khác.
3. Đăng nhập, giữ chỗ tạm theo thời hạn backend và kiểm tra thông tin người khám.
4. Xác nhận để tạo lịch hẹn. Chọn lại giờ sẽ trả chỗ giữ tạm; hết hạn phải chọn lại. Backend kiểm tra lại sức chứa, giá, trùng lịch và trạng thái cơ sở.
5. Trong tài khoản, xem lịch hẹn; chỉ đổi/hủy trước hạn do backend quy định. Đổi lịch giữ nguyên cơ sở và dịch vụ.

Tất cả lịch hiển thị theo giờ Việt Nam (UTC+7), API dùng UTC. Không tạo giờ giả ở frontend. Dữ liệu hiện có là cơ sở mô phỏng và các giờ đã được seed; không có cơ sở y tế tiếp nhận thực tế.

## Quản trị

- `/quan-tri/khung-gio`: chọn cơ sở, xem giờ theo ngày, mở giờ cho bác sĩ đã được cấp quyền cơ sở, điều chỉnh sức chứa và đóng giờ không còn lịch ảnh hưởng.
- Lịch làm việc hàng tuần: tạo lịch trước, sau đó sinh khung giờ cho khoảng tối đa 90 ngày. Giờ trùng/đã qua/cơ sở đóng cửa được bỏ qua. Lưu lịch làm việc chưa tự tạo giờ cho khách đặt.
- `/quan-tri/lich-kham`: xem và tiếp đón lịch, ghi chú theo quyền.
- `/quan-tri/dat-tai-quay`: đặt cho bệnh nhân tại quầy.
- `/quan-tri/tra-hang`: duyệt yêu cầu, kiểm hàng thực tế, nhập lại số lượng phù hợp. Hoàn tiền là bước riêng.
- `/quan-tri/kho-hang`: nhập lô và cách ly theo phiên bản; không nhập lô đầu khi còn tồn chưa phân lô.
- `/quan-tri/khuyen-mai`: tạo và bật/tắt mã. Giá trị mã đã công bố giữ nguyên để bảo toàn lịch sử đơn.
- Các trang sản phẩm, cơ sở, dịch vụ, đơn hàng, vận chuyển, hoàn tiền, nội dung, người dùng, báo cáo, nhật ký, tác vụ và cấu hình tiếp tục dùng API cùng phân quyền hiện có.

## Thanh toán

Nút Liên hệ tư vấn ở chi tiết sản phẩm chuyển sang `/lien-he`. Màn thanh toán chia QR và thông tin chuyển khoản/tóm tắt đơn, cho sao chép ngân hàng, tài khoản và nội dung. Nút kiểm tra trạng thái không tự đánh dấu đã trả tiền. VietQR vẫn nhận tiền bằng QR; tài chính đối soát thủ công, không có API xác nhận ngân hàng hoặc chuyển hoàn tự động.

## API bổ sung

- GET `/services/{id}/availability?from&to`: tổng chỗ còn lại theo ngày Việt Nam, tối đa 31 ngày.
- DELETE `/appointments/holds/{id}`: chủ giữ chỗ trả chỗ, gọi lặp không trừ tồn hai lần.
- GET `/appointments/{id}/booking-context`: chủ lịch lấy dịch vụ gốc khi đổi lịch.
- GET `/staff/slots?clinicId&from&to&page&size`: quản lý xem cả giờ đầy/đã đóng theo quyền cơ sở.
- GET `/staff/clinics/{id}/doctors`: chọn bác sĩ bằng tên, không trả thông tin đăng nhập.
- GET `/admin/coupons`, PUT `/admin/coupons/{id}/state`: Commerce/Admin, kiểm tra version khi đổi trạng thái.
