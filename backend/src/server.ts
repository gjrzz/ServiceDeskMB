import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { prisma } from './prisma';
import logger from './utils/logger';

// Carregar variáveis de ambiente
dotenv.config();

// ============================================
// VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS
// ============================================

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'NODE_ENV'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Variável de ambiente obrigatória não definida: ${envVar}`);
    process.exit(1);
  }
}

logger.info('✅ Todas as variáveis de ambiente obrigatórias estão definidas');

// Importar rotas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import ticketRoutes from './routes/ticket.routes';
import kbRoutes from './routes/kb.routes';
import notificationRoutes from './routes/notification.routes';
import uploadRoutes from './routes/upload.routes';
import configRoutes from './routes/config.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// CONFIGURAÇÃO DE PROXY (Railway/Heroku)
// ============================================

// Confiar no proxy reverso (necessário para Railway, Heroku, etc.)
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARES
// ============================================

// Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permitir recursos de outras origens
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3000", "http://localhost:5173", "https://gjrzz.github.io", "*"], // Permitir imagens de qualquer origem
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173', // Desenvolvimento local (Vite padrão)
    'http://localhost:3000', // Desenvolvimento local (porta customizada)
    'https://gjrzz.github.io', // GitHub Pages
    'https://gjrzz.github.io/ServiceDeskMB', // GitHub Pages com caminho específico
  ],
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting por usuário (não por IP)
const createUserRateLimit = (options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const now = Date.now();

    // Para rotas públicas (sem autenticação), usa IP
    if (!userId) {
      // Rate limit simples por IP para rotas públicas
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `ip_${clientIp}`;

      const userData = userRequests.get(key);
      if (userData && now < userData.resetTime) {
        if (userData.count >= options.max) {
          return res.status(429).json({ error: options.message });
        }
        userData.count++;
      } else {
        userRequests.set(key, {
          count: 1,
          resetTime: now + options.windowMs
        });
      }
      return next();
    }

    // Para usuários autenticados, rate limit por userId
    const userData = userRequests.get(userId);
    if (userData && now < userData.resetTime) {
      if (userData.count >= options.max) {
        return res.status(429).json({ error: options.message });
      }
      userData.count++;
    } else {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + options.windowMs
      });
    }

    // Limpar entradas antigas periodicamente
    if (Math.random() < 0.01) { // 1% de chance por requisição
      for (const [key, data] of userRequests.entries()) {
        if (now > data.resetTime) {
          userRequests.delete(key);
        }
      }
    }

    next();
  };
};

// Rate limiting personalizado
const limiter = createUserRateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests/15min
  message: 'Muitas requisições, tente novamente mais tarde.',
});

// Aplicar rate limiting apenas para rotas autenticadas
app.use('/api/', limiter);

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

// ============================================
// ROTAS
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/config', configRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error Handler Global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

async function startServer() {
  try {
    // Testar conexão com banco
    await prisma.$connect();
    logger.info('✅ Conectado ao banco de dados PostgreSQL');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
      logger.info(`📊 Ambiente: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Frontend: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    logger.error({ error }, '❌ Erro ao iniciar servidor');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
