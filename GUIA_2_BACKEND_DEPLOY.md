# 🚀 Guia 2 — Deploy com Backend Real (Railway + GitHub Pages)

> Use este guia quando quiser banco de dados real, dados compartilhados entre usuários,
> e login com autenticação verdadeira.
>
> ⚠️ Faça o Guia 1 primeiro — o frontend precisa estar no GitHub antes.

---

## Arquitetura

```
Usuários
   ↓
GitHub Pages          ← Frontend React (grátis)
   ↓ requisições HTTP
Railway               ← Backend Node.js + PostgreSQL (grátis até $5/mês)
```

---

## Pré-requisitos
- ✅ Guia 1 concluído (frontend no GitHub)
- ✅ Conta no Railway: https://railway.app (login com GitHub)
- ✅ Node.js instalado localmente

---

## Passo 1 — Preparar o backend

No terminal, dentro da pasta `backend/`:

```powershell
cd backend
npm install
```

Copie o arquivo de configuração:

```powershell
copy .env.example .env
```

Abra o `.env` e configure:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/servicedesk_mb"
JWT_SECRET="mude_isso_para_algo_secreto_123456"
JWT_REFRESH_SECRET="mude_isso_tambem_987654321"
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

---

## Passo 2 — Testar backend localmente (opcional)

Se quiser testar antes de subir para o Railway, instale o PostgreSQL:

1. Baixe em: https://www.postgresql.org/download/windows/
2. Durante a instalação, anote a senha do usuário `postgres`
3. Abra o **pgAdmin** ou o **SQL Shell (psql)** e crie o banco:

```sql
CREATE DATABASE servicedesk_mb;
```

Depois rode as migrações:

```powershell
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Backend rodando em http://localhost:3001

---

## Passo 3 — Deploy do backend no Railway

### 3.1 Criar projeto no Railway

1. Acesse https://railway.app
2. Clique em **New Project**
3. Selecione **Deploy from GitHub repo**
4. Escolha seu repositório `service-desk-mb`
5. Quando perguntar a pasta, selecione **backend**

### 3.2 Adicionar banco de dados

1. No projeto, clique em **+ New**
2. Selecione **Database** → **Add PostgreSQL**
3. Railway cria e conecta automaticamente (a variável `DATABASE_URL` é preenchida sozinha)

### 3.3 Configurar variáveis de ambiente

No Railway, clique no serviço **backend** → **Variables** → **Raw Editor** e cole:

```env
JWT_SECRET=TROQUE_POR_ALGO_SECRETO_LONGO_123456789
JWT_REFRESH_SECRET=TROQUE_ESSE_TAMBEM_DIFERENTE_987654321
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://SEU_USUARIO.github.io
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

> Substitua `SEU_USUARIO` pelo seu username do GitHub.

### 3.4 Aguardar deploy

Railway faz o deploy automaticamente. Aguarde 2-3 minutos.

### 3.5 Copiar URL do backend

1. No Railway, clique em **Settings** → **Domains**
2. Copie a URL. Exemplo: `https://service-desk-mb-production.up.railway.app`

Teste no navegador:
```
https://sua-url.railway.app/api/health
```

Deve retornar: `{"status":"ok"}`

---

## Passo 4 — Conectar frontend ao backend

No seu computador, na pasta raiz do projeto, crie o arquivo `.env.production`:

```powershell
# Substitua pela URL real do Railway
echo VITE_API_URL=https://sua-url.railway.app/api > .env.production
```

Faça commit e deploy:

```powershell
git add .
git commit -m "feat: conectar frontend ao backend"
git push origin main
npm run deploy
```

---

## Passo 5 — Testar

1. Acesse `https://SEU_USUARIO.github.io/service-desk-mb/`
2. Faça login com:
   - Email: `gabriel@montebravo.com.br`
   - Senha: `123456`
3. Verifique se os dados carregam do banco

---

## Atualizações futuras

```powershell
# Mudanças no frontend
git add .
git commit -m "Descrição"
git push origin main
npm run deploy

# Railway faz deploy do backend automaticamente ao detectar push
```

---

## Problemas comuns

### CORS Error
Verifique se `FRONTEND_URL` no Railway está correto:
```
FRONTEND_URL=https://SEU_USUARIO.github.io
```

### 502 Bad Gateway
Backend não subiu. Veja os logs no Railway → Deployments.

### Login não funciona
O seed pode não ter rodado. No Railway, force um novo deploy clicando em **Redeploy**.
