import express from 'express';
import { processChat } from '../services/chatService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    console.log('📩 Nhận câu hỏi:', message);
    
    if (!message) {
      return res.status(400).json({ error: 'Vui lòng nhập câu hỏi' });
    }

    const response = await processChat(message, conversationHistory);
    console.log('✅ Trả lời thành công');
    res.json(response);
  } catch (error) {
    console.error('❌ Lỗi chat:', error);
    console.error('Stack:', error.stack);
    
    // Trả về thông báo lỗi thân thiện
    const errorMessage = error.message.includes('ECONNREFUSED') 
      ? 'Không thể kết nối đến database. Vui lòng kiểm tra MongoDB và ChromaDB.'
      : error.message.includes('API')
      ? 'Lỗi kết nối AI service. Vui lòng kiểm tra Groq API key.'
      : error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
