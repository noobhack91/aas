import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 5
};

export const upload = multer({
  storage,
  fileFilter,
  limits
});