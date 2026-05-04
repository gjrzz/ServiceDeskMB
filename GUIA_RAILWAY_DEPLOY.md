# 🚂 Guia Completo: Deploy no Railway.app

## 📋 Índice
1. [Criar Conta no Railway](#1-criar-conta-no-railway)
2. [Criar Projeto e Banco de Dados](#2-criar-projeto-e-banco-de-dados)
3. [Configurar Variáveis de Ambiente](#3-configurar-variáveis-de-ambiente)
4. [Deploy do Backend](#4-deploy-do-backend)
5. [Configurar Frontend](#5-configurar-frontend)
6. [Testar a Aplicação](#6-testar-a-aplicação)

---

## 1️⃣ Criar Conta no Railway

### Passo 1.1: Acessar o Railway
1. Acesse: https://railway.app
2. Clique em **"Login"**
3. Escolha **"Login with GitHub"**
4. Autorize o Railway a acessar seus repositórios

### Passo 1.2: Verificar Créditos
- Você ganha **$5 de crédito grátis por mês**
- Suficiente para um backend pequeno/médio
- Não precisa cartão de crédito inicialmente

---

## 2️⃣ Criar Projeto e Banco de Dados

### Passo 2.1: Criar Novo Projeto
1. No dashboard, clique em **"New Project"**
2. Escolha **"Deploy from GitHub repo"**
3. Selecione o repositório **ServiceDeskMB**
4. Railway vai detectar automaticamente que é um projeto Node.js

### Passo 2.2: Adicionar PostgreSQL
1. No seu projeto, clique em **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Railway vai criar um banco automaticamente

### Passo 2.3: Obter URL do Banco
1. Clique no serviço **PostgreSQL**
2. Vá na aba **"Connect"**
3. Copie a **"Postgres Connection URL"**
   - Formato: `postgresql://usuario:senha@host:porta/database`
postgresql://postgres:ufsYYuaRifhQprxwGjmJARpflwPnrAGi@tramway.proxy.rlwy.net:27021/railway
---

## 3️⃣ Configurar Variáveis de Ambiente

### Passo 3.1: Acessar Configurações
1. Clique no serviço do **Backend** (não no PostgreSQL)
2. Vá na aba **"Variables"**
3. Clique em **"+ New Variable"**

### Passo 3.2: Adicionar Variáveis Obrigatórias

Adicione cada variável abaixo (uma por vez):

#### 🔐 **DATABASE_URL**
```
Valor: Cole a URL do PostgreSQL que você copiou
Exemplo: postgresql://postgres:senha123@containers-us-west-xxx.railway.app:5432/railway
```

#### 🔑 **JWT_SECRET**
```
Valor: Gere uma chave aleatória forte
Exemplo: 8f3a9b2c7d1e6f4a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```
**Como gerar:**
- Online: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")
- Terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### 🔑 **JWT_REFRESH_SECRET**
```
Valor: Outra chave aleatória diferente da JWT_SECRET
Exemplo: 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2
```

#### ⏰ **JWT_EXPIRES_IN**
```
Valor: 15m
```

#### ⏰ **JWT_REFRESH_EXPIRES_IN**
```
Valor: 7d
```

#### 🌐 **NODE_ENV**
```
Valor: production
```

#### 🌐 **FRONTEND_URL**
```
Valor: https://seu-usuario.github.io/ServiceDeskMB
(Substitua pelo seu GitHub Pages URL)
```

#### 📦 **PORT**
```
Valor: 3001
(Railway também aceita a variável $PORT automática)
```

#### 📁 **UPLOAD_DIR**
```
Valor: ./uploads
```

#### 📏 **MAX_FILE_SIZE**
```
Valor: 10485760
(10MB em bytes)
```

#### 🛡️ **RATE_LIMIT_WINDOW_MS**
```
Valor: 900000
(15 minutos em milissegundos)
```

#### 🛡️ **RATE_LIMIT_MAX_REQUESTS**
```
Valor: 100
```

### Passo 3.3: Verificar Variáveis
Sua lista deve ter **11 variáveis** no total:
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ JWT_REFRESH_SECRET
- ✅ JWT_EXPIRES_IN
- ✅ JWT_REFRESH_EXPIRES_IN
- ✅ NODE_ENV
- ✅ FRONTEND_URL
- ✅ PORT
- ✅ UPLOAD_DIR
- ✅ MAX_FILE_SIZE
- ✅ RATE_LIMIT_WINDOW_MS
- ✅ RATE_LIMIT_MAX_REQUESTS

---

## 4️⃣ Deploy do Backend

### Passo 4.1: Criar arquivo railway.json
O Railway agora usa um arquivo de configuração. Crie na **raiz do projeto**:

**Arquivo: `railway.json`**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "cd backend && npx prisma migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Passo 4.2: Commit e Push
```bash
git add railway.json
git commit -m "Add Railway configuration"
git push origin main
```

O Railway vai detectar automaticamente este arquivo!

### Passo 4.3: Fazer Deploy
1. O Railway detecta automaticamente o `railway.json`
2. Vai em **"Deployments"** para ver o progresso
3. Aguarde o build (pode levar 2-5 minutos)
4. O Railway vai:
   - Instalar dependências
   - Gerar Prisma Client
   - Compilar TypeScript
   - Executar migrations
   - Iniciar o servidor

### Passo 4.4: Verificar Logs
1. Clique em **"View Logs"**
2. Procure por mensagens como:
   - ✅ `Server running on port 3001`
   - ✅ `Database connected`
   - ❌ Se houver erros, verifique as variáveis de ambiente

### Passo 4.5: Obter URL do Backend
1. Vá em **"Settings"**
2. Em **"Domains"**, clique em **"Generate Domain"**
3. Railway vai gerar uma URL tipo:
   ```
   https://servicedesk-backend-production-xxxx.up.railway.app
   ```
4. **Copie essa URL!** Você vai precisar dela no frontend

---

## 5️⃣ Configurar Frontend

### Passo 5.1: Atualizar URL da API
No seu projeto frontend, crie/atualize o arquivo de configuração:

**Arquivo: `src/config/api.ts`**
```typescript
export const API_URL = import.meta.env.PROD 
  ? 'https://servicedesk-backend-production-xxxx.up.railway.app'  // Sua URL do Railway
  : 'http://localhost:3001';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/api/auth/login`,
    register: `${API_URL}/api/auth/register`,
    refresh: `${API_URL}/api/auth/refresh`,
  },
  tickets: {
    list: `${API_URL}/api/tickets`,
    create: `${API_URL}/api/tickets`,
    update: (id: string) => `${API_URL}/api/tickets/${id}`,
  },
  // ... outros endpoints
};
```

### Passo 5.2: Atualizar CORS no Backend
Certifique-se que o backend aceita requisições do seu frontend:

**Arquivo: `backend/src/server.ts`**
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://seu-usuario.github.io'  // Seu GitHub Pages
  ],
  credentials: true
}));
```

### Passo 5.3: Fazer Deploy do Frontend
```bash
# Compile o frontend
npm run build

# Deploy no GitHub Pages (veja o guia anterior)
git checkout pages
# ... copiar dist/ etc
```

---

## 6️⃣ Testar a Aplicação

### Passo 6.1: Testar Backend Diretamente
Abra o navegador e teste:
```
https://sua-url-railway.up.railway.app/api/health
```

Deve retornar algo como:
```json
{
  "status": "ok",
  "timestamp": "2024-05-04T12:00:00.000Z"
}
```

### Passo 6.2: Testar Login
Use o Postman ou curl:
```bash
curl -X POST https://sua-url-railway.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gabriel.juarez@montebravo.com.br",
    "senha": "admin123"
  }'
```

### Passo 6.3: Testar Frontend
1. Acesse seu GitHub Pages
2. Tente fazer login
3. Verifique se os chamados carregam
4. Teste criar um novo chamado

---

## 🔧 Troubleshooting

### ❌ Erro: "Cannot connect to database"
**Solução:**
1. Verifique se a `DATABASE_URL` está correta
2. Certifique-se que o PostgreSQL está rodando no Railway
3. Verifique os logs do banco de dados

### ❌ Erro: "JWT secret not defined"
**Solução:**
1. Verifique se `JWT_SECRET` está nas variáveis de ambiente
2. Faça um novo deploy após adicionar

### ❌ Erro: "CORS policy"
**Solução:**
1. Adicione a URL do seu frontend no CORS do backend
2. Verifique se `FRONTEND_URL` está correto

### ❌ Erro: "Port already in use"
**Solução:**
1. Railway define a porta automaticamente via `$PORT`
2. Use: `const PORT = process.env.PORT || 3001`

### ❌ Build falha
**Solução:**
1. Verifique se o `package.json` tem os scripts corretos
2. Verifique se todas as dependências estão no `package.json`
3. Veja os logs de build para detalhes

---

## 💰 Monitorar Uso de Créditos

### Ver Consumo
1. No dashboard do Railway, clique em **"Usage"**
2. Veja quanto dos $5 você já usou
3. Estimativa de quanto tempo vai durar

### Dicas para Economizar
- ✅ Use sleep mode quando não estiver usando
- ✅ Otimize queries do banco
- ✅ Use cache quando possível
- ✅ Monitore logs para identificar problemas

---

## 🎯 Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Backend está rodando no Railway
- [ ] Banco de dados PostgreSQL criado
- [ ] Todas as 11 variáveis de ambiente configuradas
- [ ] URL do backend obtida
- [ ] Frontend atualizado com a URL do backend
- [ ] CORS configurado corretamente
- [ ] Teste de login funcionando
- [ ] Teste de criação de chamado funcionando
- [ ] GitHub Pages atualizado

---

## 📚 Recursos Úteis

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Prisma Docs:** https://www.prisma.io/docs
- **Express Docs:** https://expressjs.com

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique os logs no Railway
2. Teste as variáveis de ambiente
3. Verifique se o banco está acessível
4. Teste endpoints individualmente

---

**Última atualização:** 04/05/2025
**Versão:** 1.0.0
