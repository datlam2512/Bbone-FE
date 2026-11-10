# Upload ảnh danh mục

## Dùng trong admin
Vào Sản phẩm, Phòng khám hoặc Nội dung → Thêm mới/Chỉnh sửa → Tải ảnh lên/Thay ảnh → chọn tệp → chờ xem trước → Lưu thay đổi.

- JPG, PNG hoặc WebP, tối đa 5 MB; tối đa 8192 pixel mỗi chiều và 20 megapixel.
- Ảnh hợp lệ được giải mã, chuẩn hóa hướng EXIF, bỏ metadata, giảm cạnh dài còn tối đa 2560 pixel và xuất WebP.
- Upload chưa tự sửa bản ghi. Đóng biểu mẫu trước khi lưu giữ nguyên ảnh đang dùng; tệp đã tải có thể vẫn tồn tại nhưng chưa được gắn vào bản ghi.
- Ảnh là tài nguyên công khai. Không tải hồ sơ sức khỏe hay giấy tờ riêng tư ở đây. Chức năng bằng chứng riêng tư vẫn dùng luồng riêng.
- Bài viết đã công bố: thay ảnh tạo bản sửa theo quy trình duyệt hiện có; không tự thay ảnh đang công khai.
- Thay ảnh cơ sở cập nhật ảnh đầu trong ClinicProfile và giữ nguyên các ảnh gallery còn lại, giới thiệu, tiện ích, giờ mở cửa và chính sách. Clinic/profile version đều được kiểm tra khi lưu.

## API và lưu trữ
- POST `/api/v1/admin/media/products|clinics|articles`, multipart/form-data với một trường `file`.
- Response: `{url,width,height,size,contentType}`. Gán URL trả về vào imageUrl/coverImageUrl khi lưu danh mục.
- GET `/media/uploads/{id}.webp`: nội dung WebP đã được xử lý, tên ngẫu nhiên, không dùng tên tệp từ trình duyệt.
- Quyền: products = Admin/Commerce; clinics = Admin; articles = Admin/Editor/Doctor.
- Mặc định tệp lưu tại `src/Bbone.Api/.data/public-media`; có thể cấu hình `PublicMedia:Root`.
- PostgreSQL lưu đường dẫn ảnh trong Product/Article/ClinicProfile; không lưu binary ảnh vào database. Không cần migration mới.
- scripts/backup.ps1 đã sao lưu thêm thư mục public-media mặc định. Khi dùng root khác hoặc nhiều instance, phải dùng storage chung và đưa root đó vào quy trình backup/restore.
- Production reverse proxy cần chuyển tiếp `/media/` đến backend, hoặc cấu hình VITE_MEDIA_BASE_URL phù hợp. Vite dev đã có proxy này.

## Kiểm tra 10/11/2026
- 138/138 test backend trên PostgreSQL; có kiểm tra MIME giả, SVG, dữ liệu hỏng, dung lượng, quyền upload, lưu ảnh sản phẩm/bài viết và bảo toàn hồ sơ cơ sở/concurrency.
- 15/15 test frontend; lint/build thành công. Astryx doctor 0 fail, 3 cảnh báo môi trường có sẵn.
- Đã upload, lưu và mở lại ảnh sản phẩm DEMO-DRAFT qua giao diện. Nội dung sản phẩm và trạng thái công khai không đổi.

## Thư viện
Ảnh được xử lý bằng SkiaSharp 3.119.4 và native assets tương ứng:
https://learn.microsoft.com/en-us/dotnet/api/skiasharp.skcodec
https://mono.github.io/SkiaSharp/docs/releases/3.119.4.html
