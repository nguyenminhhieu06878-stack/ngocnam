import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadDocument, getAllDocuments, deleteDocument } from '../services/documentService.js';

const router = express.Router();

// Cấu hình multer để upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file PDF, Word, hoặc TXT'));
    }
  }
});

// Upload tài liệu
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'Vui lòng chọn file' });
    }

    const document = await uploadDocument(file, { title, category, description });
    res.json({ message: 'Upload thành công', document });
  } catch (error) {
    console.error('Lỗi upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách tài liệu
router.get('/', async (req, res) => {
  try {
    const documents = await getAllDocuments();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy tài liệu theo ngày
router.get('/by-date/:date', async (req, res) => {
  try {
    const { date } = req.params; // Format: YYYY-MM-DD
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const Document = (await import('../models/Document.js')).default;
    const documents = await Document.find({
      uploadedAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ uploadedAt: -1 });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thống kê tài liệu theo ngày
router.get('/stats/by-date', async (req, res) => {
  try {
    const Document = (await import('../models/Document.js')).default;
    
    // Lấy tất cả documents và group theo ngày
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
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 30 // Lấy 30 ngày gần nhất
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa tài liệu
router.delete('/:id', async (req, res) => {
  try {
    await deleteDocument(req.params.id);
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
