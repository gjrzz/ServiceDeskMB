import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Schemas
const createTicketSchema = z.object({
  titulo: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  prioridade: z.enum(['BAIXO', 'MEDIO', 'ALTO', 'CRITICO']),
  categoria: z.enum(['HARDWARE', 'SOFTWARE', 'REDE', 'ACESSO', 'OUTROS']),
});

// Listar chamados
router.get('/', async (req: AuthRequest, res) => {
  try {
    const isAdmin = req.userPerfil === 'ADMIN';
    
    const chamados = await prisma.chamado.findMany({
      where: isAdmin ? {} : { solicitanteId: req.userId },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            atividades: true,
            anexos: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });

    res.json(chamados);
  } catch (error) {
    console.error('Erro ao listar chamados:', error);
    res.status(500).json({ error: 'Erro ao listar chamados' });
  }
});

// Buscar chamado por ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.userPerfil === 'ADMIN';

    const chamado = await prisma.chamado.findUnique({
      where: { id },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        atividades: {
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
          orderBy: { criadoEm: 'desc' },
        },
        anexos: true,
      },
    });

    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    // Verificar permissão
    if (!isAdmin && chamado.solicitanteId !== req.userId) {
      return res.status(403).json({ error: 'Sem permissão para ver este chamado' });
    }

    res.json(chamado);
  } catch (error) {
    console.error('Erro ao buscar chamado:', error);
    res.status(500).json({ error: 'Erro ao buscar chamado' });
  }
});

// Criar chamado
router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = createTicketSchema.parse(req.body);

    // Calcular SLA baseado na prioridade
    const slaHoras = {
      CRITICO: 4,
      ALTO: 8,
      MEDIO: 24,
      BAIXO: 72,
    }[data.prioridade];

    const slaVencimento = new Date();
    slaVencimento.setHours(slaVencimento.getHours() + slaHoras);

    const chamado = await prisma.chamado.create({
      data: {
        ...data,
        solicitanteId: req.userId!,
        slaHoras,
        slaVencimento,
      },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Criar atividade inicial
    await prisma.atividadeChamado.create({
      data: {
        chamadoId: chamado.id,
        autorId: req.userId!,
        tipo: 'COMENTARIO',
        texto: `Chamado criado: ${chamado.titulo}`,
      },
    });

    // Criar notificação para admins
    const admins = await prisma.usuario.findMany({
      where: { perfil: 'ADMIN', ativo: true },
      select: { id: true },
    });

    await Promise.all(
      admins.map(admin =>
        prisma.notificacao.create({
          data: {
            tipo: 'CHAMADO_CRIADO',
            titulo: 'Novo Chamado',
            mensagem: `${chamado.solicitante.nome} criou: ${chamado.titulo}`,
            linkTipo: 'chamado',
            linkId: chamado.id,
            destinatarioId: admin.id,
          },
        })
      )
    );

    res.status(201).json(chamado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao criar chamado:', error);
    res.status(500).json({ error: 'Erro ao criar chamado' });
  }
});

// Atualizar status
router.patch('/:id/status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const chamado = await prisma.chamado.findUnique({ where: { id } });
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    const statusAnterior = chamado.status;
    const agora = new Date();

    const updateData: any = { status };

    if (status === 'RESOLVIDO' && !chamado.resolvidoEm) {
      updateData.resolvidoEm = agora;
      updateData.slaCumprido = agora <= (chamado.slaVencimento || agora);
    }

    if (status === 'FECHADO' && !chamado.fechadoEm) {
      updateData.fechadoEm = agora;
    }

    const chamadoAtualizado = await prisma.chamado.update({
      where: { id },
      data: updateData,
      include: {
        solicitante: {
          select: { id: true, nome: true },
        },
      },
    });

    // Criar atividade
    await prisma.atividadeChamado.create({
      data: {
        chamadoId: id,
        autorId: req.userId!,
        tipo: 'MUDANCA_STATUS',
        texto: `Status alterado de ${statusAnterior} para ${status}`,
        valorAnterior: statusAnterior,
        valorNovo: status,
      },
    });

    // Notificar solicitante
    if (status === 'RESOLVIDO' || status === 'FECHADO') {
      await prisma.notificacao.create({
        data: {
          tipo: 'SOLICITAR_AVALIACAO',
          titulo: 'Avalie seu chamado',
          mensagem: `Seu chamado foi ${status.toLowerCase()}. Como foi sua experiência?`,
          linkTipo: 'chamado',
          linkId: id,
          destinatarioId: chamado.solicitanteId,
        },
      });
    }

    res.json(chamadoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Adicionar comentário
router.post('/:id/comments', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { texto, interno } = req.body;

    const atividade = await prisma.atividadeChamado.create({
      data: {
        chamadoId: id,
        autorId: req.userId!,
        tipo: interno ? 'COMENTARIO_INTERNO' : 'COMENTARIO',
        texto,
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

    res.status(201).json(atividade);
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
});

// Avaliar chamado
router.post('/:id/avaliar', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { nota, resolvido, comentario } = req.body;

    const chamado = await prisma.chamado.findUnique({ where: { id } });
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    if (chamado.solicitanteId !== req.userId) {
      return res.status(403).json({ error: 'Apenas o solicitante pode avaliar' });
    }

    const chamadoAtualizado = await prisma.chamado.update({
      where: { id },
      data: {
        avaliacaoNota: nota,
        avaliacaoResolvido: resolvido,
        avaliacaoComentario: comentario,
        avaliacaoData: new Date(),
      },
    });

    res.json(chamadoAtualizado);
  } catch (error) {
    console.error('Erro ao avaliar chamado:', error);
    res.status(500).json({ error: 'Erro ao avaliar chamado' });
  }
});

export default router;
