import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: input,
        conversationHistory: messages
      });

      const botMessage = {
        role: 'assistant',
        content: response.data.message,
        sources: response.data.sources
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Lỗi:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Quy định về hoạt động Đoàn thanh niên',
    'Hướng dẫn tổ chức sự kiện',
    'Thủ tục kết nạp đoàn viên mới',
    'Văn bản về công tác thanh niên'
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1 shadow-md">
                <img src="/logo.png" alt="Logo Đoàn" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Trợ lý AI Đoàn Thanh Niên</h1>
                <p className="text-sm text-red-100">Hỗ trợ tra cứu văn bản, tài liệu 24/7</p>
              </div>
            </div>
            <Link 
              to="/admin" 
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm border border-white/30"
            >
              ⚙️ Quản lý
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden max-w-6xl w-full mx-auto flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-12 space-y-6">
              <div className="inline-block p-4 bg-white rounded-full shadow-lg">
                <span className="text-5xl">🤖</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Xin chào! 👋</h2>
                <p className="text-gray-600 mb-6">
                  Tôi có thể giúp bạn tra cứu và hướng dẫn về các văn bản, tài liệu của Đoàn thanh niên.
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <p className="text-sm text-gray-500 mb-3 font-medium">Câu hỏi gợi ý:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(q)}
                      className="p-3 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-lg text-left text-sm transition-all shadow-sm hover:shadow"
                    >
                      <span className="text-red-600 mr-2">💡</span>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`flex items-start space-x-2 max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-red-600' : 'bg-white border-2 border-red-200'
                }`}>
                  <span className="text-sm">{msg.role === 'user' ? '👤' : '🤖'}</span>
                </div>
                <div className={`rounded-2xl px-4 py-3 shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-red-600 to-red-700 text-white' 
                    : 'bg-white border border-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📚</span> Nguồn tham khảo:
                      </p>
                      <div className="space-y-1">
                        {msg.sources.map((src, i) => (
                          <div key={i} className="text-xs text-gray-600 flex items-start">
                            <span className="text-red-500 mr-1">•</span>
                            <span>{src.title} <span className="text-gray-400">({src.category})</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-red-200 flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white/80 backdrop-blur-sm shadow-lg">
          <div className="max-w-4xl mx-auto p-4">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium"
              >
                {loading ? '⏳' : '📤'} Gửi
              </button>
            </form>
            <p className="text-xs text-gray-500 text-center mt-2">
              Powered by AI • Dữ liệu được cập nhật liên tục
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
