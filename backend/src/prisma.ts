import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const logLevels = process.env.NODE_ENV === 'development'
  ? ['query', 'error', 'warn']
  : ['error'];

export const prisma = new PrismaClient({
  log: logLevels as any,
});
