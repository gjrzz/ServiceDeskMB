import { Router } from 'express';
import { prisma } from '../server';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Listar artigos (apenas publicados para usuários comuns)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const isAdmin = req.userPerfil === 'ADMIN';

    const artigos = await prisma.artigoKB.findMany({
      where: isAdmin ? {} : { publicado: true },
      include: {
        autor: {
          select: {
            id: true,
            nome: true,
            avatar: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { atualizadoEm: 'desc' },
    });

    res.json(artigos);
  } catch (error) {
    console.error('Erro ao listar artigos:', error);
    res.status(500).json({ error: 'Erro ao listar artigos' });
  }
});

// Buscar artigo por ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const artigo = await prisma.artigoKB.findUnique({
      where: { id },
      include: {
        autor: {
          select: {
            id: true,
            nome: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        editor: {
          select: {
            id: true,
            nome: true,
            avatar: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!artigo) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }

    // Incrementar visualizações
    await prisma.artigoKB.update({
      where: { id },
      data: { visualizacoes: { increment: 1 } },
    });

    res.json(artigo);
  } catch (error) {
    console.error('Erro ao buscar artigo:', error);
    res.status(500).json({ error: 'Erro ao buscar artigo' });
  }
});

// Criar artigo (admin)
router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { titulo, conteudo, categoria, tags, publicado } = req.body;

    const artigo = await prisma.artigoKB.create({
      data: {
        titulo,
        conteudo,
        categoria,
        tags: tags || [],
        publicado: publicado || false,
        autorId: req.userId!,
      },
      include: {
        autor: {
          select: {
            id: true,
            nome: true,
            avatar: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json(artigo);
  } catch (error) {
    console.error('Erro ao criar artigo:', error);
    res.status(500).json({ error: 'Erro ao criar artigo' });
  }
});

// Atualizar artigo (admin)
router.patch('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo, categoria, tags, publicado } = req.body;

    const artigo = await prisma.artigoKB.update({
      where: { id },
      data: {
        titulo,
        conteudo,
        categoria,
        tags,
        publicado,
        editorId: req.userId,
      },
      include: {
        autor: {
          select: {
            id: true,
            nome: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        editor: {
          select: {
            id: true,
            nome: true,
            avatar: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(artigo);
  } catch (error) {
    console.error('Erro ao atualizar artigo:', error);
    res.status(500).json({ error: 'Erro ao atualizar artigo' });
  }
});

// Deletar artigo (admin)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.artigoKB.delete({ where: { id } });

    res.json({ message: 'Artigo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar artigo:', error);
    res.status(500).json({ error: 'Erro ao deletar artigo' });
  }
});

export default router;
