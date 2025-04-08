# Quiz App - Client

Ứng dụng Quiz tương tác được xây dựng bằng React, cho phép người dùng tham gia các bài kiểm tra với hiệu ứng âm thanh đặc biệt.

## Tính năng

- **Giao diện người dùng thân thiện**: Thiết kế đẹp mắt và dễ sử dụng
- **Hiệu ứng âm thanh**: Các bộ lọc âm thanh đặc biệt (Echo, Noise, High Pitch, Low Pitch, Fast Speed, Variable Speed)
- **Hệ thống điểm số**: Theo dõi và hiển thị kết quả của người dùng
- **Bảng xếp hạng**: Xem và so sánh điểm số với người dùng khác
- **Quản lý câu hỏi**: Tạo và quản lý câu hỏi cho các bài kiểm tra

## Yêu cầu hệ thống

- Node.js (v14.0.0 trở lên)
- npm (v6.0.0 trở lên)
- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari)

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/your-username/Quiz_App_Client.git
cd Quiz_App_Client
```

2. Cài đặt các dependencies:
```bash
npm install
```

3. Tạo file môi trường:
Tạo file `.env` trong thư mục gốc với nội dung:
```
REACT_APP_SERVER_HOSTNAME=http://localhost:5000
```

## Chạy ứng dụng

```bash
npm start
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

## Cấu trúc dự án

```
Quiz_App_Client/
├── public/                 # Tệp tĩnh
├── src/                    # Mã nguồn
│   ├── components/         # Các component React
│   │   ├── AudioPlayer.js  # Component phát âm thanh với hiệu ứng
│   │   ├── Dashboard.js    # Trang tổng quan
│   │   ├── Footer.js       # Component chân trang
│   │   ├── Header.js       # Component đầu trang
│   │   ├── Home.js         # Trang chủ
│   │   ├── Login.js        # Trang đăng nhập
│   │   ├── Quiz.js         # Trang kiểm tra
│   │   ├── Register.js     # Trang đăng ký
│   │   └── Result.js       # Trang kết quả
│   ├── helper/             # Các hàm tiện ích
│   │   └── helper.js       # Hàm gọi API và xử lý dữ liệu
│   ├── styles/             # CSS và styles
│   │   └── App.css         # Styles chính
│   ├── App.js              # Component chính
│   └── index.js            # Điểm vào ứng dụng
├── .env                    # Biến môi trường
├── package.json            # Dependencies và scripts
└── README.md               # Tài liệu dự án
```

## Hiệu ứng âm thanh

Ứng dụng sử dụng Web Audio API để tạo các hiệu ứng âm thanh đặc biệt:

- **Normal**: Âm thanh gốc không có hiệu ứng
- **Echo**: Hiệu ứng tiếng vang với độ trễ 0.3 giây và phản hồi 0.2
- **Noise**: Thêm tiếng ồn nhẹ vào âm thanh
- **High Pitch**: Tăng tần số cao để tạo âm thanh sắc nét hơn
- **Low Pitch**: Tăng tần số thấp để tạo âm thanh trầm hơn
- **Fast Speed**: Phát âm thanh nhanh hơn 1.5 lần
- **Variable Speed**: Thay đổi tốc độ phát âm thanh từ 0.8x đến 1.5x

## API Endpoints

Ứng dụng tương tác với server thông qua các API sau:

- `GET /api/questions`: Lấy danh sách câu hỏi
- `GET /api/questions/:id`: Lấy thông tin chi tiết câu hỏi
- `POST /api/result`: Gửi kết quả kiểm tra
- `GET /api/result/:id`: Lấy thông tin kết quả
- `GET /api/leaderboard`: Lấy bảng xếp hạng

## Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request để đóng góp.

## Giấy phép

Dự án này được cấp phép theo [MIT License](LICENSE).
