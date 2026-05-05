-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'USUARIO', 'MANAGER');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXO', 'MEDIO', 'ALTO', 'CRITICO');

-- CreateEnum
CREATE TYPE "StatusChamado" AS ENUM ('ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_APROVACAO', 'AGUARDANDO', 'RESOLVIDO', 'FECHADO', 'CONTESTADO');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('HARDWARE', 'SOFTWARE', 'REDE', 'ACESSO', 'OUTROS');

-- CreateEnum
CREATE TYPE "TipoAtividade" AS ENUM ('COMENTARIO', 'COMENTARIO_INTERNO', 'MUDANCA_STATUS', 'MUDANCA_PRIORIDADE', 'ATRIBUICAO', 'CONTESTACAO', 'REANALISE', 'AVALIACAO');

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('CHAMADO_CRIADO', 'CHAMADO_ATUALIZADO', 'CHAMADO_RESOLVIDO', 'COMENTARIO_ADICIONADO', 'STATUS_ALTERADO', 'PRIORIDADE_ALTERADA', 'KB_CRIADO', 'KB_EDITADO', 'USUARIO_CRIADO', 'SOLICITAR_AVALIACAO');

-- CreateEnum
CREATE TYPE "AcaoAuditoria" AS ENUM ('LOGIN', 'LOGOUT', 'CRIAR_USUARIO', 'EDITAR_USUARIO', 'DESATIVAR_USUARIO', 'EXCLUIR_USUARIO', 'CRIAR_CHAMADO', 'EDITAR_CHAMADO', 'EXCLUIR_CHAMADO', 'CRIAR_ARTIGO', 'EDITAR_ARTIGO', 'EXCLUIR_ARTIGO', 'ALTERAR_CONFIGURACAO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'USUARIO',
    "departamento" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chamados" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "prioridade" "Prioridade" NOT NULL DEFAULT 'MEDIO',
    "status" "StatusChamado" NOT NULL DEFAULT 'ABERTO',
    "categoria" "Categoria" NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "responsavelId" TEXT,
    "slaHoras" INTEGER NOT NULL DEFAULT 24,
    "slaVencimento" TIMESTAMP(3),
    "slaCumprido" BOOLEAN,
    "avaliacaoNota" INTEGER,
    "avaliacaoResolvido" BOOLEAN,
    "avaliacaoComentario" TEXT,
    "avaliacaoData" TIMESTAMP(3),
    "avaliacaoIgnorada" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "resolvidoEm" TIMESTAMP(3),
    "fechadoEm" TIMESTAMP(3),

    CONSTRAINT "chamados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades_chamado" (
    "id" TEXT NOT NULL,
    "chamadoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "tipo" "TipoAtividade" NOT NULL,
    "texto" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNovo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atividades_chamado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anexos" (
    "id" TEXT NOT NULL,
    "chamadoId" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anexos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artigos_kb" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tags" TEXT[],
    "autorId" TEXT NOT NULL,
    "editorId" TEXT,
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "util" INTEGER NOT NULL DEFAULT 0,
    "naoUtil" INTEGER NOT NULL DEFAULT 0,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artigos_kb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "linkTipo" TEXT,
    "linkId" TEXT,
    "destinatarioId" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" "AcaoAuditoria" NOT NULL,
    "descricao" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_ativo_idx" ON "usuarios"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuarioId_idx" ON "refresh_tokens"("usuarioId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "chamados_solicitanteId_idx" ON "chamados"("solicitanteId");

-- CreateIndex
CREATE INDEX "chamados_responsavelId_idx" ON "chamados"("responsavelId");

-- CreateIndex
CREATE INDEX "chamados_status_idx" ON "chamados"("status");

-- CreateIndex
CREATE INDEX "chamados_prioridade_idx" ON "chamados"("prioridade");

-- CreateIndex
CREATE INDEX "chamados_categoria_idx" ON "chamados"("categoria");

-- CreateIndex
CREATE INDEX "chamados_criadoEm_idx" ON "chamados"("criadoEm");

-- CreateIndex
CREATE INDEX "atividades_chamado_chamadoId_idx" ON "atividades_chamado"("chamadoId");

-- CreateIndex
CREATE INDEX "atividades_chamado_autorId_idx" ON "atividades_chamado"("autorId");

-- CreateIndex
CREATE INDEX "atividades_chamado_criadoEm_idx" ON "atividades_chamado"("criadoEm");

-- CreateIndex
CREATE INDEX "anexos_chamadoId_idx" ON "anexos"("chamadoId");

-- CreateIndex
CREATE INDEX "artigos_kb_autorId_idx" ON "artigos_kb"("autorId");

-- CreateIndex
CREATE INDEX "artigos_kb_publicado_idx" ON "artigos_kb"("publicado");

-- CreateIndex
CREATE INDEX "artigos_kb_categoria_idx" ON "artigos_kb"("categoria");

-- CreateIndex
CREATE INDEX "notificacoes_destinatarioId_idx" ON "notificacoes"("destinatarioId");

-- CreateIndex
CREATE INDEX "notificacoes_lida_idx" ON "notificacoes"("lida");

-- CreateIndex
CREATE INDEX "notificacoes_criadoEm_idx" ON "notificacoes"("criadoEm");

-- CreateIndex
CREATE INDEX "logs_auditoria_usuarioId_idx" ON "logs_auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "logs_auditoria_acao_idx" ON "logs_auditoria"("acao");

-- CreateIndex
CREATE INDEX "logs_auditoria_criadoEm_idx" ON "logs_auditoria"("criadoEm");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividades_chamado" ADD CONSTRAINT "atividades_chamado_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividades_chamado" ADD CONSTRAINT "atividades_chamado_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "chamados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos_kb" ADD CONSTRAINT "artigos_kb_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos_kb" ADD CONSTRAINT "artigos_kb_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
