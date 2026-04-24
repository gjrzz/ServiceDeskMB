# 🚀 Guia Rápido de Setup do Backend

Este guia vai te ajudar a configurar o backend em poucos minutos.

## ⚡ Setup Rápido (5 minutos)

### 1️⃣ Instalar PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Baixe o instalador em: https://www.postgresql.org/download/windows/

### 2️⃣ Criar Banco de Dados

```bash
# Entrar no PostgreSQL
psql postgres

# Criar banco
CREATE DATABASE servicedesk_mb;

# Sair
\q
```

### 3️⃣ Instalar Dependências do Backend

```bash
cd ServiceDeskMB/backend
npm install
```

### 4️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env (use seu editor favorito)
nano .env
```

Configuração mínima no `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/servicedesk_mb?schema=public"
JWT_SECRET="mude_isso_em_producao_123456789"
JWT_REFRESH_SECRET="mude_isso_tambem_em_producao_987654321"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### 5️⃣ Executar Migrações e Seed

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar tabelas no banco
npm run prisma:migrate

# Popular com dados de exemplo
npm run prisma:seed
```

### 6️⃣ Iniciar Servidor

```bash
npm run dev
```

✅ **Pronto!** Backend rodando em `http://localhost:3001`

---

## 🧪 Testar a API

### Teste 1: Health Check

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### Teste 2: Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gabriel@montebravo.com.br",
    "senha": "123456"
  }'
```

Resposta esperada:
```json
{
  "usuario": {
    "id": "...",
    "nome": "Gabriel Juarez",
    "email": "gabriel@montebravo.com.br",
    "perfil": "ADMIN",
    ...
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Teste 3: Listar Usuários (com autenticação)

```bash
# Substitua SEU_TOKEN pelo accessToken recebido no login
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🎨 Visualizar Banco de Dados

Abra o Prisma Studio para ver os dados graficamente:

```bash
npm run prisma:studio
```

Abrirá em `http://localhost:5555`

---

## 🔐 Credenciais de Teste

Após o seed, você terá 3 usuários:

| Nome | E-mail | Senha | Perfil |
|------|--------|-------|--------|
| Gabriel Juarez | gabriel@montebravo.com.br | 123456 | ADMIN |
| Ana Lima | ana.lima@montebravo.com.br | 123456 | USUARIO |
| João Silva | joao.silva@montebravo.com.br | 123456 | USUARIO |

---

## 🐛 Problemas Comuns

### ❌ Erro: "Can't reach database server"

**Solução:** PostgreSQL não está rodando.

```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Verificar status
psql postgres -c "SELECT version();"
```

### ❌ Erro: "password authentication failed"

**Solução:** Senha do PostgreSQL incorreta no `.env`

```bash
# Resetar senha do usuário postgres (Linux/macOS)
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nova_senha';
\q

# Atualizar DATABASE_URL no .env
DATABASE_URL="postgresql://postgres:nova_senha@localhost:5432/servicedesk_mb"
```

### ❌ Erro: "Port 3001 already in use"

**Solução:** Porta já está em uso.

```bash
# Encontrar processo usando a porta
lsof -i :3001

# Matar processo
kill -9 PID_DO_PROCESSO

# Ou mudar a porta no .env
PORT=3002
```

### ❌ Erro: "prisma command not found"

**Solução:** Instalar dependências novamente.

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Estrutura de Pastas

```
backend/
├── prisma/
│   ├── schema.prisma      # Schema do banco
│   └── seed.ts            # Dados iniciais
├── src/
│   ├── middleware/        # Autenticação, etc
│   ├── routes/            # Rotas da API
│   ├── utils/             # Funções auxiliares
│   └── server.ts          # Servidor principal
├── .env                   # Variáveis de ambiente
├── .env.example           # Exemplo de .env
├── package.json           # Dependências
└── tsconfig.json          # Config TypeScript
```

---

## 🔄 Próximos Passos

1. ✅ Backend configurado e rodando
2. 🔜 Conectar frontend ao backend
3. 🔜 Testar fluxo completo
4. 🔜 Deploy em produção

---

## 💡 Dicas

- Use **Prisma Studio** para visualizar e editar dados facilmente
- Mantenha o terminal do backend aberto para ver logs
- Use **Postman** ou **Insomnia** para testar endpoints
- Leia o `README.md` do backend para mais detalhes

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique os logs do terminal
2. Confira se PostgreSQL está rodando
3. Valide o arquivo `.env`
4. Tente executar `npm run prisma:migrate` novamente
5. Em último caso, delete o banco e recrie tudo:

```bash
# CUIDADO: Isso apaga todos os dados!
npx prisma migrate reset
npm run prisma:seed
```
