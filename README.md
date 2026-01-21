# Hệ thống Chatbot AI cho Đoàn Thanh Niên

## Mô tả
Hệ thống gồm 2 ứng dụng riêng biệt:
- **Admin**: Quản lý và upload tài liệu
- **User**: Chatbot AI hỗ trợ tra cứu văn bản

## Cấu trúc dự án
```
├── backend/          # API server (port 3001)
├── admin/            # Admin frontend (port 5174)
├── user/             # User frontend (port 5173)
└── README.md
```

## Công nghệ
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Database: MongoDB
- Vector DB: ChromaDB
- AI: Groq API (Llama 3.3 70B)

## Cài đặt nhanh

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2. Admin (port 5174)
```bash
cd admin
npm install
npm run dev
```

### 3. User (port 5173)
```bash
cd user
npm install
npm run dev
```

## Truy cập
- **User (Chatbot)**: http://localhost:5173
- **Admin (Quản lý)**: http://localhost:5174
- **Backend API**: http://localhost:3001

## Tính năng

### Admin
- 📤 Upload tài liệu (PDF, Word, TXT)
- 📊 Thống kê tài liệu
- 🗑️ Xóa tài liệu
- 📋 Quản lý danh mục

### User
- 💬 Chat với AI
- 🔍 Tìm kiếm thông tin trong tài liệu
- 📚 Hiển thị nguồn tham khảo
- 💡 Câu hỏi gợi ý

## Yêu cầu hệ thống
- Node.js 18+
- MongoDB
- ChromaDB
- Groq API key (miễn phí)

Chi tiết cài đặt xem file `HUONG_DAN_CAI_DAT.md`
