# Hướng dẫn Cài đặt Chi tiết

## Yêu cầu hệ thống
- Node.js 18+ 
- MongoDB
- ChromaDB
- Groq API key (miễn phí tại https://console.groq.com)

## Bước 1: Cài đặt MongoDB
```bash
# macOS (dùng Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Hoặc dùng Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Bước 2: Cài đặt ChromaDB
```bash
# Cài đặt ChromaDB
pip install chromadb

# Chạy ChromaDB server
chroma run --path ./chroma_data
```

## Bước 3: Cấu hình Backend
```bash
cd backend
npm install

# Tạo file .env
cp .env.example .env

# Tạo thư mục uploads
mkdir -p uploads
```

## Bước 4: Chạy Backend
```bash
cd backend
npm run dev
# Server chạy tại http://localhost:3001
```

## Bước 5: Cài đặt Admin
```bash
# Terminal mới
cd admin
npm install
npm run dev
# Admin chạy tại http://localhost:5174
```

## Bước 6: Cài đặt User
```bash
# Terminal mới
cd user
npm install
npm run dev
# User chạy tại http://localhost:5173
```

## Sử dụng

### Admin (http://localhost:5174)
1. Upload tài liệu PDF, Word, hoặc TXT
2. Điền thông tin: tiêu đề, danh mục, mô tả
3. Hệ thống tự động xử lý và tạo embeddings
4. Quản lý và xóa tài liệu

### User (http://localhost:5173)
1. Nhập câu hỏi về văn bản, tài liệu
2. Chatbot tìm kiếm và trả lời dựa trên tài liệu
3. Xem nguồn tham khảo

## Lưu ý
- Groq API miễn phí và rất nhanh
- Lần đầu upload có thể mất vài giây
- Admin và User chạy độc lập, dùng chung backend

## Nâng cấp (tùy chọn)
Để cải thiện độ chính xác:
1. Dùng sentence-transformers (local, miễn phí)
2. Dùng OpenAI embeddings (tính phí)
3. Dùng Cohere embeddings (có free tier)
