import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import textract from 'textract';
import { promisify } from 'util';
import Document from '../models/Document.js';
import { embedDocument } from './vectorService.js';

const textractFromFile = promisify(textract.fromFileWithPath);

export async function uploadDocument(file, metadata) {
  try {
    // Normalize filename để xử lý tiếng Việt đúng
    const normalizedFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
    // Đọc nội dung file
    const content = await extractTextFromFile(file);
    
    // Lưu thông tin vào database
    const document = new Document({
      title: metadata.title || normalizedFilename,
      filename: normalizedFilename,
      filepath: file.path,
      fileType: path.extname(normalizedFilename),
      category: metadata.category || 'Chung',
      description: metadata.description,
      content: content,
      status: 'processing'
    });
    
    await document.save();
    
    // Xử lý embedding và lưu vào vector database (optional - không fail nếu ChromaDB không có)
    try {
      const vectorId = await embedDocument(document._id.toString(), content, {
        title: document.title,
        category: document.category
      });
      document.vectorId = vectorId;
    } catch (vectorError) {
      console.warn('⚠️ Không thể kết nối ChromaDB, bỏ qua vector embedding:', vectorError.message);
      // Không throw error, vẫn cho phép upload thành công
    }
    
    document.status = 'ready';
    await document.save();
    
    return document;
  } catch (error) {
    console.error('Lỗi xử lý tài liệu:', error);
    throw error;
  }
}

async function extractTextFromFile(file) {
  const normalizedFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
  const ext = path.extname(normalizedFilename).toLowerCase();
  const buffer = await fs.readFile(file.path);
  
  if (ext === '.pdf') {
    const data = await pdf(buffer);
    return data.text;
  } else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (ext === '.doc') {
    // Thử mammoth trước (hỗ trợ cả .doc và .docx)
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 0) {
        return result.value;
      }
    } catch (error) {
      console.log('Mammoth không đọc được, thử textract...');
    }
    
    // Fallback: dùng textract cho file .doc cũ
    try {
      const text = await textractFromFile(file.path);
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (error) {
      console.error('Lỗi đọc file .doc với textract:', error);
    }
    
    throw new Error('Không thể đọc file .doc. Vui lòng chuyển sang định dạng .docx hoặc .pdf để đảm bảo tương thích tốt nhất.');
  } else if (ext === '.txt') {
    return buffer.toString('utf-8');
  }
  
  throw new Error('Định dạng file không được hỗ trợ');
}

export async function getAllDocuments() {
  return await Document.find().sort({ uploadedAt: -1 });
}

export async function deleteDocument(id) {
  const document = await Document.findById(id);
  if (!document) {
    throw new Error('Không tìm thấy tài liệu');
  }
  
  // Xóa file vật lý
  try {
    await fs.unlink(document.filepath);
  } catch (error) {
    console.error('Lỗi xóa file:', error);
  }
  
  // Xóa khỏi database
  await Document.findByIdAndDelete(id);
}
