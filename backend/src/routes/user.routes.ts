import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const createUserSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  perfil: z.enum(['ADMIN', 'USUARIO', 'MANAGER']),
  departamento: z.string().min(2, 'Departamento é obrigatório'),
});

const updateUserSchema = z.object({
  nome: z.string().min(3).optional(),
  email: z.string().email().optional(),
  departamento: z.string().min(2).optional(),
  perfil: z.enum(['ADMIN', 'USUARIO', 'MANAGER']).optional(),
  avatarUrl: z.string().nullable().optional(), // Removido .url() para aceitar caminhos relativos
});

// ============================================
// LISTAR USUÁRIOS
// ============================================

router.get('/', async (req: AuthRequest, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        departamento: true,
        avatar: true,
        avatarUrl: true,
        ativo: true,
        criadoEm: true,
      },
      orderBy: { nome: 'asc' },
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// ============================================
// BUSCAR USUÁRIO POR ID
// ============================================

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        departamento: true,
        avatar: true,
        avatarUrl: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// ============================================
// CRIAR USUÁRIO (ADMIN)
// ============================================

router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = createUserSchema.parse(req.body);

    // Verificar se e-mail já existe
    const existente = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (existente) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);

    // Gerar avatar (iniciais)
    const iniciais = data.nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: senhaHash,
        perfil: data.perfil,
        departamento: data.departamento,
        avatar: iniciais,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        departamento: true,
        avatar: true,
        avatarUrl: true,
        ativo: true,
        criadoEm: true,
      },
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: req.userId!,
        acao: 'CRIAR_USUARIO',
        descricao: `Usuário criado: ${usuario.nome} (${usuario.email})`,
        dadosDepois: usuario,
      },
    });

    res.status(201).json(usuario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// ============================================
// ATUALIZAR USUÁRIO
// ============================================

router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    // Verificar permissões
    const isAdmin = req.userPerfil === 'ADMIN';
    const isOwnProfile = req.userId === id;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ error: 'Sem permissão para editar este usuário' });
    }

    // Usuários comuns não podem alterar perfil
    if (!isAdmin && data.perfil) {
      return res.status(403).json({ error: 'Sem permissão para alterar perfil' });
    }

    // Buscar usuário atual
    const usuarioAtual = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioAtual) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar usuário
    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        departamento: true,
        avatar: true,
        avatarUrl: true,
        ativo: true,
        atualizadoEm: true,
      },
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: req.userId!,
        acao: 'EDITAR_USUARIO',
        descricao: `Usuário editado: ${usuario.nome}`,
        dadosAntes: usuarioAtual,
        dadosDepois: usuario,
      },
    });

    res.json(usuario);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// ============================================
// ALTERAR SENHA
// ============================================

router.post('/:id/change-password', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;

    // Verificar permissões
    const isAdmin = req.userPerfil === 'ADMIN';
    const isOwnProfile = req.userId === id;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Usuários comuns precisam fornecer senha atual
    if (!isAdmin || isOwnProfile) {
      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }
    }

    // Atualizar senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { id },
      data: { senha: senhaHash },
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

// ============================================
// RESETAR SENHA (ADMIN)
// ============================================

router.post('/:id/reset-password', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar senha (admin não precisa da senha atual)
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { id },
      data: { senha: senhaHash },
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: req.userId!,
        acao: 'EDITAR_USUARIO',
        descricao: `Senha resetada para usuário: ${usuario.nome}`,
      },
    });

    res.json({ message: 'Senha resetada com sucesso' });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
});

// ============================================
// ATIVAR/DESATIVAR USUÁRIO (ADMIN)
// ============================================

router.patch('/:id/toggle-status', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (id === req.userId) {
      return res.status(400).json({ error: 'Você não pode desativar seu próprio usuário' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: { ativo: !usuario.ativo },
      select: {
        id: true,
        nome: true,
        ativo: true,
      },
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: req.userId!,
        acao: 'DESATIVAR_USUARIO',
        descricao: `Usuário ${usuarioAtualizado.ativo ? 'ativado' : 'desativado'}: ${usuarioAtualizado.nome}`,
      },
    });

    res.json(usuarioAtualizado);
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    res.status(500).json({ error: 'Erro ao alterar status do usuário' });
  }
});

// ============================================
// EXCLUIR USUÁRIO (ADMIN)
// ============================================

router.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (id === req.userId) {
      return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se é o último admin ativo
    if (usuario.perfil === 'ADMIN' && usuario.ativo) {
      const adminsAtivos = await prisma.usuario.count({
        where: { perfil: 'ADMIN', ativo: true },
      });

      if (adminsAtivos <= 1) {
        return res.status(400).json({ error: 'Não é possível excluir o último administrador ativo' });
      }
    }

    await prisma.usuario.delete({ where: { id } });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: req.userId!,
        acao: 'EXCLUIR_USUARIO',
        descricao: `Usuário excluído: ${usuario.nome} (${usuario.email})`,
        dadosAntes: usuario,
      },
    });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

export default router;
