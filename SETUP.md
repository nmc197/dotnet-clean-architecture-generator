# Hướng dẫn Cài đặt và Chạy

## 🚀 Cài đặt nhanh

### Bước 1: Cài đặt Node.js
Đảm bảo bạn đã cài đặt Node.js phiên bản 16 trở lên:
```bash
node --version
npm --version
```

### Bước 2: Cài đặt dependencies
```bash
cd dotnet-clean-architecture-generator
npm install
```

### Bước 3: Chạy lệnh đầu tiên
```bash
npm run generate init
```

## 🔧 Khắc phục lỗi thường gặp

### Lỗi: ERR_REQUIRE_ESM
Nếu gặp lỗi này:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module
```

**Giải pháp:**
1. Xóa thư mục node_modules:
```bash
rmdir /s node_modules
del package-lock.json
```

2. Cài đặt lại:
```bash
npm install
```

3. Chạy lại:
```bash
npm run generate init
```

### Lỗi: Module not found
Nếu gặp lỗi module không tìm thấy:
```bash
npm install --force
```

## 📝 Các lệnh cơ bản

### 1. Tạo file config mẫu
```bash
npm run generate init
```

### 2. Chạy interactive mode
```bash
npm run generate interactive
```

### 3. Generate project từ config
```bash
npm run generate -- --config entities.json --output ./my-project
```

### 4. Test generator
```bash
node test-generator.js
```

## 🎯 Ví dụ thực tế

### Tạo project đơn giản:
```bash
# 1. Tạo config
npm run generate init

# 2. Chỉnh sửa entities.json
# 3. Generate project
npm run generate -- --config entities.json --output ./MyShop --project-name MyShop
```

### Sử dụng file mẫu:
```bash
npm run generate -- --config examples/simple-entities.json --output ./TestProject
```

## ⚠️ Lưu ý quan trọng

1. **Đảm bảo thư mục output trống** (sẽ bị ghi đè)
2. **Kiểm tra file config** trước khi chạy
3. **Backup code hiện tại** nếu cần
4. **Chạy test trước** với `node test-generator.js`

## 🆘 Hỗ trợ

Nếu vẫn gặp lỗi:
1. Kiểm tra phiên bản Node.js: `node --version`
2. Xóa cache npm: `npm cache clean --force`
3. Cài đặt lại: `npm install --force`
4. Chạy test: `node test-generator.js`

## 📊 Kết quả mong đợi

Sau khi chạy thành công:
```
✅ Project generated successfully!
📁 Output directory: C:\path\to\generated-project
🏗️  Project name: MyProject
📊 Generated 45 files
📈 Success rate: 100%
```
