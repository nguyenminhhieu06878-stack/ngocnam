import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, 
  Key, 
  Lock, 
  Unlock, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ArrowRightLeft,
  RefreshCw,
  Cpu,
  Fingerprint,
  Activity,
  FileText,
  Clock,
  Trash2,
  Check,
  LogOut,
  User,
  History,
  FileCode,
  Download,
  Upload
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = 'http://localhost:5001/api';

function App() {
  const [activeTab, setActiveTab] = useState('sinh-khoa');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Auth state
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  const checkPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: '' };
    
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const strengths = [
      { label: 'Rất yếu', color: 'bg-red-500' },
      { label: 'Yếu', color: 'bg-orange-500' },
      { label: 'Trung bình', color: 'bg-yellow-500' },
      { label: 'Mạnh', color: 'bg-green-500' },
      { label: 'Rất mạnh', color: 'bg-emerald-500' }
    ];

    const result = score > 0 ? strengths[Math.min(score - 1, 4)] : strengths[0];
    return { score, ...result };
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordStrength(checkPasswordStrength(val));
  };

  // Key state
  const [keys, setKeys] = useState({ p: '', g: '', x: '', y: '' });
  const [keyBits, setKeyBits] = useState(512);
  const [loadingKey, setLoadingKey] = useState(false);

  // Encryption state
  const [message, setMessage] = useState('');
  const [cipherText, setCipherText] = useState({ a: '', b: '' });
  const [encryptError, setEncryptError] = useState('');
  const [encryptSuccess, setEncryptSuccess] = useState(false);

  // Decryption state
  const [inputCipher, setInputCipher] = useState({ a: '', b: '' });
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [decryptSuccess, setDecryptSuccess] = useState(false);

  // File Crypto state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePassword, setFilePassword] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // History state
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Performance stats
  const [perf, setPerf] = useState({ encryptTime: 0, decryptTime: 0 });

  // UI States
  const [copiedId, setCopiedId] = useState(null);

  // Axios Interceptor for Auth
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsLoggedIn(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) setCurrentUser(user);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  }, [token]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Đã sao chép!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
        setToken(res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        toast.success('Đăng nhập thành công!');
      } else {
        await axios.post(`${API_BASE}/auth/register`, { username, password });
        toast.success('Đăng ký thành công! Hãy đăng nhập.');
        setAuthMode('login');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Thao tác thất bại');
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setPassword('');
    setUsername('');
    setPasswordStrength({ score: 0, label: '', color: '' });
  };

  const handleLogout = () => {
    setToken(null);
    setPassword('');
    setUsername('');
    setPasswordStrength({ score: 0, label: '', color: '' });
    toast.success('Đã đăng xuất');
  };

  const generateKeys = async () => {
    setLoadingKey(true);
    try {
      const res = await axios.post(`${API_BASE}/generate-keys`, { bits: keyBits });
      setKeys(res.data);
      toast.success('Đã tạo khóa mới');
    } catch (err) {
      toast.error('Lỗi khi tạo khóa');
    } finally {
      setLoadingKey(false);
    }
  };

  const encryptMessage = async () => {
    setEncryptError('');
    setEncryptSuccess(false);
    const start = performance.now();
    try {
      const res = await axios.post(`${API_BASE}/encrypt`, {
        message,
        p: keys.p,
        g: keys.g,
        y: keys.y
      });
      const end = performance.now();
      setPerf(prev => ({ ...prev, encryptTime: (end - start).toFixed(2) }));
      setCipherText(res.data);
      setEncryptSuccess(true);
      toast.success('Mã hóa tin nhắn thành công');
    } catch (err) {
      setEncryptError(err.response?.data?.error || 'Lỗi mã hóa');
      toast.error('Mã hóa thất bại');
    }
  };

  const decryptMessage = async () => {
    setDecryptSuccess(false);
    const start = performance.now();
    try {
      const res = await axios.post(`${API_BASE}/decrypt`, {
        a: inputCipher.a,
        b: inputCipher.b,
        p: keys.p,
        x: keys.x
      });
      const end = performance.now();
      setPerf(prev => ({ ...prev, decryptTime: (end - start).toFixed(2) }));
      setDecryptedMessage(res.data.message);
      setDecryptSuccess(true);
      toast.success('Giải mã tin nhắn thành công');
    } catch (err) {
      toast.error('Giải mã thất bại');
    }
  };

  const handleFileAction = async (action) => {
    if (!selectedFile || !filePassword) {
      toast.error('Vui lòng chọn file và nhập mật khẩu');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('password', filePassword);

    setIsProcessingFile(true);
    try {
      const res = await axios.post(`${API_BASE}/files/${action}`, formData, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', action === 'encrypt' ? `${selectedFile.name}.enc` : selectedFile.name.replace('.enc', ''));
      document.body.appendChild(link);
      link.click();
      toast.success(`${action === 'encrypt' ? 'Mã hóa' : 'Giải mã'} file thành công`);
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const errorData = JSON.parse(reader.result);
          toast.error(errorData.error || 'Thao tác thất bại');
        };
        reader.readAsText(err.response.data);
      } else {
        toast.error(err.response?.data?.error || 'Thao tác thất bại');
      }
    } finally {
      setIsProcessingFile(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE}/files/history`);
      setHistory(res.data);
    } catch (err) {
      toast.error('Không thể lấy lịch sử');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'lich-su' && isLoggedIn) {
      fetchHistory();
    }
  }, [activeTab, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-brand-500/20 rounded-2xl border border-brand-500/20">
              <Shield className="text-brand-400" size={40} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            {authMode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
          </h2>
          <p className="text-slate-400 text-center text-sm mb-8">
            Chào mừng bạn đến với ElGamal Vault
          </p>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Nhập username..."
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Nhập password..."
                required
              />
              {authMode === 'register' && password && (
                <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Độ mạnh:</span>
                    <span className={`text-[10px] font-bold uppercase ${passwordStrength.color.replace('bg-', 'text-')}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 rounded-full transition-all duration-500 ${
                          level <= passwordStrength.score 
                            ? passwordStrength.color 
                            : 'bg-white/5'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-600/20"
            >
              {authMode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={toggleAuthMode}
              className="text-brand-400 hover:text-brand-300 text-sm font-medium"
            >
              {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 md:p-6 lg:p-8">
      <Toaster position="top-right" />
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 rounded-full blur-[140px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-7xl h-full max-h-[850px] flex flex-col z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-brand-500/20 rounded-xl border border-brand-500/20 shadow-xl">
              <Shield className="text-brand-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">ElGamal Vault</h1>
              <p className="text-slate-500 text-xs font-medium">Secure Encryption System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
              {[
                { id: 'sinh-khoa', label: 'Sinh Khóa', icon: Key },
                { id: 'ma-hoa', label: 'Mã Hóa', icon: Lock },
                { id: 'giai-ma', label: 'Giải Mã', icon: Unlock },
                { id: 'file', label: 'File', icon: FileCode },
                { id: 'lich-su', label: 'Lịch Sử', icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="text-sm font-bold tracking-wide">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-white text-xs font-bold">{currentUser?.username}</p>
                <p className="text-slate-500 text-[10px] uppercase font-black">{currentUser?.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all"
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl flex-1 min-h-0">
          {/* Sidebar Info */}
          <div className="w-full md:w-72 bg-white/[0.02] border-r border-white/10 p-6 flex flex-col gap-6 shrink-0">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">Hệ thống</h3>
              <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className={`w-2.5 h-2.5 rounded-full ${keys.p ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-orange-500 animate-pulse'}`}></div>
                <span className="text-xs font-bold">{keys.p ? 'Đã sẵn sàng' : 'Chờ khởi tạo'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">Thông số Realtime</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-slate-400 bg-white/[0.02] p-2 rounded-lg border border-white/[0.05]">
                  <FileText size={14} className="text-brand-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Người dùng</span>
                    <span className="text-slate-200">{currentUser?.username}</span>
                  </div>
                </div>
                
                {perf.encryptTime > 0 && (
                  <div className="flex items-center gap-3 text-xs text-slate-400 bg-white/[0.02] p-2 rounded-lg border border-white/[0.05]">
                    <Clock size={14} className="text-brand-500" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Xử lý mã hóa</span>
                      <span className="text-slate-200">{perf.encryptTime} ms</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'sinh-khoa' && (
              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-brand-500/10 rounded-3xl border border-brand-500/20">
                    <Key className="text-brand-400" size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-white">Khởi tạo cặp khóa</h2>
                  <p className="text-slate-400 text-sm max-w-md">Thiết lập độ an toàn cho hệ thống bằng cách tạo các tham số P, G và cặp khóa công khai/bí mật.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card-inner p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Độ dài khóa (Bits)</label>
                    <div className="flex gap-3">
                      {[256, 512, 1024].map(bits => (
                        <button
                          key={bits}
                          onClick={() => setKeyBits(bits)}
                          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${keyBits === bits ? 'bg-brand-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}
                        >
                          {bits}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={generateKeys}
                    disabled={loadingKey}
                    className="h-full flex flex-col items-center justify-center p-6 rounded-3xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-xl shadow-brand-600/20 group disabled:opacity-50"
                  >
                    {loadingKey ? <RefreshCw className="animate-spin" size={32} /> : <Zap className="group-hover:scale-110 transition-transform" size={32} />}
                    <span className="mt-3 font-black text-sm uppercase tracking-wider">{loadingKey ? 'Đang tạo...' : 'Tạo khóa mới'}</span>
                  </button>
                </div>

                {keys.p && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in duration-500">
                    {['p', 'g', 'x', 'y'].map((k) => (
                      <div key={k} className="glass-card-inner p-5 rounded-2xl border border-white/5 bg-white/[0.01] relative group">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">{k === 'y' ? 'Khóa công khai (y)' : k === 'x' ? 'Khóa bí mật (x)' : `Tham số ${k.toUpperCase()}`}</span>
                          <button onClick={() => handleCopy(keys[k], k)} className="text-slate-500 hover:text-brand-400 transition-colors">
                            {copiedId === k ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="text-xs font-mono text-slate-300 break-all bg-black/20 p-3 rounded-xl border border-white/5 leading-relaxed h-20 overflow-y-auto custom-scrollbar">
                          {keys[k]}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ma-hoa' && (
              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-brand-500/10 rounded-3xl border border-brand-500/20">
                    <Lock className="text-brand-400" size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-white">Mã hóa tin nhắn</h2>
                </div>

                <div className="space-y-6">
                  <div className="glass-card-inner p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Nội dung tin nhắn</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"
                      placeholder="Nhập nội dung cần bảo mật..."
                    />
                    <button
                      onClick={encryptMessage}
                      disabled={!keys.p || !message}
                      className="w-full mt-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-30 text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
                    >
                      <Zap size={18} />
                      Thực hiện mã hóa
                    </button>
                  </div>

                  {encryptSuccess && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in duration-500">
                      {['a', 'b'].map((k) => (
                        <div key={k} className="glass-card-inner p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Bản mã {k.toUpperCase()}</span>
                            <button onClick={() => handleCopy(cipherText[k], k)} className="text-slate-500 hover:text-brand-400 transition-colors">
                              {copiedId === k ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                          <div className="text-xs font-mono text-slate-300 break-all bg-black/20 p-3 rounded-xl border border-white/5 h-20 overflow-y-auto">
                            {cipherText[k]}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'giai-ma' && (
              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-brand-500/10 rounded-3xl border border-brand-500/20">
                    <Unlock className="text-brand-400" size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-white">Giải mã tin nhắn</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['a', 'b'].map(k => (
                      <div key={k} className="glass-card-inner p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Nhập bản mã {k.toUpperCase()}</label>
                        <textarea
                          value={inputCipher[k]}
                          onChange={(e) => setInputCipher(prev => ({ ...prev, [k]: e.target.value }))}
                          className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[10px] font-mono focus:outline-none focus:border-brand-500 transition-all resize-none"
                          placeholder={`Dán ${k.toUpperCase()} vào đây...`}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={decryptMessage}
                    disabled={!keys.x || !inputCipher.a || !inputCipher.b}
                    className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-30 text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
                  >
                    <Unlock size={18} />
                    Giải mã ngay
                  </button>

                  {decryptSuccess && (
                    <div className="glass-card-inner p-6 rounded-3xl border border-green-500/20 bg-green-500/5 animate-in zoom-in duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 className="text-green-500" size={20} />
                        <span className="text-xs font-black text-green-500 uppercase tracking-widest">Kết quả giải mã</span>
                      </div>
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-slate-200 text-sm leading-relaxed">
                        {decryptedMessage}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'file' && (
              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-brand-500/10 rounded-3xl border border-brand-500/20">
                    <FileCode className="text-brand-400" size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-white">Bảo mật File</h2>
                  <p className="text-slate-400 text-sm">Sử dụng AES-256 để mã hóa và giải mã các tệp tin của bạn.</p>
                </div>

                <div className="glass-card-inner p-8 rounded-3xl border border-white/5 bg-white/[0.02] space-y-6">
                  <div 
                    className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${selectedFile ? 'border-brand-500 bg-brand-500/5' : 'border-white/10 hover:border-white/20'}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setSelectedFile(e.dataTransfer.files[0]);
                    }}
                  >
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                      {selectedFile ? (
                        <>
                          <CheckCircle2 className="text-green-500" size={48} />
                          <div>
                            <p className="text-white font-bold">{selectedFile.name}</p>
                            <p className="text-slate-500 text-xs">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="text-slate-500" size={48} />
                          <div>
                            <p className="text-slate-300 font-bold">Kéo thả hoặc nhấn để chọn file</p>
                            <p className="text-slate-500 text-xs">Hỗ trợ tất cả định dạng</p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Mật khẩu bảo vệ</label>
                    <input
                      type="password"
                      value={filePassword}
                      onChange={(e) => setFilePassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-500 transition-all"
                      placeholder="Nhập mật khẩu..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleFileAction('encrypt')}
                      disabled={isProcessingFile || !selectedFile}
                      className="bg-brand-600 hover:bg-brand-500 disabled:opacity-30 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
                    >
                      {isProcessingFile ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
                      Mã hóa File
                    </button>
                    <button
                      onClick={() => handleFileAction('decrypt')}
                      disabled={isProcessingFile || !selectedFile}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
                    >
                      {isProcessingFile ? <RefreshCw className="animate-spin" size={18} /> : <Unlock size={18} />}
                      Giải mã File
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lich-su' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-brand-500/10 rounded-3xl border border-brand-500/20">
                    <History className="text-brand-400" size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-white">Lịch sử hoạt động</h2>
                  <p className="text-slate-400 text-sm">Danh sách các thao tác bảo mật bạn đã thực hiện trên hệ thống.</p>
                </div>

                <div className="glass-card-inner rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Thời gian</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hành động</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {loadingHistory ? (
                          <tr>
                            <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                              <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                              Đang tải dữ liệu...
                            </td>
                          </tr>
                        ) : history.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="px-6 py-12 text-center text-slate-500">Chưa có hoạt động nào được ghi lại.</td>
                          </tr>
                        ) : (
                          history.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                                {new Date(item.createdAt).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                                  item.action.includes('ENCRYPT') ? 'bg-brand-500/10 text-brand-400' : 
                                  item.action.includes('DECRYPT') ? 'bg-green-500/10 text-green-400' :
                                  'bg-slate-500/10 text-slate-400'
                                }`}>
                                  {item.action}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-300">{item.details}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
