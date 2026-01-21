# TÍNH NĂNG PHÂN LOẠI TÀI LIỆU THEO NGÀY ✅

## Mục đích
Giúp Admin dễ dàng quản lý và theo dõi tài liệu được upload theo từng ngày. Mỗi ngày admin upload tài liệu mới, AI sẽ học dữ liệu của ngày đó. Ngày nào không upload thì giữ nguyên dữ liệu cũ.

## Tính năng đã thêm

### 1. API mới

#### a) Lấy tài liệu theo ngày cụ thể
```
GET /api/documents/by-date/:date
```

**Params**: 
- `date`: Ngày cần lấy (format: YYYY-MM-DD)

**Response**:
```json
[
  {
    "_id": "...",
    "title": "Tài liệu 1",
    "category": "Văn bản",
    "uploadedAt": "2026-01-20T10:30:00.000Z",
    "status": "ready"
  }
]
```

**Ví dụ**:
```bash
curl http://localhost:3001/api/documents/by-date/2026-01-20
```

#### b) Thống kê tài liệu theo ngày
```
GET /api/documents/stats/by-date
```

**Response**:
```json
[
  {
    "_id": "2026-01-20",
    "count": 17,
    "documents": [
      {
        "id": "...",
        "title": "Tài liệu 1",
        "category": "Văn bản",
        "status": "ready"
      }
    ]
  }
]
```

**Đặc điểm**:
- Trả về 30 ngày gần nhất
- Sắp xếp theo ngày giảm dần (mới nhất trước)
- Group theo ngày upload

### 2. Admin UI mới

#### a) Toggle View Mode
Admin có thể chuyển đổi giữa 2 chế độ xem:

**📋 Tất cả**: 
- Hiển thị tất cả tài liệu theo thứ tự mới nhất
- Hiển thị đầy đủ thông tin: ngày, giờ, category, status

**📅 Theo ngày**:
- Nhóm tài liệu theo ngày upload
- Hiển thị số lượng tài liệu mỗi ngày
- Dễ dàng theo dõi hoạt động upload hàng ngày

#### b) Giao diện "Theo ngày"

Mỗi ngày hiển thị:
```
📅 Thứ Hai, 20 tháng 1, 2026
   17 tài liệu được upload

   📕 Tài liệu 1 | Văn bản | 10:30 | ✓ Sẵn sàng
   📘 Tài liệu 2 | Quy định | 11:45 | ⏳ Đang xử lý
   ...
```

### 3. Database Schema

Model `Document` đã có sẵn field:
```javascript
uploadedAt: {
  type: Date,
  default: Date.now
}
```

Không cần thay đổi schema, chỉ thêm query mới.

## Cách sử dụng

### Cho Admin:

1. **Vào Admin Panel** (http://localhost:5174)

2. **Upload tài liệu** như bình thường

3. **Chuyển sang view "Theo ngày"**:
   - Click nút "📅 Theo ngày" ở góc phải
   - Xem tài liệu được nhóm theo ngày

4. **Theo dõi hoạt động**:
   - Xem ngày nào upload bao nhiêu tài liệu
   - Dễ dàng tìm lại tài liệu theo ngày
   - Quản lý dữ liệu học của AI theo ngày

### Cho Developer:

#### Lấy tài liệu của ngày hôm nay:
```javascript
const today = new Date().toISOString().split('T')[0];
const response = await axios.get(`/api/documents/by-date/${today}`);
```

#### Lấy thống kê 30 ngày:
```javascript
const response = await axios.get('/api/documents/stats/by-date');
const stats = response.data;

stats.forEach(day => {
  console.log(`${day._id}: ${day.count} tài liệu`);
});
```

## Lợi ích

### 1. Quản lý dễ dàng
- Biết rõ ngày nào upload tài liệu gì
- Theo dõi tiến độ upload hàng ngày
- Dễ dàng tìm lại tài liệu theo thời gian

### 2. Theo dõi AI learning
- Biết AI học dữ liệu gì vào ngày nào
- Ngày không upload = AI giữ nguyên kiến thức
- Dễ dàng rollback nếu cần (xóa tài liệu của ngày cụ thể)

### 3. Báo cáo và thống kê
- Thống kê số lượng tài liệu theo ngày
- Phân tích xu hướng upload
- Lập báo cáo hoạt động

## Ví dụ thực tế

### Scenario 1: Upload hàng ngày
```
Thứ 2 (20/01): Upload 5 tài liệu về quy định mới
→ AI học 5 tài liệu này

Thứ 3 (21/01): Không upload gì
→ AI giữ nguyên kiến thức

Thứ 4 (22/01): Upload 3 tài liệu về hướng dẫn
→ AI học thêm 3 tài liệu mới
```

### Scenario 2: Tìm lại tài liệu
```
Admin: "Tài liệu nào tôi upload hôm qua?"
→ Chuyển sang view "Theo ngày"
→ Xem ngày hôm qua
→ Thấy danh sách đầy đủ
```

### Scenario 3: Kiểm tra AI learning
```
User: "Sao AI không biết về quy định mới?"
Admin: Kiểm tra view "Theo ngày"
→ Thấy chưa upload quy định đó
→ Upload ngay
→ AI học và trả lời được
```

## Technical Details

### API Implementation
```javascript
// Group documents by date using MongoDB aggregation
const stats = await Document.aggregate([
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" }
      },
      count: { $sum: 1 },
      documents: { 
        $push: {
          id: "$_id",
          title: "$title",
          category: "$category",
          status: "$status"
        }
      }
    }
  },
  { $sort: { _id: -1 } },
  { $limit: 30 }
]);
```

### Frontend State Management
```javascript
const [viewMode, setViewMode] = useState('all'); // 'all' or 'by-date'
const [documentsByDate, setDocumentsByDate] = useState({});

// Load stats on mount
useEffect(() => {
  loadDocumentsByDate();
}, []);
```

## Future Enhancements

Có thể mở rộng thêm:
1. **Filter theo khoảng thời gian**: Chọn từ ngày X đến ngày Y
2. **Export báo cáo**: Xuất thống kê theo ngày ra Excel/PDF
3. **Calendar view**: Hiển thị trên lịch, click vào ngày để xem tài liệu
4. **Notification**: Nhắc nhở admin nếu nhiều ngày không upload
5. **Backup theo ngày**: Tự động backup dữ liệu mỗi ngày

## Kết luận

Tính năng phân loại theo ngày giúp Admin:
- ✅ Quản lý tài liệu dễ dàng hơn
- ✅ Theo dõi AI learning theo thời gian
- ✅ Tìm kiếm và tra cứu nhanh chóng
- ✅ Lập báo cáo và thống kê chính xác

Hệ thống giờ đây có khả năng quản lý tài liệu theo thời gian một cách chuyên nghiệp!
