import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Tipos MIME permitidos (baseado em magic bytes, não extensão)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  // REMOVIDO: zip e rar por segurança (risco de malware)
]);

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: async (req, file, cb) => {
    try {
      // Usar UUID ao invés de timestamp + random para evitar colisões
      const crypto = await import('crypto');
      const uniqueName = crypto.randomUUID();
      cb(null, uniqueName + path.extname(file.originalname));
    } catch (error) {
      cb(error as Error, '');
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: async (req, file, cb) => {
    try {
      // Import dinâmico para evitar problemas de CommonJS/ESM
      const { fileTypeFromBuffer } = await import('file-type');

      // Ler primeiros bytes do arquivo para validação
      const buffer = fs.readFileSync(file.path);
      const fileTypeResult = await fileTypeFromBuffer(buffer);

      if (!fileTypeResult) {
        return cb(new Error('Tipo de arquivo não reconhecido'));
      }

      // Verificar se MIME type é permitido
      if (!ALLOWED_MIME_TYPES.has(fileTypeResult.mime)) {
        return cb(new Error(`Tipo de arquivo não permitido: ${fileTypeResult.mime}`));
      }

      // Verificar extensão do arquivo (deve corresponder ao tipo detectado)
      const expectedExt = fileTypeResult.ext;
      const actualExt = path.extname(file.originalname).toLowerCase().slice(1);

      if (expectedExt !== actualExt) {
        return cb(new Error('Extensão do arquivo não corresponde ao conteúdo'));
      }

      cb(null, true);
    } catch (error) {
      cb(new Error('Erro ao validar arquivo'));
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
