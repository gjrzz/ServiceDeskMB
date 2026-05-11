import { prisma } from '../prisma';

/**
 * Revoga todos os refresh tokens de um usuário
 * Usado quando usuário é desativado ou senha alterada
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  try {
    await prisma.refreshToken.deleteMany({
      where: { usuarioId: userId },
    });

    console.log(`✅ Todos os tokens revogados para usuário: ${userId}`);
  } catch (error) {
    console.error(`❌ Erro ao revogar tokens do usuário ${userId}:`, error);
    throw error;
  }
}

/**
 * Limpa tokens expirados do banco
 * Deve ser executado periodicamente (ex: diariamente)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`🧹 ${result.count} tokens expirados removidos`);
    return result.count;
  } catch (error) {
    console.error('❌ Erro ao limpar tokens expirados:', error);
    throw error;
  }
}