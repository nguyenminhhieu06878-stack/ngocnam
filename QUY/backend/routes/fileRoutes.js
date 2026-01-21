const express = require('express');
const multer = require('multer');
const { encryptFile, decryptFile, getHistory } = require('../controllers/fileController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/encrypt', authMiddleware, upload.single('file'), encryptFile);
router.post('/decrypt', authMiddleware, upload.single('file'), decryptFile);
router.get('/history', authMiddleware, getHistory);

module.exports = router;
