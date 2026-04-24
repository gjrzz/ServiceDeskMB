# Backend - Central de Atendimento Monte Bravo

Backend da Central de Atendimento construído com Node.js, TypeScript, Express, Prisma e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos
- **Zod** - Validação de dados

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado e rodando
- npm ou yarn

## 🔧 Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar PostgreSQL

Certifique-se de que o PostgreSQL está rodando. Crie um banco de dados:

```bash
# Entrar no PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE servicedesk_mb;

# Criar usuário (opcional)
CREATE USER servicedesk WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE servicedesk_mb TO servicedesk;

# Sair
\q
```

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/servicedesk_mb?schema=public"
JWT_SECRET="sua_chave_secreta_super_segura_aqui"
JWT_REFRESH_SECRET="sua_chave_refresh_super_segura_aqui"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

**⚠️ IMPORTANTE:** Mude as chaves JWT em produção!

### 4. Executar migrações do Prisma

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações (criar tabelas)
npm run prisma:migrate

# Popular banco com dados de exemplo
npm run prisma:seed
```

### 5. Iniciar servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📊 Prisma Studio

Para visualizar e editar dados do banco graficamente:

```bash
npm run prisma:studio
```

Abrirá em `http://localhost:5555`

## 🔐 Credenciais de Teste

Após executar o seed, você terá:

- **Admin:** `gabriel@montebravo.com.br` / `123456`
- **Usuário 1:** `ana.lima@montebravo.com.br` / `123456`
- **Usuário 2:** `joao.silva@montebravo.com.br` / `123456`

## 📡 Endpoints da API

### Autenticação

- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário logado

### Usuários

- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário
- `POST /api/users` - Criar usuário (admin)
- `PATCH /api/users/:id` - Atualizar usuário
- `POST /api/users/:id/change-password` - Alterar senha
- `PATCH /api/users/:id/toggle-status` - Ativar/desativar (admin)
- `DELETE /api/users/:id` - Excluir usuário (admin)

### Chamados

- `GET /api/tickets` - Listar chamados
- `GET /api/tickets/:id` - Buscar chamado
- `POST /api/tickets` - Criar chamado
- `PATCH /api/tickets/:id/status` - Atualizar status
- `POST /api/tickets/:id/comments` - Adicionar comentário
- `POST /api/tickets/:id/avaliar` - Avaliar chamado

### Base de Conhecimento

- `GET /api/kb` - Listar artigos
- `GET /api/kb/:id` - Buscar artigo
- `POST /api/kb` - Criar artigo (admin)
- `PATCH /api/kb/:id` - Atualizar artigo (admin)
- `DELETE /api/kb/:id` - Deletar artigo (admin)

### Notificações

- `GET /api/notifications` - Listar notificações
- `PATCH /api/notifications/:id/read` - Marcar como lida
- `POST /api/notifications/read-all` - Marcar todas como lidas
- `DELETE /api/notifications/:id` - Deletar notificação

### Upload

- `POST /api/upload` - Upload de arquivo
- `POST /api/upload/avatar` - Upload de avatar (base64)

## 🔒 Autenticação

Todas as rotas (exceto `/api/auth/login`) requerem autenticação via JWT.

Envie o token no header:

```
Authorization: Bearer seu_token_aqui
```

## 🗄️ Estrutura do Banco

```
usuarios
├── chamados (solicitante)
├── chamados (responsável)
├── atividades
├── artigos KB
├── notificações
└── logs de auditoria

chamados
├── atividades
└── anexos

artigos_kb
├── autor
└── editor
```

## 🛠️ Scripts Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Prisma
npm run prisma:generate    # Gerar cliente
npm run prisma:migrate     # Executar migrações
npm run prisma:studio      # Abrir Prisma Studio
npm run prisma:seed        # Popular banco

# Reset completo do banco (CUIDADO!)
npx prisma migrate reset
```

## 📦 Deploy

### Variáveis de ambiente em produção

Certifique-se de configurar:

- `DATABASE_URL` - URL do PostgreSQL em produção
- `JWT_SECRET` - Chave secreta forte
- `JWT_REFRESH_SECRET` - Chave secreta forte (diferente)
- `NODE_ENV=production`
- `FRONTEND_URL` - URL do frontend em produção

### Recomendações

- Use um serviço gerenciado de PostgreSQL (AWS RDS, Heroku Postgres, Supabase, etc)
- Configure HTTPS
- Use variáveis de ambiente seguras
- Configure backup automático do banco
- Monitore logs e erros (Sentry, LogRocket, etc)

## 🐛 Troubleshooting

### Erro de conexão com PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Iniciar PostgreSQL
sudo service postgresql start
```

### Erro "relation does not exist"

```bash
# Executar migrações novamente
npm run prisma:migrate
```

### Erro de permissão no banco

```bash
# Dar permissões ao usuário
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE servicedesk_mb TO seu_usuario;
```

## 📝 Próximos Passos

- [ ] Implementar WebSocket para atualizações em tempo real
- [ ] Adicionar envio de e-mails (Nodemailer)
- [ ] Implementar busca full-text
- [ ] Adicionar testes automatizados
- [ ] Implementar rate limiting por usuário
- [ ] Adicionar logs estruturados (Winston)
- [ ] Implementar cache (Redis)

## 📄 Licença

MIT
