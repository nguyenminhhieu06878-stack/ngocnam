import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [documents, setDocuments] = useState([]);
  const [documentsByDate, setDocumentsByDate] = useState({});
  const [viewMode, setViewMode] = useState('all'); // 'all' hoặc 'by-date'
  const [selectedDocument, setSelectedDocument] = useState(null); // Document đang xem
  const [showDetailModal, setShowDetailModal] = useState(false); // Hiển thị modal
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
    loadDocumentsByDate();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Lỗi tải tài liệu:', error);
    }
  };

  const loadDocumentsByDate = async () => {
    try {
      const response = await axios.get('/api/documents/stats/by-date');
      // Chuyển đổi array thành object với key là ngày
      const byDate = {};
      response.data.forEach(item => {
        byDate[item._id] = {
          count: item.count,
          documents: item.documents
        };
      });
      setDocumentsByDate(byDate);
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
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
      loadDocumentsByDate(); // Reload stats
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
      loadDocumentsByDate(); // Reload stats
    } catch (error) {
      alert('❌ Lỗi xóa tài liệu');
    }
  };

  const handleViewDetail = (doc) => {
    alert('Click vào: ' + doc.title); // Test alert
    console.log('Click vào tài liệu:', doc.title);
    console.log('Document data:', doc);
    setSelectedDocument(doc);
    setShowDetailModal(true);
    console.log('Modal should show now');
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDocument(null);
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
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #caf0f8, #ade8f4, #e0f2fe)'}}>
      {/* Header */}
      <header className="text-white shadow-xl relative overflow-hidden" style={{background: 'linear-gradient(to right, #075985, #0369a1, #0284c7)'}}>
        <div className="absolute inset-0" style={{background: 'linear-gradient(to bottom right, rgba(12, 74, 110, 0.3), transparent, rgba(14, 165, 233, 0.2)'}}></div>
        <div className="max-w-7xl mx-auto px-4 py-5 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 shadow-lg ring-4 ring-white/30">
                <img src="/logo-doan.png" alt="Logo Đoàn" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold drop-shadow-md">Admin - Quản lý Tài liệu</h1>
                <p className="text-sm drop-shadow" style={{color: '#e0f2fe'}}>Hệ thống quản lý văn bản Đoàn thanh niên</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{background: 'linear-gradient(to right, #0284c7, #0ea5e9, #0284c7)'}}></div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-shadow" style={{borderColor: '#0284c7'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Tổng tài liệu</p>
                <p className="text-4xl font-bold" style={{background: 'linear-gradient(to right, #075985, #0369a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>{documents.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(to bottom right, #0ea5e9, #0369a1)'}}>
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Sẵn sàng</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {documents.filter(d => d.status === 'ready').length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-shadow" style={{borderColor: '#38bdf8'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Đang xử lý</p>
                <p className="text-4xl font-bold" style={{background: 'linear-gradient(to right, #0284c7, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                  {documents.filter(d => d.status === 'processing').length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(to bottom right, #38bdf8, #0ea5e9)'}}>
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-xl p-7 mb-6 border-2 relative overflow-hidden" style={{borderColor: '#bae6fd'}}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{background: 'linear-gradient(to right, #0284c7, #38bdf8, #0ea5e9, #0284c7)'}}></div>
          <div className="flex items-center space-x-3 mb-6 mt-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{background: 'linear-gradient(to bottom right, #0ea5e9, #0369a1)'}}>
              <span className="text-xl">📤</span>
            </div>
            <h2 className="text-2xl font-bold" style={{background: 'linear-gradient(to right, #075985, #0369a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Upload Tài liệu mới</h2>
          </div>
          
          <form onSubmit={handleUpload} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{color: '#075985'}}>
                  Tiêu đề <span style={{color: '#0ea5e9'}}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{borderColor: '#bae6fd'}}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#bae6fd';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Nhập tiêu đề tài liệu..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{color: '#075985'}}>
                  Danh mục <span style={{color: '#0ea5e9'}}>*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{borderColor: '#bae6fd'}}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#bae6fd';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{color: '#075985'}}>Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                style={{borderColor: '#bae6fd'}}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0284c7';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#bae6fd';
                  e.target.style.boxShadow = 'none';
                }}
                rows="3"
                placeholder="Mô tả ngắn gọn về tài liệu..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{color: '#075985'}}>
                File tài liệu <span style={{color: '#0ea5e9'}}>*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all`}
                style={{
                  borderColor: dragActive ? '#0284c7' : '#bae6fd',
                  background: dragActive ? '#e0f2fe' : '#f0f9ff'
                }}
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
                    <p className="text-green-600 font-semibold text-lg">✓ {formData.file.name}</p>
                  ) : (
                    <>
                      <p className="font-semibold mb-1" style={{color: '#075985'}}>
                        Kéo thả file vào đây hoặc click để chọn
                      </p>
                      <p className="text-sm" style={{color: '#0369a1'}}>
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
              className="w-full text-white py-4 rounded-xl disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-bold text-lg hover:scale-[1.02]"
              style={{
                background: uploading ? '#cbd5e1' : 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)'
              }}
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
        <div className="bg-white rounded-2xl shadow-xl p-7 border-2 relative overflow-hidden" style={{borderColor: '#bae6fd'}}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{background: 'linear-gradient(to right, #0284c7, #38bdf8, #0ea5e9, #0284c7)'}}></div>
          <div className="flex items-center justify-between mb-6 mt-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{background: 'linear-gradient(to bottom right, #0ea5e9, #0369a1)'}}>
                <span className="text-xl">📚</span>
              </div>
              <h2 className="text-2xl font-bold" style={{background: 'linear-gradient(to right, #075985, #0369a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Danh sách Tài liệu</h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{color: '#0369a1', background: '#e0f2fe'}}>{documents.length} tài liệu</span>
              
              {/* View Mode Toggle */}
              <div className="flex rounded-lg overflow-hidden shadow-md border-2" style={{borderColor: '#bae6fd'}}>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-4 py-2 text-sm font-semibold transition-all ${
                    viewMode === 'all' 
                      ? 'text-white' 
                      : 'text-gray-600 bg-white hover:bg-gray-50'
                  }`}
                  style={viewMode === 'all' ? {background: 'linear-gradient(to right, #0369a1, #0284c7)'} : {}}
                >
                  📋 Tất cả
                </button>
                <button
                  onClick={() => setViewMode('by-date')}
                  className={`px-4 py-2 text-sm font-semibold transition-all ${
                    viewMode === 'by-date' 
                      ? 'text-white' 
                      : 'text-gray-600 bg-white hover:bg-gray-50'
                  }`}
                  style={viewMode === 'by-date' ? {background: 'linear-gradient(to right, #0369a1, #0284c7)'} : {}}
                >
                  📅 Theo ngày
                </button>
              </div>
            </div>
          </div>
          
          {/* View All Mode */}
          {viewMode === 'all' && (
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc._id} className="group border-2 rounded-xl p-5 transition-all hover:shadow-lg" style={{borderColor: '#bae6fd', background: 'linear-gradient(to bottom right, white, #f0f9ff)'}}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{background: 'linear-gradient(to bottom right, #e0f2fe, #bae6fd)'}}>
                          <span className="text-2xl">
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
                            <span>🕐 {new Date(doc.uploadedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</span>
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(doc);
                        }}
                        className="px-5 py-2 text-white rounded-xl transition-all font-semibold shadow-md hover:shadow-lg hover:scale-105"
                        style={{background: 'linear-gradient(to right, #0369a1, #0284c7)'}}
                      >
                        👁️ Xem
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc._id);
                        }}
                        className="px-5 py-2 text-white rounded-xl transition-all font-semibold shadow-md hover:shadow-lg hover:scale-105"
                        style={{background: 'linear-gradient(to right, #dc2626, #ef4444)'}}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
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
          )}

          {/* View By Date Mode */}
          {viewMode === 'by-date' && (
            <div className="space-y-6">
              {Object.keys(documentsByDate).length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500 text-lg">Chưa có tài liệu nào</p>
                </div>
              ) : (
                Object.keys(documentsByDate).sort((a, b) => b.localeCompare(a)).map(date => (
                  <div key={date} className="border-2 rounded-xl p-5" style={{borderColor: '#bae6fd', background: 'linear-gradient(to bottom right, white, #f0f9ff)'}}>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b-2" style={{borderColor: '#e0f2fe'}}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{background: 'linear-gradient(to bottom right, #0ea5e9, #0369a1)'}}>
                          <span className="text-lg">📅</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg" style={{color: '#075985'}}>
                            {new Date(date).toLocaleDateString('vi-VN', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h3>
                          <p className="text-sm" style={{color: '#0369a1'}}>
                            {documentsByDate[date].count} tài liệu được upload
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {documents
                        .filter(doc => new Date(doc.uploadedAt).toISOString().split('T')[0] === date)
                        .map(doc => (
                          <div key={doc._id} className="group border-2 rounded-lg p-4 transition-all hover:shadow-md bg-white" style={{borderColor: '#e0f2fe'}}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" style={{background: '#f0f9ff'}}>
                                    <span className="text-xl">
                                      {doc.fileType === '.pdf' ? '📕' : doc.fileType === '.docx' || doc.fileType === '.doc' ? '📘' : '📄'}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">{doc.title}</h4>
                                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                                      <span className={`px-2 py-0.5 rounded-full font-medium ${getCategoryColor(doc.category)}`}>
                                        {doc.category}
                                      </span>
                                      <span>•</span>
                                      <span>🕐 {new Date(doc.uploadedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</span>
                                      <span>•</span>
                                      <span className={doc.status === 'ready' ? 'text-green-600' : 'text-yellow-600'}>
                                        {doc.status === 'ready' ? '✓ Sẵn sàng' : '⏳ Đang xử lý'}
                                      </span>
                                    </div>
                                    {doc.description && (
                                      <p className="text-xs text-gray-600 mt-2">{doc.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetail(doc);
                                  }}
                                  className="px-4 py-1.5 text-white text-sm rounded-lg transition-all font-semibold shadow-sm hover:shadow-md hover:scale-105"
                                  style={{background: 'linear-gradient(to right, #0369a1, #0284c7)'}}
                                >
                                  👁️ Xem
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(doc._id);
                                  }}
                                  className="px-4 py-1.5 text-white text-sm rounded-lg transition-all font-semibold shadow-sm hover:shadow-md hover:scale-105"
                                  style={{background: 'linear-gradient(to right, #dc2626, #ef4444)'}}
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Chi tiết Tài liệu */}
      {showDetailModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeDetailModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="text-white p-6 relative overflow-hidden" style={{background: 'linear-gradient(to right, #075985, #0369a1, #0284c7)'}}>
              <div className="absolute inset-0" style={{background: 'linear-gradient(to bottom right, rgba(12, 74, 110, 0.3), transparent)'}}></div>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">
                        {selectedDocument.fileType === '.pdf' ? '📕' : selectedDocument.fileType === '.docx' || selectedDocument.fileType === '.doc' ? '📘' : '📄'}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold drop-shadow-md">{selectedDocument.title}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedDocument.category)}`}>
                          {selectedDocument.category}
                        </span>
                        <span className="text-sm" style={{color: '#e0f2fe'}}>
                          📅 {new Date(selectedDocument.uploadedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedDocument.description && (
                    <p className="text-sm mt-2" style={{color: '#e0f2fe'}}>{selectedDocument.description}</p>
                  )}
                </div>
                <button
                  onClick={closeDetailModal}
                  className="ml-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl flex items-center justify-center transition-all"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{color: '#075985'}}>📄 Nội dung văn bản</h3>
                <span className="text-sm text-gray-500">
                  {selectedDocument.content ? `${selectedDocument.content.length.toLocaleString()} ký tự` : 'Đang xử lý...'}
                </span>
              </div>
              
              {selectedDocument.status === 'ready' && selectedDocument.content ? (
                <div className="bg-gray-50 rounded-xl p-6 border-2" style={{borderColor: '#e0f2fe'}}>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {selectedDocument.content}
                  </pre>
                </div>
              ) : selectedDocument.status === 'processing' ? (
                <div className="text-center py-16">
                  <div className="inline-block w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Đang xử lý tài liệu...</p>
                  <p className="text-sm text-gray-400 mt-2">Vui lòng đợi trong giây lát</p>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="text-gray-600">Không thể hiển thị nội dung</p>
                  <p className="text-sm text-gray-400 mt-2">Tài liệu có thể đang bị lỗi</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t-2 p-4 flex justify-end space-x-3" style={{borderColor: '#e0f2fe'}}>
              <button
                onClick={closeDetailModal}
                className="px-6 py-2 rounded-xl font-semibold transition-all hover:scale-105"
                style={{background: 'linear-gradient(to right, #0369a1, #0284c7)', color: 'white'}}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
