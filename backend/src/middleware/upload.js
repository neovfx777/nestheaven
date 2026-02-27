const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const fs = require('fs');

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
const maxSize = env.MAX_FILE_SIZE_MB * 1024 * 1024;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

const bannerMime = ['image/jpeg', 'image/png', 'image/webp'];
const permissionMime = ['application/pdf', 'image/jpeg', 'image/png'];

const complexStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const complexId = req.complexId || req.params.id;
    const target = complexId
      ? path.join(uploadDir, 'complexes', complexId)
      : path.join(uploadDir, 'complexes', 'temp');
    ensureDir(target);
    cb(null, target);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, name);
  },
});

const complexFileFilter = (req, file, cb) => {
  const field = file.fieldname;
  if (field === 'banner' || field === 'teaser' || field === 'teaserImage') {
    if (bannerMime.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Invalid teaser/banner type. Allowed: JPEG, PNG, WebP'), false);
  }

  const permissionFields = [
    'permission1',
    'permission2',
    'permission3',
    'permission_1',
    'permission_2',
    'permission_3',
  ];

  if (permissionFields.includes(field)) {
    if (permissionMime.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Invalid permission type. Allowed: PDF, JPEG, PNG'), false);
  }

  return cb(new Error('Invalid file field'), false);
};

const complexUpload = multer({
  storage: complexStorage,
  fileFilter: complexFileFilter,
  limits: { fileSize: maxSize },
});

function extractUploadPath(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname;
    } catch {
      return null;
    }
  }
  return url;
}

function deleteFileByUrl(url) {
  const pathname = extractUploadPath(url);
  if (!pathname || !pathname.startsWith('/uploads/')) return;

  const relative = pathname.replace('/uploads/', '');
  const filePath = path.join(uploadDir, relative);

  if (!filePath.startsWith(uploadDir)) return;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('Failed to remove file:', filePath, err.message);
  }
}

function removeComplexDirIfEmpty(complexId) {
  if (!complexId) return;
  const dir = path.join(uploadDir, 'complexes', complexId);
  try {
    if (fs.existsSync(dir) && fs.readdirSync(dir).length == 0) {
      fs.rmdirSync(dir);
    }
  } catch (err) {
    // best effort cleanup
  }
}

module.exports = { upload, uploadDir, complexUpload, deleteFileByUrl, removeComplexDirIfEmpty };
