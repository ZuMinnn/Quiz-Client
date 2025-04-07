# Quiz App Client

Ứng dụng Quiz với các hiệu ứng âm thanh thú vị.

## Tính năng

- Hệ thống câu hỏi trắc nghiệm
- Hiệu ứng âm thanh đa dạng (Echo, Noise, High Pitch, Low Pitch, Fast Speed, Variable Speed)
- Giao diện người dùng thân thiện
- Hệ thống điểm số và kết quả

## Yêu cầu hệ thống

- Node.js (v14.0.0 trở lên)
- npm (v6.0.0 trở lên)

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd Quiz_App_Client
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env từ file .env.example:
```bash
cp .env.example .env
```

4. Chỉnh sửa file .env theo cấu hình của bạn:
```bash
REACT_APP_SERVER_HOSTNAME=http://localhost:5000
```

5. Khởi động ứng dụng:
```bash
npm start
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000).

## Cấu trúc dự án

```
Quiz_App_Client/
├── public/             # Tệp tĩnh
├── src/                # Mã nguồn
│   ├── components/     # Các component React
│   ├── helper/         # Các hàm tiện ích
│   ├── redux/          # Quản lý state với Redux
│   ├── styles/         # CSS và styles
│   └── ...
├── .env                # Biến môi trường (không được commit)
├── .env.example        # Mẫu biến môi trường
├── .gitignore          # Danh sách file bị bỏ qua khi commit
└── package.json        # Dependencies và scripts
```

## Hiệu ứng âm thanh

Ứng dụng sử dụng Web Audio API để tạo các hiệu ứng âm thanh:

- **Normal**: Âm thanh gốc không có hiệu ứng
- **Echo**: Hiệu ứng tiếng vang
- **Noise**: Thêm nhiễu vào âm thanh
- **High Pitch**: Tăng tần số cao
- **Low Pitch**: Tăng tần số thấp
- **Fast Speed**: Tăng tốc độ phát lên 1.5x
- **Variable Speed**: Thay đổi tốc độ phát liên tục

## Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request.

## Giấy phép

[MIT](LICENSE)
