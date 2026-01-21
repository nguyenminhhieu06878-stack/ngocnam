import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AdminPage() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Chung',
    description: '',
    file: null
  });
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Lỗi tải tài liệu:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', formData.file);
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('description', formData.description);

    try {
      await axios.post('/api/documents/upload', data);
      alert('✅ Upload thành công!');
      setFormData({ title: '', category: 'Chung', description: '', file: null });
      document.getElementById('fileInput').value = '';
      loadDocuments();
    } catch (error) {
      alert('❌ Lỗi upload: ' + error.response?.data?.error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;

    try {
      await axios.delete(`/api/documents/${id}`);
      alert('✅ Xóa thành công!');
      loadDocuments();
    } catch (error) {
      alert('❌ Lỗi xóa tài liệu');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({...formData, file: e.dataTransfer.files[0]});
    }
  };

  const categories = ['Chung', 'Văn bản', 'Hướng dẫn', 'Quy định', 'Thông báo', 'Nghị quyết'];

  const getCategoryColor = (category) => {
    const colors = {
      'Chung': 'bg-gray-100 text-gray-700',
      'Văn bản': 'bg-blue-100 text-blue-700',
      'Hướng dẫn': 'bg-green-100 text-green-700',
      'Quy định': 'bg-purple-100 text-purple-700',
      'Thông báo': 'bg-orange-100 text-orange-700',
      'Nghị quyết': 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1 shadow-md">
                <img src="/logo.png" alt="Logo Đoàn" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Quản lý Tài liệu</h1>
                <p className="text-sm text-red-100">Hệ thống quản lý văn bản Đoàn thanh niên</p>
              </div>
            </div>
            <Link 
              to="/" 
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm border border-white/30 flex items-center space-x-2"
            >
              <span>🤖</span>
              <span>Chatbot</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng tài liệu</p>
                <p className="text-3xl font-bold text-gray-800">{documents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sẵn sàng</p>
                <p className="text-3xl font-bold text-gray-800">
                  {documents.filter(d => d.status === 'ready').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-3xl font-bold text-gray-800">
                  {documents.filter(d => d.status === 'processing').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-2xl">📤</span>
            <h2 className="text-xl font-bold text-gray-800">Upload Tài liệu mới</h2>
          </div>
          
          <form onSubmit={handleUpload} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Nhập tiêu đề tài liệu..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors resize-none"
                rows="3"
                placeholder="Mô tả ngắn gọn về tài liệu..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                File tài liệu <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="fileInput"
                  type="file"
                  onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  required
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <div className="text-5xl mb-3">📄</div>
                  {formData.file ? (
                    <p className="text-green-600 font-medium">{formData.file.name}</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium mb-1">
                        Kéo thả file vào đây hoặc click để chọn
                      </p>
                      <p className="text-sm text-gray-500">
                        Hỗ trợ: PDF, Word (.doc, .docx), Text (.txt)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold text-lg"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Đang upload...
                </span>
              ) : (
                '📤 Upload tài liệu'
              )}
            </button>
          </form>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📚</span>
              <h2 className="text-xl font-bold text-gray-800">Danh sách Tài liệu</h2>
            </div>
            <span className="text-sm text-gray-500">{documents.length} tài liệu</span>
          </div>
          
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc._id} className="group border-2 border-gray-100 hover:border-red-200 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">
                          {doc.fileType === '.pdf' ? '📕' : doc.fileType === '.docx' || doc.fileType === '.doc' ? '📘' : '📄'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">{doc.title}</h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                            {doc.category}
                          </span>
                          <span>•</span>
                          <span>📅 {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}</span>
                          <span>•</span>
                          <span className={`flex items-center ${
                            doc.status === 'ready' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {doc.status === 'ready' ? '✓ Sẵn sàng' : '⏳ Đang xử lý'}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="ml-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium opacity-0 group-hover:opacity-100"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
            
            {documents.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg">Chưa có tài liệu nào</p>
                <p className="text-gray-400 text-sm mt-2">Hãy upload tài liệu đầu tiên của bạn</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
