===============================================
AUTO GENERATE PROJECT SCRIPT
===============================================

📋 MÔ TẢ:
Script tự động thực hiện tất cả các bước generate project .NET Clean Architecture từ file SQL.

🚀 CÁCH SỬ DỤNG:

1. CHUẨN BỊ:
   - File SQL chứa CREATE TABLE statements
   - Node.js đã được cài đặt
   - Generator đã được setup (npm install)

2. CHẠY SCRIPT:
   node auto-generate-project.js <project-name> <sql-file-path>

3. VÍ DỤ:
   node auto-generate-project.js MyProject ./my-schema.sql
   node auto-generate-project.js DionB05 ./examples/b05.sql

📋 CÁC BƯỚC TỰ ĐỘNG:

1. Parse SQL sang JSON
   - Đọc file SQL
   - Tạo file JSON config
   - Validate format

2. Xóa project cũ (nếu có)
   - Kiểm tra project cũ
   - Xóa hoàn toàn

3. Generate project
   - Chạy generator
   - Tạo tất cả layers
   - Generate entities

4. Setup wwwroot assets
   - Copy CSS, JS, media, plugins
   - Giữ nguyên cấu trúc

5. Dọn dẹp pages folder
   - Chỉ giữ entity folders
   - Xóa example folders

6. Thống kê kết quả
   - Đếm files
   - Hiển thị summary

✅ KẾT QUẢ:
- Project hoàn chỉnh với 7 layers
- WebAdmin interface đầy đủ
- JavaScript structure tối ưu
- 2000+ files trong wwwroot
- Sẵn sàng build và chạy

📖 XEM THÊM:
- HUONG_DAN_GENERATE_PROJECT.txt: Hướng dẫn chi tiết
- README.md: Tài liệu chính

===============================================
Tác giả: .NET Clean Architecture Generator
Ngày tạo: 08/10/2025 10:37:07
===============================================
