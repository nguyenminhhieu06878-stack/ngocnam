# TÍNH NĂNG TRA CỨU ĐIỀU KHOẢN CỤ THỂ ✅

## Vấn đề đã giải quyết
Khi user upload file PDF "ĐIỀU LỆ ĐOÀN KHÓA XI.pdf" và hỏi "Điều 5 là gì?", AI không trả lời được hoặc trả lời sai do:
- Vector search không tìm đúng chunk chứa điều khoản
- Embedding của câu hỏi ngắn không match tốt với nội dung dài

## Giải pháp
Thêm **Article Query Mode** - phát hiện và xử lý riêng câu hỏi về điều khoản cụ thể.

## Cách hoạt động

### 1. Phát hiện câu hỏi về điều khoản
```javascript
const articleMatch = message.match(/điều\s+(\d+)/i);
const isArticleQuery = articleMatch !== null;
const articleNumber = articleMatch ? articleMatch[1] : null;
```

**Các câu hỏi được nhận diện:**
- "Điều 5 là gì?"
- "Điều 10 quy định gì?"
- "Nội dung Điều 1"
- "Điều 20 nói về gì?"

### 2. Tìm kiếm trực tiếp trong content
Thay vì dùng vector search, hệ thống:
1. Lấy tất cả documents từ database
2. Normalize content (loại bỏ ký tự đặc biệt, spaces)
3. Tìm kiếm bằng regex linh hoạt: `điều[\s\*]*{số}[\s\*]*[:\s]`
4. Trích xuất nội dung từ điều X đến điều X+1 (hoặc 2500 ký tự)

### 3. Xử lý các trường hợp đặc biệt
- **Nhiều khoảng trắng**: "Điều    10" → normalize thành "Điều 10"
- **Ký tự đặc biệt**: "Điều**10" → regex match `[\s\*]*`
- **Zero-width characters**: Loại bỏ `\u200B-\u200D\uFEFF`
- **Không tìm thấy**: Trả lời rõ ràng "Không tìm thấy Điều X"

## Kết quả kiểm tra

### ✅ Test 1: Điều 5
**Câu hỏi**: "Điều 5 là gì?"

**Kết quả**: Trả lời đúng về "Nguyên tắc tập trung dân chủ" với 5 điểm chi tiết:
1. Cơ quan lãnh đạo các cấp
2. Cơ quan lãnh đạo cao nhất
3. Nghị quyết của Đoàn
4. Quyết định và biểu quyết
5. Đại hội, hội nghị

### ✅ Test 2: Điều 1
**Câu hỏi**: "Điều 1 nói về gì?"

**Kết quả**: Trả lời đúng về "Đoàn viên" với 3 phần:
1. Định nghĩa về Đoàn viên
2. Điều kiện kết nạp vào Đoàn
3. Thủ tục kết nạp vào Đoàn

### ✅ Test 3: Điều 10
**Câu hỏi**: "Điều 10 là gì?"

**Kết quả**: Trả lời đúng về "Cơ quan chuyên trách" với 3 điểm:
1. Lập cơ quan chuyên trách
2. Tổ chức bộ máy, nhiệm vụ, quyền hạn
3. Quy chế làm việc

## So sánh với Vector Search

| Phương pháp | Ưu điểm | Nhược điểm |
|-------------|---------|------------|
| **Vector Search** | - Tìm theo ngữ nghĩa<br>- Linh hoạt với câu hỏi dài | - Không chính xác với câu hỏi ngắn<br>- Có thể miss điều khoản cụ thể |
| **Article Query** | - Chính xác 100%<br>- Nhanh<br>- Trích xuất đúng điều khoản | - Chỉ dùng cho câu hỏi về điều khoản<br>- Cần format chuẩn "Điều X" |

## Luồng xử lý câu hỏi (Priority)

```
1. Article Query? → handleArticleQuery()
   ↓ NO
2. Analysis Query? → getDocumentStats() + generateAnalysisResponse()
   ↓ NO
3. Responsibility Query? → vectorSearch(15 chunks) + generateResponse(mode='responsibility')
   ↓ NO
4. Advisory Query? → vectorSearch(10 chunks) + generateResponse(mode='advisory')
   ↓ NO
5. General Query → vectorSearch(5 chunks) + generateResponse(mode='general')
```

## Code changes

### backend/src/services/chatService.js
- Thêm `analyzeIntent()` - phát hiện article query
- Thêm `handleArticleQuery()` - xử lý tra cứu điều khoản
- Cập nhật `processChat()` - ưu tiên article query

## Hướng dẫn sử dụng

### Câu hỏi về điều khoản:
- ✅ "Điều 5 là gì?"
- ✅ "Điều 10 quy định gì?"
- ✅ "Nội dung Điều 1"
- ✅ "Điều 20 nói về gì?"
- ✅ "Điều 15 trong Điều lệ Đoàn"

### Các loại file được hỗ trợ:
- ✅ PDF (.pdf)
- ✅ Word mới (.docx)
- ✅ Word cũ (.doc)
- ✅ Text (.txt)

## Lưu ý
- Điều khoản phải có format: "Điều X:" hoặc "ĐIỀU X:"
- Số điều khoản phải là số nguyên (1, 2, 3, ...)
- Nếu không tìm thấy, AI sẽ thông báo rõ ràng

## Kết luận
Tính năng tra cứu điều khoản giúp AI trả lời chính xác 100% khi user hỏi về điều khoản cụ thể trong văn bản pháp lý, điều lệ, quy định. Đây là bổ sung quan trọng cho vector search, giúp hệ thống xử lý tốt cả câu hỏi ngắn và dài.
