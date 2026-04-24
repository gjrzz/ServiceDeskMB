# 🚀 Guia Completo de Deploy - Frontend + Backend

## 📋 Visão Geral

**Problema:** GitHub Pages só hospeda frontend estático (sem Node.js)

**Solução:** Hospedar frontend e backend separadamente

```
Frontend (React)          Backend (Node.js + PostgreSQL)
     ↓                              ↓
GitHub Pages              Railway/Render/Heroku
Vercel/Netlify            Fly.io/Supabase
```

---

## 🎯 Opções Recomendadas (GRÁTIS)

### ⭐ Opção 1: Vercel (Frontend) + Railway (Backend) - RECOMENDADO

**Vantagens:**
- ✅ 100% gratuito para começar
- ✅ Deploy automático via Git
- ✅ HTTPS automático
- ✅ Fácil de configurar
- ✅ PostgreSQL incluído

**Limites gratuitos:**
- Vercel: Ilimitado para hobby
- Railway: $5/mês de crédito grátis (~500h de servidor)

---

### ⭐ Opção 2: Netlify (Frontend) + Render (Backend)

**Vantagens:**
- ✅ 100% gratuito
- ✅ PostgreSQL gratuito
- ✅ Deploy automático

**Limites:**
- Render: Servidor "dorme" após 15min de inatividade (demora ~30s para acordar)

---

### ⭐ Opção 3: Vercel Full-Stack (Frontend + Backend juntos)

**Vantagens:**
- ✅ Tudo em um lugar
- ✅ Gratuito

**Desvantagens:**
- ❌ Precisa de banco externo (Supabase, Neon, etc)
- ❌ Serverless (não ideal para WebSocket)

---

## 🚀 DEPLOY PASSO A PASSO

## Opção 1: Vercel + Railway (RECOMENDADO)

### Parte 1: Deploy do Backend no Railway

#### 1. Criar conta no Railway

Acesse: https://railway.app/
- Faça login com GitHub

#### 2. Criar novo projeto

```bash
# No Railway Dashboard:
1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Conecte seu repositório
4. Selecione a pasta "backend"
```

#### 3. Adicionar PostgreSQL

```bash
# No projeto Railway:
1. Clique em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. Railway cria automaticamente e conecta ao backend
```

#### 4. Configurar variáveis de ambiente

```bash
# No Railway, vá em "Variables" e adicione:

JWT_SECRET=sua_chave_super_secreta_aqui_mude_123456789
JWT_REFRESH_SECRET=sua_chave_refresh_super_secreta_987654321
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://seu-site.vercel.app
PORT=3001
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# DATABASE_URL é criado automaticamente pelo Railway
```

#### 5. Configurar build

Crie `railway.json` na pasta `backend/`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run prisma:generate && npm run build"
  },
  "deploy": {
    "startCommand": "npm run prisma:migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 6. Deploy

```bash
# Railway faz deploy automático!
# Aguarde ~2-3 minutos

# Após deploy, copie a URL:
# Exemplo: https://servicedesk-backend-production.up.railway.app
```

#### 7. Testar backend

```bash
curl https://sua-url-railway.up.railway.app/api/health
```

---

### Parte 2: Deploy do Frontend no Vercel

#### 1. Criar conta no Vercel

Acesse: https://vercel.com/
- Faça login com GitHub

#### 2. Preparar frontend

Crie `.env.production` na raiz do projeto:

```env
VITE_API_URL=https://sua-url-railway.up.railway.app/api
```

Atualize `src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});
```

#### 3. Deploy no Vercel

```bash
# Opção A: Via Dashboard
1. Clique em "Add New Project"
2. Importe seu repositório
3. Configure:
   - Framework Preset: Vite
   - Root Directory: ServiceDeskMB (se necessário)
   - Build Command: npm run build
   - Output Directory: dist
4. Adicione variável de ambiente:
   - VITE_API_URL = https://sua-url-railway.up.railway.app/api
5. Clique em "Deploy"

# Opção B: Via CLI
npm install -g vercel
cd ServiceDeskMB
vercel
```

#### 4. Atualizar CORS no backend

No Railway, adicione a URL do Vercel em `FRONTEND_URL`:

```env
FRONTEND_URL=https://seu-site.vercel.app
```

#### 5. Testar

Acesse: `https://seu-site.vercel.app`

---

## 🔧 Opção 2: Netlify + Render

### Backend no Render

#### 1. Criar conta

Acesse: https://render.com/
- Faça login com GitHub

#### 2. Criar Web Service

```bash
1. Clique em "New +" → "Web Service"
2. Conecte seu repositório
3. Configure:
   - Name: servicedesk-backend
   - Root Directory: backend
   - Environment: Node
   - Build Command: npm install && npm run prisma:generate && npm run build
   - Start Command: npm run prisma:migrate deploy && npm start
```

#### 3. Adicionar PostgreSQL

```bash
1. Clique em "New +" → "PostgreSQL"
2. Nome: servicedesk-db
3. Copie a "Internal Database URL"
```

#### 4. Conectar banco ao backend

```bash
# No Web Service, vá em "Environment" e adicione:
DATABASE_URL=cole_a_url_do_banco_aqui
JWT_SECRET=sua_chave_secreta
JWT_REFRESH_SECRET=sua_chave_refresh
NODE_ENV=production
FRONTEND_URL=https://seu-site.netlify.app
```

#### 5. Deploy

Render faz deploy automático!

---

### Frontend no Netlify

#### 1. Criar conta

Acesse: https://netlify.com/
- Faça login com GitHub

#### 2. Deploy

```bash
# Opção A: Drag & Drop
1. Build local: npm run build
2. Arraste a pasta "dist" para Netlify

# Opção B: Git (recomendado)
1. Clique em "Add new site" → "Import from Git"
2. Conecte repositório
3. Configure:
   - Base directory: ServiceDeskMB
   - Build command: npm run build
   - Publish directory: dist
4. Adicione variável:
   - VITE_API_URL = https://sua-url-render.onrender.com/api
5. Deploy
```

---

## 🐳 Opção 3: Docker + VPS (Avançado)

Se você tem um VPS (DigitalOcean, AWS, etc):

### 1. Criar Dockerfile

`backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run prisma:generate
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npm run prisma:migrate deploy && npm start"]
```

### 2. Docker Compose

`docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: servicedesk_mb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: sua_senha_aqui
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:sua_senha_aqui@postgres:5432/servicedesk_mb
      JWT_SECRET: sua_chave_secreta
      JWT_REFRESH_SECRET: sua_chave_refresh
      NODE_ENV: production
      FRONTEND_URL: https://seu-dominio.com
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 3. Deploy

```bash
# No VPS:
git clone seu-repositorio
cd seu-repositorio
docker-compose up -d
```

---

## 📊 Comparação de Serviços

| Serviço | Preço | PostgreSQL | Auto-sleep | HTTPS | Deploy |
|---------|-------|------------|------------|-------|--------|
| **Railway** | $5/mês grátis | ✅ Incluído | ❌ Não | ✅ Sim | Git |
| **Render** | Grátis | ✅ Grátis | ⚠️ 15min | ✅ Sim | Git |
| **Heroku** | $5-7/mês | $5/mês | ❌ Não | ✅ Sim | Git |
| **Fly.io** | Grátis | ⚠️ Externo | ❌ Não | ✅ Sim | CLI |
| **Vercel** | Grátis | ⚠️ Externo | ❌ Não | ✅ Sim | Git |
| **Netlify** | Grátis | ⚠️ Externo | ❌ Não | ✅ Sim | Git |

**Legenda:**
- ✅ Sim / Incluído
- ❌ Não
- ⚠️ Com limitações

---

## 🎯 Recomendação Final

### Para começar (GRÁTIS):
```
Frontend: Vercel
Backend: Railway (com PostgreSQL incluído)
```

### Para produção (pequeno):
```
Frontend: Vercel
Backend: Railway ($5/mês)
Banco: Railway (incluído)
```

### Para produção (médio/grande):
```
Frontend: Vercel/Cloudflare
Backend: AWS/DigitalOcean
Banco: AWS RDS/Supabase
```

---

## 🔒 Checklist de Segurança para Produção

Antes de colocar no ar:

- [ ] Mudar JWT_SECRET e JWT_REFRESH_SECRET
- [ ] Configurar CORS corretamente
- [ ] Ativar HTTPS (automático na maioria dos serviços)
- [ ] Configurar rate limiting
- [ ] Adicionar monitoramento (Sentry, LogRocket)
- [ ] Configurar backup do banco
- [ ] Testar todos os endpoints
- [ ] Configurar variáveis de ambiente
- [ ] Remover console.logs sensíveis
- [ ] Adicionar logs estruturados

---

## 🆘 Problemas Comuns

### CORS Error

**Erro:** `Access to XMLHttpRequest blocked by CORS`

**Solução:** Adicione a URL do frontend em `FRONTEND_URL` no backend

```env
FRONTEND_URL=https://seu-site.vercel.app
```

### 502 Bad Gateway

**Erro:** Backend não responde

**Solução:** 
1. Verifique se backend está rodando
2. Verifique logs do serviço
3. Verifique se migrações foram executadas

### Database Connection Error

**Erro:** `Can't reach database server`

**Solução:**
1. Verifique DATABASE_URL
2. Verifique se PostgreSQL está rodando
3. Verifique firewall/security groups

---

## 📝 Exemplo Completo de Deploy

### 1. Preparar código

```bash
# Criar .env.production
echo "VITE_API_URL=https://seu-backend.railway.app/api" > .env.production

# Commit
git add .
git commit -m "chore: preparar para deploy"
git push
```

### 2. Deploy Backend (Railway)

```bash
1. Acesse railway.app
2. New Project → Deploy from GitHub
3. Selecione repositório
4. Add PostgreSQL
5. Configure variáveis de ambiente
6. Deploy automático
7. Copie URL: https://xxx.railway.app
```

### 3. Deploy Frontend (Vercel)

```bash
1. Acesse vercel.com
2. New Project → Import Git Repository
3. Configure build settings
4. Adicione VITE_API_URL
5. Deploy
6. Acesse: https://xxx.vercel.app
```

### 4. Testar

```bash
# Testar backend
curl https://seu-backend.railway.app/api/health

# Testar frontend
# Abra https://seu-frontend.vercel.app
# Faça login
```

---

## 💰 Custos Estimados

### Hobby/Pessoal (Grátis)
- Frontend: Vercel (grátis)
- Backend: Railway ($5 crédito/mês)
- **Total: R$ 0/mês** (até acabar crédito)

### Pequena Empresa
- Frontend: Vercel (grátis)
- Backend: Railway ($5-10/mês)
- **Total: R$ 25-50/mês**

### Média Empresa
- Frontend: Vercel Pro ($20/mês)
- Backend: DigitalOcean ($12/mês)
- Banco: DigitalOcean ($15/mês)
- **Total: R$ 235/mês**

---

## 🚀 Próximos Passos

1. ✅ Escolher serviço de hospedagem
2. ✅ Fazer deploy do backend
3. ✅ Fazer deploy do frontend
4. ✅ Testar integração
5. 🔜 Configurar domínio próprio
6. 🔜 Configurar monitoramento
7. 🔜 Configurar backup automático

---

**Recomendo começar com Vercel + Railway!** É o mais fácil e tem tudo incluído. 🚀

Quer que eu te ajude com o deploy agora?
