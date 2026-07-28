import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Setup storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed extensions for evidence
  const allowedExts = /jpeg|jpg|png|gif|webp|pdf|doc|docx|mp4|avi|mov|mkv|eml|msg|pcap|pcapng|cap|zip|tar|gz|7z|rar|log|txt/i;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  const isAllowedExt = allowedExts.test(ext);
  
  if (isAllowedExt) {
    return cb(null, true);
  } else {
    cb(new Error(`Invalid file type '.${ext}'! Supported types: Images, Videos, PDFs, Emails (.eml/.msg), PCAPs, ZIP archives, Logs.`));
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: fileFilter
});
