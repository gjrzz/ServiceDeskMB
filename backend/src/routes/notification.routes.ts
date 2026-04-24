import { Router } from 'express';
import { prisma } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Listar notificações do usuário
router.get('/', async (req: AuthRequest, res) => {
  try {
    const notificacoes = await prisma.notificacao.findMany({
      where: { destinatarioId: req.userId },
      orderBy: { criadoEm: 'desc' },
      take: 50,
    });

    res.json(notificacoes);
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({ error: 'Erro ao listar notificações' });
  }
});

// Marcar como lida
router.patch('/:id/read', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const notificacao = await prisma.notificacao.update({
      where: { id, destinatarioId: req.userId },
      data: { lida: true },
    });

    res.json(notificacao);
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
});

// Marcar todas como lidas
router.post('/read-all', async (req: AuthRequest, res) => {
  try {
    await prisma.notificacao.updateMany({
      where: { destinatarioId: req.userId, lida: false },
      data: { lida: true },
    });

    res.json({ message: 'Todas as notificações foram marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar todas:', error);
    res.status(500).json({ error: 'Erro ao marcar todas as notificações' });
  }
});

// Deletar notificação
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.notificacao.delete({
      where: { id, destinatarioId: req.userId },
    });

    res.json({ message: 'Notificação deletada' });
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({ error: 'Erro ao deletar notificação' });
  }
});

export default router;
