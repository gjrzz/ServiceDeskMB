#!/bin/bash

# Script de setup automático do backend
# Central de Atendimento Monte Bravo

echo "🚀 Iniciando setup do backend..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) encontrado${NC}"

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL não encontrado.${NC}"
    echo "Por favor, instale PostgreSQL 14+ antes de continuar."
    echo ""
    echo "macOS: brew install postgresql@14"
    echo "Linux: sudo apt install postgresql"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL encontrado${NC}"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependências instaladas${NC}"

# Verificar se .env existe
if [ ! -f .env ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo "Copiando .env.example para .env..."
    cp .env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edite o arquivo .env e configure a DATABASE_URL${NC}"
    echo "Exemplo: DATABASE_URL=\"postgresql://usuario:senha@localhost:5432/servicedesk_mb\""
    echo ""
    read -p "Pressione ENTER depois de configurar o .env..."
fi

# Criar banco de dados
echo ""
echo "🗄️  Configurando banco de dados..."
echo ""
echo "Vou tentar criar o banco 'servicedesk_mb'..."
echo "Se pedir senha, use a senha do usuário postgres."
echo ""

createdb servicedesk_mb 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Banco de dados criado${NC}"
else
    echo -e "${YELLOW}⚠️  Banco já existe ou erro ao criar (isso é normal se já existir)${NC}"
fi

# Gerar cliente Prisma
echo ""
echo "🔧 Gerando cliente Prisma..."
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao gerar cliente Prisma${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Cliente Prisma gerado${NC}"

# Executar migrações
echo ""
echo "📊 Executando migrações do banco..."
npm run prisma:migrate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao executar migrações${NC}"
    echo ""
    echo "Verifique:"
    echo "1. PostgreSQL está rodando?"
    echo "2. DATABASE_URL no .env está correto?"
    echo "3. Banco de dados existe?"
    exit 1
fi

echo -e "${GREEN}✅ Migrações executadas${NC}"

# Popular banco com dados de exemplo
echo ""
echo "🌱 Populando banco com dados de exemplo..."
npm run prisma:seed

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao popular banco${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Banco populado com sucesso${NC}"

# Sucesso!
echo ""
echo -e "${GREEN}🎉 Setup concluído com sucesso!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📧 Credenciais de teste:"
echo ""
echo "  Admin:"
echo "    Email: gabriel@montebravo.com.br"
echo "    Senha: 123456"
echo ""
echo "  Usuário 1:"
echo "    Email: ana.lima@montebravo.com.br"
echo "    Senha: 123456"
echo ""
echo "  Usuário 2:"
echo "    Email: joao.silva@montebravo.com.br"
echo "    Senha: 123456"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Para iniciar o servidor:"
echo ""
echo "   npm run dev"
echo ""
echo "📊 Para abrir o Prisma Studio:"
echo ""
echo "   npm run prisma:studio"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
