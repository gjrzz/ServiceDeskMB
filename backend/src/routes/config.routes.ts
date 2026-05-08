/**
 * Rotas de Configurações do Sistema
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

/**
 * GET /api/config
 * Buscar todas as configurações públicas
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const configuracoes = await prisma.configuracao.findMany({
      select: {
        chave: true,
        valor: true,
        tipo: true,
      },
    });

    // Converter array para objeto para facilitar o acesso
    const configObj = configuracoes.reduce((acc, config) => {
      acc[config.chave] = {
        valor: config.valor,
        tipo: config.tipo,
      };
      return acc;
    }, {} as Record<string, { valor: string; tipo: string }>);

    res.json(configObj);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ message: 'Erro ao buscar configurações' });
  }
});

/**
 * GET /api/config/:chave
 * Buscar uma configuração específica
 */
router.get('/:chave', async (req: Request, res: Response) => {
  try {
    const { chave } = req.params;

    const config = await prisma.configuracao.findUnique({
      where: { chave },
      select: {
        chave: true,
        valor: true,
        tipo: true,
      },
    });

    if (!config) {
      return res.status(404).json({ message: 'Configuração não encontrada' });
    }

    res.json(config);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ message: 'Erro ao buscar configuração' });
  }
});

export default router;
