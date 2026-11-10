# Hướng dẫn đọc và phát triển Bbone-FE

## Chạy dự án

Trong thư mục Bbone-FE, dùng `npm run dev`, mở http://127.0.0.1:5173. Vite chuyển tiếp `/api` và `/media` tới backend localhost:5080. Backend dùng `.\dev.cmd` trong Bbone-BE. Cấu hình API nằm tại `src/shared/config/env.js`; không đặt khoá Resend hay bí mật backend trong biến VITE_.

`npm run check` chạy lint, test và build. Khi sửa Astryx/theme, chạy thêm `npx astryx doctor --built dist`. Không chỉnh module theme sinh tự động; theme BBONE kế thừa neutral trong `src/themes/bbone/bboneTheme.ts`.

## Đọc theo thứ tự này

| Điểm bắt đầu                          | Trách nhiệm                                                    |
| ------------------------------------- | -------------------------------------------------------------- |
| `src/main.jsx`                        | Gắn React, theme và thứ tự CSS layers                          |
| `src/app/router.jsx`                  | Ghép URL, lazy page, layout và kiểm phiên đăng nhập            |
| `src/app/layouts/PublicLayout.jsx`    | Header, menu, giỏ hàng và footer khách hàng                    |
| `src/features/<feature>/pages`        | Ghép các phần của một trang                                    |
| `src/features/<feature>/components`   | Hiển thị/form nhỏ theo nghiệp vụ                               |
| `src/features/<feature>/hooks`        | Điều phối trạng thái và chuyển bước                            |
| `src/features/<feature>/api`          | Tên endpoint và dạng request của tính năng                     |
| `src/shared/api/create-api-client.js` | HTTP, timeout, lỗi, refresh token và chống phản hồi phiên cũ   |
| `src/shared/hooks/use-resource.js`    | GET: loading, error, retry, abort khi đổi trang/bộ lọc         |
| `src/shared/hooks/use-command.js`     | Gửi thao tác: chống double click, khoá idempotency và phản hồi |

Không phải tính năng nào cũng cần đủ thư mục. Chỉ tách khi có một trách nhiệm rõ ràng; không tạo hàng loạt wrapper chuyển tiếp vô nghĩa.

## Ví dụ hoàn chỉnh: kiểm tra triệu chứng

Đọc `ScreeningPage.jsx` trước: trang chỉ chọn thành phần theo bước. Tiếp theo xem `hooks/use-screening.js`: vùng cơ thể, đáp án, bước hiện tại, submit và lưu. `api/screening.api.js` chỉ khai báo các endpoint. Các thành phần `RegionSelection`, `ScreeningQuestions`, `ScreeningResult`, `ScreeningStepper` nhận dữ liệu và callback, không tự quyết định kết quả y tế.

Luồng dữ liệu: người dùng chọn vùng → hook tải definition → API trả câu hỏi/phiên bản/nguồn → form thu câu trả lời → backend kiểm tra và tạo hướng dẫn → người dùng chọn lưu → API ghi hồ sơ theo tài khoản. Câu trả lời không lưu localStorage, không ghép vào URL, không ghi vào console.

Nguồn y tế và logic nằm trong `Bbone-BE/src/Bbone.Application/Care/SymptomCheckService.cs`. Không thêm điểm hoặc ngưỡng chẩn đoán trong JSX. Bộ sàng lọc chuyên môn cũ vẫn có quy trình phê duyệt riêng.

## State: để ở đâu

- Dùng useState cho state chỉ thuộc một trang: câu trả lời, bước, bộ lọc, mở form.
- Dùng Zustand khi nhiều vùng UI cần cùng dữ liệu: phiên đăng nhập, số lượng giỏ hàng, menu.
- Auth token ở bộ nhớ; không lưu vào localStorage.
- Giỏ khách chỉ lưu productId và quantity. Giá/tồn kho lấy lại từ backend.
- Số trên icon giỏ là tổng số đơn vị, gồm giỏ khách và giỏ tài khoản hiện tại. Chỉ xoá giỏ khách sau khi merge thành công.

## Thao tác ghi và quy tắc nghiệp vụ

Dùng useCommand cho thao tác ghi. Khóa idempotency được giữ khi thử lại cùng payload, đổi khi bắt đầu thao tác mới. Gửi version mới nhất với các bản ghi hỗ trợ concurrency. Sau thành công tải lại dữ liệu liên quan; đừng đoán trạng thái thanh toán hay hoàn tiền.

`OrderDetailPage` ghép thông tin đơn, yêu cầu huỷ và hoàn tiền. `OrderPaymentPanel` xử lý từng giao dịch VietQR mô phỏng. Người mua gửi lý do huỷ, người bán duyệt riêng trong AdminOrdersPage. Trạng thái đơn, yêu cầu huỷ, giao hàng và tiền là các thông tin độc lập.

Frontend kiểm tra required/định dạng để người dùng sửa nhanh. Backend kiểm tra lại toàn bộ quyền, lựa chọn, version, tiền, kho và chuyển trạng thái. HTML validation không thay thế backend. Ngày gửi là UTC ISO với Z; hiển thị Việt Nam bằng Intl. Tiền là số nguyên VND.

## Quy ước viết code

Tên diễn tả vai trò: selectedRegion, questionIndex, payment, cancellationReason; tránh các tên một chữ trong logic nghiệp vụ mới. Một biến/khai báo khi điều đó giúp đọc nhanh. Giữ page làm thành phần ghép; tách API, điều phối và phần UI phức tạp. Viết comment cho lý do hoặc điều kiện nghiệp vụ, không diễn giải lại từng dòng JSX.

Dùng Astryx VStack/HStack/Button/IconButton và token theme. Icon-only phải có label và tooltip. Form có label/legend; thông báo lỗi dùng role alert, trạng thái dùng role status. Kiểm tra màn hình nhỏ và keyboard. Không đặt mã màu, CSS inline hoặc ngưỡng y tế trực tiếp vào trang.

## Phạm vi xác minh

Đối chiếu `UI-COVERAGE.md` và backend `docs/REVIEW-2026-11-10.md` để biết màn hình/API và giới hạn hiện hành. Kiểm thử tự động không thay thế UAT, kiểm tải hoặc phê duyệt y khoa. VietQR/giao hàng hiện mô phỏng; không dùng để thu tiền hoặc tạo vận đơn thật.
