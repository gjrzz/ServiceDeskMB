import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir apenas certos tipos de arquivo
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  },
});

// Upload de arquivo
router.post('/', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      nomeOriginal: req.file.originalname,
      nomeArquivo: req.file.filename,
      tamanho: req.file.size,
      mimeType: req.file.mimetype,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});

// Upload de avatar (base64)
router.post('/avatar', async (req: AuthRequest, res) => {
  try {
    const { base64 } = req.body;

    if (!base64) {
      return res.status(400).json({ error: 'Imagem não fornecida' });
    }

    // Extrair tipo e dados
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Formato de imagem inválido' });
    }

    const imageType = matches[1];
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');

    // Validar tamanho (2MB)
    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'Imagem muito grande (máx 2MB)' });
    }

    // Gerar nome único
    const extension = imageType.split('/')[1];
    const filename = `avatar-${req.userId}-${Date.now()}.${extension}`;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);

    // Salvar arquivo
    fs.writeFileSync(filepath, buffer);

    const avatarUrl = `/uploads/${filename}`;

    res.json({ avatarUrl });
  } catch (error) {
    console.error('Erro no upload de avatar:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do avatar' });
  }
});

export default router;
