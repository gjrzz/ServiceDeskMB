import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.logAuditoria.deleteMany();
  await prisma.notificacao.deleteMany();
  await prisma.anexo.deleteMany();
  await prisma.atividadeChamado.deleteMany();
  await prisma.chamado.deleteMany();
  await prisma.artigoKB.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.usuario.deleteMany();

  // Criar usuários
  const senhaHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.usuario.create({
    data: {
      nome: 'Gabriel Juarez',
      email: 'gabriel@montebravo.com.br',
      senha: senhaHash,
      perfil: 'ADMIN',
      departamento: 'TI',
      avatar: 'GJ',
      ativo: true,
    },
  });

  const usuario1 = await prisma.usuario.create({
    data: {
      nome: 'Ana Lima',
      email: 'ana.lima@montebravo.com.br',
      senha: senhaHash,
      perfil: 'USUARIO',
      departamento: 'Financeiro',
      avatar: 'AL',
      ativo: true,
    },
  });

  const usuario2 = await prisma.usuario.create({
    data: {
      nome: 'João Silva',
      email: 'joao.silva@montebravo.com.br',
      senha: senhaHash,
      perfil: 'USUARIO',
      departamento: 'Comercial',
      avatar: 'JS',
      ativo: true,
    },
  });

  console.log('✅ Usuários criados');

  // Criar chamados de exemplo
  const chamado1 = await prisma.chamado.create({
    data: {
      titulo: 'VPN não conecta após troca de senha',
      descricao: 'Troquei minha senha hoje de manhã e agora o cliente VPN diz que a autenticação falhou.',
      prioridade: 'ALTO',
      status: 'ABERTO',
      categoria: 'REDE',
      solicitanteId: usuario1.id,
      responsavelId: admin.id,
      slaHoras: 8,
      slaVencimento: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
  });

  const chamado2 = await prisma.chamado.create({
    data: {
      titulo: 'Solicitação de acesso: pasta SharePoint Financeiro',
      descricao: 'Preciso de acesso à pasta Financeiro para a próxima auditoria.',
      prioridade: 'MEDIO',
      status: 'AGUARDANDO_APROVACAO',
      categoria: 'ACESSO',
      solicitanteId: usuario2.id,
      slaHoras: 24,
      slaVencimento: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Chamados criados');

  // Criar atividades
  await prisma.atividadeChamado.create({
    data: {
      chamadoId: chamado1.id,
      autorId: usuario1.id,
      tipo: 'COMENTARIO',
      texto: 'Chamado criado: VPN não conecta após troca de senha',
    },
  });

  await prisma.atividadeChamado.create({
    data: {
      chamadoId: chamado1.id,
      autorId: admin.id,
      tipo: 'COMENTARIO',
      texto: 'Vou verificar as configurações do servidor VPN.',
    },
  });

  console.log('✅ Atividades criadas');

  // Criar artigos KB
  await prisma.artigoKB.create({
    data: {
      titulo: 'Como redefinir sua senha corporativa',
      conteudo: `# Como redefinir sua senha corporativa

## Passo 1: Acesse o portal
Acesse https://portal.montebravo.com.br

## Passo 2: Clique em "Esqueci minha senha"
Na tela de login, clique no link "Esqueci minha senha"

## Passo 3: Digite seu e-mail
Digite seu e-mail corporativo e clique em "Enviar"

## Passo 4: Verifique seu e-mail
Você receberá um link para redefinir sua senha

## Passo 5: Crie uma nova senha
A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números.`,
      categoria: 'Acesso',
      tags: ['senha', 'acesso', 'login'],
      publicado: true,
      autorId: admin.id,
      visualizacoes: 1240,
      util: 95,
      naoUtil: 5,
    },
  });

  await prisma.artigoKB.create({
    data: {
      titulo: 'Guia de configuração da VPN — Windows e Mac',
      conteudo: `# Guia de configuração da VPN

## Windows

1. Baixe o cliente VPN em https://vpn.montebravo.com.br
2. Execute o instalador
3. Configure com as credenciais fornecidas

## Mac

1. Baixe o cliente VPN para Mac
2. Arraste para a pasta Aplicativos
3. Configure com as credenciais fornecidas`,
      categoria: 'Rede',
      tags: ['vpn', 'rede', 'acesso remoto'],
      publicado: true,
      autorId: admin.id,
      visualizacoes: 856,
      util: 88,
      naoUtil: 12,
    },
  });

  console.log('✅ Artigos KB criados');

  // Criar notificações
  await prisma.notificacao.create({
    data: {
      tipo: 'CHAMADO_CRIADO',
      titulo: 'Novo Chamado',
      mensagem: 'Ana Lima criou: VPN não conecta após troca de senha',
      linkTipo: 'chamado',
      linkId: chamado1.id,
      destinatarioId: admin.id,
      lida: false,
    },
  });

  console.log('✅ Notificações criadas');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📧 Credenciais de teste:');
  console.log('Admin: gabriel@montebravo.com.br / 123456');
  console.log('Usuário 1: ana.lima@montebravo.com.br / 123456');
  console.log('Usuário 2: joao.silva@montebravo.com.br / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
