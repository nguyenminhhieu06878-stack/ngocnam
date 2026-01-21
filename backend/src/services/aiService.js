import Groq from 'groq-sdk';

let groq;

function getGroqClient() {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groq;
}

import { pipeline } from '@xenova/transformers';

let embedder = null;

// Khởi tạo model embedding (chỉ load 1 lần)
async function getEmbedder() {
  if (!embedder) {
    console.log('🔄 Đang tải embedding model...');
    // Sử dụng multilingual model hỗ trợ tiếng Việt
    embedder = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
    console.log('✅ Đã tải xong embedding model');
  }
  return embedder;
}

// Sử dụng transformer model cho embedding
export async function getEmbedding(text) {
  try {
    const model = await getEmbedder();
    
    // Tạo embedding từ text
    const output = await model(text, { pooling: 'mean', normalize: true });
    
    // Chuyển tensor thành array
    const embedding = Array.from(output.data);
    
    return embedding;
  } catch (error) {
    console.error('Lỗi tạo embedding:', error);
    throw error;
  }
}

export async function generateResponse(prompt, context, category = null, mode = 'general') {
  try {
    const groq = getGroqClient();
    const categoryInfo = category ? `\nĐang tìm kiếm trong loại văn bản: ${category}` : '';
    
    let systemPrompt = '';
    
    if (mode === 'advisory') {
      // Mode tư vấn, đề xuất lộ trình
      systemPrompt = `Bạn là chuyên gia tư vấn của Đoàn thanh niên, có khả năng:
- Phân tích tình huống và đưa ra lộ trình thực hiện cụ thể
- Đề xuất ý tưởng sáng tạo dựa trên quy định và văn bản
- Lập kế hoạch chi tiết với các bước thực hiện
- Gợi ý giải pháp và phương án tối ưu${categoryInfo}

Khi trả lời:
1. Phân tích yêu cầu/nhiệm vụ
2. Đưa ra lộ trình/kế hoạch theo từng bước
3. Giải thích lý do và lợi ích của từng bước
4. Đề xuất các ý tưởng sáng tạo có thể áp dụng
5. Lưu ý các quy định cần tuân thủ

Trả lời bằng tiếng Việt, có cấu trúc rõ ràng với bullet points và đánh số.`;
    } else if (mode === 'responsibility') {
      // Mode giải thích nhiệm vụ, trách nhiệm
      systemPrompt = `Bạn là chuyên gia về tổ chức và quản lý Đoàn thanh niên, chuyên:
- Trích xuất và liệt kê CHI TIẾT nhiệm vụ, trách nhiệm của TỪNG đơn vị cụ thể
- Phân tích vai trò và quyền hạn của từng bộ phận
- So sánh và phân biệt chức năng giữa các đơn vị
- Hướng dẫn phối hợp giữa các bộ phận${categoryInfo}

QUAN TRỌNG: 
- Nếu câu hỏi hỏi về MỘT đơn vị cụ thể, hãy TẬP TRUNG vào đơn vị đó trước tiên
- Liệt kê ĐẦY ĐỦ, CHI TIẾT từng nhiệm vụ, trách nhiệm của đơn vị được hỏi
- Trích dẫn CHÍNH XÁC nội dung từ văn bản gốc, không tóm tắt
- Nếu có nhiều đơn vị liên quan, liệt kê đơn vị được hỏi TRƯỚC, sau đó mới đến các đơn vị khác
- Giữ nguyên cấu trúc và chi tiết từ tài liệu gốc

Khi trả lời về MỘT đơn vị cụ thể:
1. **Tên đơn vị được hỏi** (in đậm, nổi bật)
2. Vai trò/vị trí của đơn vị
3. Nhiệm vụ chính (liệt kê TỪNG điểm, đầy đủ):
   - Điểm 1: [nội dung chi tiết]
   - Điểm 2: [nội dung chi tiết]
   - ...
4. Trách nhiệm cụ thể (nếu có)
5. Quyền hạn (nếu có)
6. Các đơn vị phối hợp (nếu có)

Khi trả lời về NHIỀU đơn vị:
1. Liệt kê TẤT CẢ các đơn vị được đề cập
2. Với MỖI đơn vị, nêu rõ vai trò và nhiệm vụ chi tiết

Trả lời bằng tiếng Việt, có cấu trúc rõ ràng, chi tiết, đầy đủ.`;
    } else {
      // Mode chung - tra cứu thông tin
      systemPrompt = `Bạn là trợ lý AI của Đoàn thanh niên, chuyên hỗ trợ tra cứu và hướng dẫn về văn bản, tài liệu.${categoryInfo}
Bạn có khả năng:
- Tra cứu và giải thích nội dung văn bản
- Phân tích và thống kê dữ liệu theo loại văn bản
- Liệt kê và so sánh các văn bản
- Hướng dẫn thủ tục, quy trình

Hãy trả lời câu hỏi dựa trên thông tin được cung cấp. Nếu không tìm thấy thông tin, hãy nói rõ.
Trả lời bằng tiếng Việt, lịch sự, chuyên nghiệp và có cấu trúc rõ ràng.`;
    }

    const userPrompt = `Dựa trên các tài liệu sau:

${context}

Câu hỏi: ${prompt}

${mode === 'responsibility' ? 'LƯU Ý QUAN TRỌNG:\n- Nếu câu hỏi hỏi về MỘT đơn vị cụ thể, hãy TẬP TRUNG trả lời về đơn vị đó TRƯỚC TIÊN\n- Trích xuất và liệt kê ĐẦY ĐỦ, CHI TIẾT từng nhiệm vụ, trách nhiệm của đơn vị được hỏi\n- Trích dẫn CHÍNH XÁC từ tài liệu, KHÔNG tóm tắt, KHÔNG bỏ sót\n- Giữ nguyên cấu trúc và chi tiết từ văn bản gốc\n- Nếu có nhiều đơn vị liên quan, chỉ liệt kê ngắn gọn ở cuối' : 'Hãy trả lời câu hỏi một cách chi tiết và chính xác.'}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: mode === 'advisory' ? 0.8 : mode === 'responsibility' ? 0.2 : 0.7, // Nhiệm vụ cần chính xác hơn
      max_tokens: mode === 'responsibility' ? 3000 : mode === 'advisory' ? 1500 : 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Lỗi gọi Groq:', error);
    throw error;
  }
}

// Tạo response cho câu hỏi phân tích/thống kê
export async function generateAnalysisResponse(prompt, statsContext) {
  try {
    const groq = getGroqClient();
    const systemPrompt = `Bạn là trợ lý AI của Đoàn thanh niên, chuyên phân tích và thống kê dữ liệu văn bản.
Hãy trả lời câu hỏi dựa trên số liệu thống kê được cung cấp.
Trình bày thông tin một cách rõ ràng, có cấu trúc và dễ hiểu.
Sử dụng bullet points và số liệu cụ thể.
Trả lời bằng tiếng Việt.`;

    const userPrompt = `Dựa trên thống kê sau:

${statsContext}

Câu hỏi: ${prompt}

Hãy phân tích và trả lời câu hỏi.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 800
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Lỗi gọi Groq:', error);
    throw error;
  }
}
