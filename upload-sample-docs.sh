#!/bin/bash

echo "📚 Đang upload tài liệu mẫu vào hệ thống..."
echo ""

API_URL="http://localhost:3001/api/documents/upload"

# Tài liệu 1: Nhiệm vụ Ban Chấp hành
echo "1️⃣ Upload: Nhiệm vụ Ban Chấp hành..."
curl -X POST $API_URL \
  -F "file=@backend/uploads/sample-nhiem-vu-ban-chap-hanh.txt" \
  -F "title=Nhiệm vụ và trách nhiệm của Ban Chấp hành Đoàn" \
  -F "category=Quy định" \
  -F "description=Quy định về nhiệm vụ, trách nhiệm, quyền hạn của Ban Chấp hành Đoàn các cấp"
echo ""
echo ""

# Tài liệu 2: Nhiệm vụ Chi đoàn
echo "2️⃣ Upload: Nhiệm vụ Chi đoàn cơ sở..."
curl -X POST $API_URL \
  -F "file=@backend/uploads/sample-nhiem-vu-chi-doan.txt" \
  -F "title=Nhiệm vụ và trách nhiệm của Chi đoàn cơ sở" \
  -F "category=Quy định" \
  -F "description=Quy định về vai trò, nhiệm vụ, trách nhiệm của Chi đoàn cơ sở"
echo ""
echo ""

# Tài liệu 3: Hướng dẫn tổ chức sự kiện
echo "3️⃣ Upload: Hướng dẫn tổ chức sự kiện..."
curl -X POST $API_URL \
  -F "file=@backend/uploads/sample-huong-dan-to-chuc-su-kien.txt" \
  -F "title=Hướng dẫn tổ chức sự kiện Đoàn thanh niên" \
  -F "category=Hướng dẫn" \
  -F "description=Hướng dẫn chi tiết quy trình tổ chức các sự kiện, hoạt động của Đoàn"
echo ""
echo ""

# Tài liệu 4: Ý tưởng hoạt động
echo "4️⃣ Upload: Ý tưởng và phương án hoạt động..."
curl -X POST $API_URL \
  -F "file=@backend/uploads/sample-y-tuong-hoat-dong.txt" \
  -F "title=Ý tưởng và phương án tổ chức hoạt động Đoàn" \
  -F "category=Hướng dẫn" \
  -F "description=Tổng hợp các ý tưởng, lộ trình và phương án tổ chức hoạt động Đoàn hiệu quả"
echo ""
echo ""

echo "✅ Hoàn thành! Đã upload 4 tài liệu mẫu."
echo ""
echo "🎯 Bây giờ bạn có thể:"
echo "   - Truy cập Admin: http://localhost:5174"
echo "   - Truy cập User: http://localhost:5173"
echo "   - Thử chat với AI về các tài liệu vừa upload"
echo ""
echo "💡 Câu hỏi gợi ý:"
echo "   - Nhiệm vụ của Ban Chấp hành là gì?"
echo "   - Đề xuất lộ trình tổ chức chiến dịch tình nguyện"
echo "   - Gợi ý ý tưởng hoạt động thu hút đoàn viên"
echo ""
