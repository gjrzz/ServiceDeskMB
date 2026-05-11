import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Schemas
const attachmentSchema = z.object({
  name: z.string().min(1, 'Nome do anexo é obrigatório'),
  size: z.number().nonnegative(),
  type: z.string(),
  url: z.string().min(1, 'URL do anexo é obrigatória'),
});

const createTicketSchema = z.object({
  titulo: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  prioridade: z.enum(['BAIXO', 'MEDIO', 'ALTO', 'CRITICO']),
  categoria: z.enum(['HARDWARE', 'SOFTWARE', 'REDE', 'ACESSO', 'OUTROS']),
  attachments: z.array(attachmentSchema).optional(),
});

const updatePrioritySchema = z.object({
  prioridade: z.enum(['BAIXO', 'MEDIO', 'ALTO', 'CRITICO']),
});

const assignTicketSchema = z.object({
  responsavelId: z.string().min(1, 'Responsável é obrigatório'),
});

const rateTicketSchema = z.object({
  nota: z.number().min(1, 'Nota deve ser entre 1 e 5').max(5, 'Nota deve ser entre 1 e 5'),
  resolvido: z.boolean(),
  comentario: z.string().optional(),
});

const isPrivileged = (perfil?: string) =>
  perfil === 'ADMIN' || perfil === 'MANAGER';

const canAccessTicket = (req: AuthRequest, chamado: any) =>
  isPrivileged(req.userPerfil) ||
  chamado.solicitanteId === req.userId ||
  chamado.responsavelId === req.userId;

const generateTicketId = async () => {
  const tickets = await prisma.chamado.findMany({
    where: {
      id: { startsWith: 'TKT-' },
    },
    select: { id: true },
  });

  const maxNumber = tickets.reduce((max, ticket) => {
    const numberPart = parseInt(ticket.id.replace('TKT-', ''), 10);
    return Number.isFinite(numberPart) ? Math.max(max, numberPart) : max;
  }, 0);

  return `TKT-${String(maxNumber + 1).padStart(3, '0')}`;
};

// Listar chamados com paginação
router.get('/', async (req: AuthRequest, res) => {
  try {
    const isPrivilegedUser = isPrivileged(req.userPerfil);

    // Parâmetros de paginação
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Máximo 100
    const offset = (page - 1) * limit;

    // Filtros opcionais
    const status = req.query.status as string;
    const prioridade = req.query.prioridade as string;
    const categoria = req.query.categoria as string;

    const where: any = {};
    if (!isPrivilegedUser) {
      where.solicitanteId = req.userId;
    }
    if (status) where.status = status;
    if (prioridade) where.prioridade = prioridade;
    if (categoria) where.categoria = categoria;

    // Buscar chamados com paginação (SEM atividades/anexos para performance)
    const [chamados, total] = await Promise.all([
      prisma.chamado.findMany({
        where,
        select: {
          id: true,
          titulo: true,
          status: true,
          prioridade: true,
          categoria: true,
          criadoEm: true,
          atualizadoEm: true,
          slaHoras: true,
          slaVencimento: true,
          solicitante: {
            select: {
              id: true,
              nome: true,
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
        skip: offset,
        take: limit,
      }),
      prisma.chamado.count({ where }),
    ]);

    res.json({
      chamados,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Erro ao listar chamados:', error);
    res.status(500).json({ error: 'Erro ao listar chamados' });
  }
});

// Buscar atividades de um chamado (lazy loading)
router.get('/:id/activities', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;

    const chamado = await prisma.chamado.findUnique({
      where: { id },
      select: { id: true, solicitanteId: true, responsavelId: true },
    });

    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    if (!canAccessTicket(req, chamado)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const [atividades, total] = await Promise.all([
      prisma.atividadeChamado.findMany({
        where: { chamadoId: id },
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
        skip: offset,
        take: limit,
      }),
      prisma.atividadeChamado.count({ where: { chamadoId: id } }),
    ]);

    res.json({
      atividades,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    res.status(500).json({ error: 'Erro ao buscar atividades' });
  }
});

// Buscar chamado por ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

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
    if (!canAccessTicket(req, chamado)) {
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

    const id = await generateTicketId();

    const chamado = await prisma.chamado.create({
      data: {
        id,
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade,
        categoria: data.categoria,
        solicitanteId: req.userId!,
        slaHoras,
        slaVencimento,
        anexos: data.attachments?.length
          ? {
              create: data.attachments.map((attachment) => ({
                nomeOriginal: attachment.name,
                nomeArquivo: attachment.name,
                tamanho: attachment.size,
                mimeType: attachment.type || 'application/octet-stream',
                url: attachment.url,
              })),
            }
          : undefined,
      } as any,
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
        anexos: true,
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
            mensagem: `${(chamado as any).solicitante?.nome || 'Usuário'} criou: ${chamado.titulo}`,
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

    if (!canAccessTicket(req, chamado)) {
      return res.status(403).json({ error: 'Sem permissão para alterar este chamado' });
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

router.put('/:id/status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const chamado = await prisma.chamado.findUnique({ where: { id } });
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    if (!canAccessTicket(req, chamado)) {
      return res.status(403).json({ error: 'Sem permissão para alterar este chamado' });
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

// Atualizar prioridade
router.patch('/:id/priority', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { prioridade } = updatePrioritySchema.parse(req.body);

    const chamado = await prisma.chamado.findUnique({ where: { id } });
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    if (!canAccessTicket(req, chamado)) {
      return res.status(403).json({ error: 'Sem permissão para alterar este chamado' });
    }

    const chamadoAtualizado = await prisma.chamado.update({
      where: { id },
      data: { prioridade },
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

    await prisma.atividadeChamado.create({
      data: {
        chamadoId: id,
        autorId: req.userId!,
        tipo: 'MUDANCA_PRIORIDADE',
        texto: `Prioridade alterada de ${chamado.prioridade} para ${prioridade}`,
        valorAnterior: chamado.prioridade,
        valorNovo: prioridade,
      },
    });

    res.json(chamadoAtualizado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao atualizar prioridade:', error);
    res.status(500).json({ error: 'Erro ao atualizar prioridade' });
  }
});

router.put('/:id/priority', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { prioridade } = updatePrioritySchema.parse(req.body);

    const chamado = await prisma.chamado.findUnique({ where: { id } });
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    if (!canAccessTicket(req, chamado)) {
      return res.status(403).json({ error: 'Sem permissão para alterar este chamado' });
    }

    const chamadoAtualizado = await prisma.chamado.update({
      where: { id },
      data: { prioridade },
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

    await prisma.atividadeChamado.create({
      data: {
        chamadoId: id,
        autorId: req.userId!,
        tipo: 'MUDANCA_PRIORIDADE',
        texto: `Prioridade alterada de ${chamado.prioridade} para ${prioridade}`,
        valorAnterior: chamado.prioridade,
        valorNovo: prioridade,
      },
    });

    res.json(chamadoAtualizado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao atualizar prioridade:', error);
    res.status(500).json({ error: 'Erro ao atualizar prioridade' });
  }
});

// Atribuir responsável
router.post('/:id/assign', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { responsavelId } = assignTicketSchema.parse(req.body);

    if (!isPrivileged(req.userPerfil)) {
      return res.status(403).json({ error: 'Sem permissão para atribuir este chamado' });
    }

    const chamado = await prisma.chamado.findUnique({ where: { id } });
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    const chamadoAtualizado = await prisma.chamado.update({
      where: { id },
      data: { responsavelId },
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
            email: true,
            avatar: true,
            avatarUrl: true,
          },
        },
      },
    });

    await prisma.atividadeChamado.create({
      data: {
        chamadoId: id,
        autorId: req.userId!,
        tipo: 'ATRIBUICAO',
        texto: `Chamado atribuído para ${chamadoAtualizado.responsavel?.nome || responsavelId}`,
        valorAnterior: chamado.responsavelId,
        valorNovo: responsavelId,
      },
    });

    res.json(chamadoAtualizado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao atribuir responsável:', error);
    res.status(500).json({ error: 'Erro ao atribuir responsável' });
  }
});

// Avaliar chamado
const handleTicketRating = async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const { nota, resolvido, comentario } = rateTicketSchema.parse(req.body);

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
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao avaliar chamado:', error);
    res.status(500).json({ error: 'Erro ao avaliar chamado' });
  }
};

router.post('/:id/rate', handleTicketRating);
router.post('/:id/avaliar', handleTicketRating);

// Adicionar comentário
router.post('/:id/comments', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { texto, interno } = req.body;

    const chamado = await prisma.chamado.findUnique({ where: { id } });
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    if (!canAccessTicket(req, chamado)) {
      return res.status(403).json({ error: 'Sem permissão para comentar neste chamado' });
    }

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

// Deletar chamado
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const chamado = await prisma.chamado.findUnique({ where: { id } });
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    // Apenas admin ou o solicitante pode deletar
    const isAdmin = req.userPerfil === 'ADMIN';
    const isSolicitante = chamado.solicitanteId === req.userId;

    if (!isAdmin && !isSolicitante) {
      return res.status(403).json({ error: 'Sem permissão para deletar este chamado' });
    }

    // Deletar atividades relacionadas
    await prisma.atividadeChamado.deleteMany({
      where: { chamadoId: id },
    });

    // Deletar notificações relacionadas
    await prisma.notificacao.deleteMany({
      where: { linkId: id },
    });

    // Deletar anexos relacionados (se houver)
    await prisma.anexo.deleteMany({
      where: { chamadoId: id },
    });

    // Deletar chamado
    await prisma.chamado.delete({
      where: { id },
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: req.userId!,
        acao: 'EXCLUIR_CHAMADO',
        descricao: `Chamado ${id} deletado: ${chamado.titulo}`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({ message: 'Chamado deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar chamado:', error);
    res.status(500).json({ error: 'Erro ao deletar chamado' });
  }
});

export default router;
