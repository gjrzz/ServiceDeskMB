import { Router } from 'express';
import { prisma } from '../prisma';
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

// Criar artigo (qualquer usuário autenticado)
router.post('/', async (req: AuthRequest, res) => {
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

// Atualizar artigo (apenas o autor ou admin)
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo, categoria, tags, publicado } = req.body;

    // Buscar artigo para verificar permissão
    const artigoExistente = await prisma.artigoKB.findUnique({ where: { id } });
    if (!artigoExistente) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }

    // Apenas autor ou admin podem editar
    const isAutor = artigoExistente.autorId === req.userId;
    const isAdmin = req.userPerfil === 'ADMIN';
    if (!isAutor && !isAdmin) {
      return res.status(403).json({ error: 'Sem permissão para editar este artigo' });
    }

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
            avatarUrpenas o autor ou admin)
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Buscar artigo para verificar permissão
    const artigo = await prisma.artigoKB.findUnique({ where: { id } });
    if (!artigo) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }

    // Apenas autor ou admin podem deletar
    const isAutor = artigo.autorId === req.userId;
    const isAdmin = req.userPerfil === 'ADMIN';
    if (!isAutor && !isAdmin) {
      return res.status(403).json({ error: 'Sem permissão para deletar este artigo' });
    }
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
