import pino from 'pino';

// Configurar logger baseado no ambiente
const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Em desenvolvimento, usar formato mais legível
if (process.env.NODE_ENV !== 'production') {
  logger.info('📊 Logger inicializado em modo desenvolvimento');
}

export default logger;