import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../server';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

// ============================================
// LOGIN
// ============================================

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = loginSchema.parse(req.body);

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        perfil: true,
        departamento: true,
        avatar: true,
        avatarUrl: true,
        ativo: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!usuario.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar tokens
    const accessToken = generateAccessToken({
      userId: usuario.id,
      perfil: usuario.perfil,
    });

    const refreshToken = generateRefreshToken({
      userId: usuario.id,
      perfil: usuario.perfil,
    });

    // Salvar refresh token no banco
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        usuarioId: usuario.id,
        expiresAt,
      },
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        acao: 'LOGIN',
        descricao: `Login realizado: ${usuario.email}`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // Remover senha da resposta
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({
      usuario: usuarioSemSenha,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ============================================
// REFRESH TOKEN
// ============================================

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);

    // Verificar se token existe no banco
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { usuario: true },
    });

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }

    // Verificar se token expirou
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      return res.status(401).json({ error: 'Refresh token expirado' });
    }

    // Verificar assinatura do token
    const payload = verifyRefreshToken(refreshToken);

    // Gerar novo access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      perfil: payload.perfil,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro no refresh:', error);
    res.status(401).json({ error: 'Erro ao renovar token' });
  }
});

// ============================================
// LOGOUT
// ============================================

router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remover refresh token do banco
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: req.userId!,
        acao: 'LOGOUT',
        descricao: 'Logout realizado',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
});

// ============================================
// VERIFICAR TOKEN
// ============================================

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.userId },
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

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

export default router;
