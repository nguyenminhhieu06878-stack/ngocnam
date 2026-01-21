const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ActivityHistory = require('../models/ActivityHistory');

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

const encryptFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được tải lên' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Cần mật khẩu để mã hóa' });
    }

    // Create key from password
    const key = crypto.scryptSync(password, 'salt', KEY_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    const inputPath = req.file.path;
    const outputPath = inputPath + '.enc';

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    // Write IV at the beginning of the file
    output.write(iv);

    input.pipe(cipher).pipe(output);

    output.on('finish', async () => {
      // Log activity
      await ActivityHistory.create({
        userId: req.user.id,
        action: 'FILE_ENCRYPT',
        details: `Đã mã hóa file: ${req.file.originalname}`
      });

      res.download(outputPath, req.file.originalname + '.enc', (err) => {
        // Cleanup files
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });

  } catch (error) {
    console.error('Encryption error:', error);
    res.status(500).json({ error: 'Mã hóa file thất bại: ' + error.message });
  }
};

const decryptFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được tải lên' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Cần mật khẩu để giải mã' });
    }

    const key = crypto.scryptSync(password, 'salt', KEY_LENGTH);
    const inputPath = req.file.path;
    const outputPath = inputPath + '.dec';

    const fileBuffer = fs.readFileSync(inputPath);
    
    if (fileBuffer.length < IV_LENGTH) {
      return res.status(400).json({ error: 'File không đúng định dạng mã hóa (quá ngắn)' });
    }

    const iv = fileBuffer.slice(0, IV_LENGTH);
    const encryptedData = fileBuffer.slice(IV_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decryptedData;
    
    try {
      decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    } catch (decryptErr) {
      console.error('Decryption error details:', decryptErr);
      return res.status(400).json({ error: 'Giải mã thất bại. Có thể mật khẩu sai hoặc file không hợp lệ.' });
    }

    fs.writeFileSync(outputPath, decryptedData);

    // Log activity
    await ActivityHistory.create({
      userId: req.user.id,
      action: 'FILE_DECRYPT',
      details: `Đã giải mã file: ${req.file.originalname}`
    });

    res.download(outputPath, req.file.originalname.replace('.enc', ''), (err) => {
      // Cleanup files
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });

  } catch (error) {
    console.error('General decryption error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống khi giải mã: ' + error.message });
  }
};

const getHistory = async (req, res) => {
    try {
        const history = await ActivityHistory.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Lấy lịch sử thất bại: ' + error.message });
    }
};

module.exports = { encryptFile, decryptFile, getHistory };
