# ⚡ Deploy Rápido (5 minutos)

Guia super rápido para colocar no ar usando **Vercel + Railway**.

## 🎯 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Código commitado no GitHub
- ✅ 5 minutos livres

---

## 🚀 Passo 1: Deploy do Backend (Railway)

### 1. Acesse Railway

👉 https://railway.app/

- Clique em **"Login"** → **"Login with GitHub"**

### 2. Criar Projeto

1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha seu repositório: `ServiceDeskMB`
4. Selecione a pasta: **`backend`**

### 3. Adicionar PostgreSQL

1. No projeto, clique em **"+ New"**
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. Pronto! Railway conecta automaticamente

### 4. Configurar Variáveis

1. Clique no serviço **backend**
2. Vá em **"Variables"**
3. Clique em **"Raw Editor"**
4. Cole isso (mude as chaves JWT!):

```env
JWT_SECRET=MUDE_ISSO_CHAVE_SUPER_SECRETA_123456789
JWT_REFRESH_SECRET=MUDE_ISSO_CHAVE_REFRESH_987654321
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://seu-site.vercel.app
PORT=3001
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. Clique em **"Update Variables"**

### 5. Copiar URL do Backend

1. Vá em **"Settings"**
2. Copie a URL em **"Domains"**
3. Exemplo: `https://servicedesk-backend-production.up.railway.app`

**✅ Backend no ar!** Teste: `https://sua-url/api/health`

---

## 🎨 Passo 2: Deploy do Frontend (Vercel)

### 1. Acesse Vercel

👉 https://vercel.com/

- Clique em **"Sign Up"** → **"Continue with GitHub"**

### 2. Criar .env.production

No seu computador, crie o arquivo `.env.production`:

```bash
cd ServiceDeskMB
echo "VITE_API_URL=https://sua-url-railway.up.railway.app/api" > .env.production
git add .env.production
git commit -m "chore: add production env"
git push
```

### 3. Importar Projeto

1. No Vercel, clique em **"Add New..."** → **"Project"**
2. Clique em **"Import"** no seu repositório
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `ServiceDeskMB` (se necessário)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 4. Adicionar Variável de Ambiente

1. Expanda **"Environment Variables"**
2. Adicione:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://sua-url-railway.up.railway.app/api`
3. Clique em **"Deploy"**

### 5. Aguardar Deploy

⏳ Aguarde 2-3 minutos...

**✅ Frontend no ar!**

### 6. Atualizar CORS no Backend

1. Volte no Railway
2. Copie a URL do Vercel (ex: `https://servicedesk-mb.vercel.app`)
3. No Railway, atualize a variável:
   ```
   FRONTEND_URL=https://servicedesk-mb.vercel.app
   ```
4. Backend reinicia automaticamente

---

## 🧪 Passo 3: Testar

### 1. Abra seu site

👉 `https://seu-site.vercel.app`

### 2. Faça login

- **Email:** `gabriel@montebravo.com.br`
- **Senha:** `123456`

### 3. Teste funcionalidades

- ✅ Login funciona?
- ✅ Lista de chamados carrega?
- ✅ Consegue criar chamado?
- ✅ Upload de arquivo funciona?

---

## 🎉 Pronto!

Seu sistema está no ar!

- **Frontend:** `https://seu-site.vercel.app`
- **Backend:** `https://seu-backend.railway.app`

---

## 🐛 Problemas?

### CORS Error

**Erro:** `Access to XMLHttpRequest blocked by CORS`

**Solução:** Verifique se `FRONTEND_URL` no Railway está correto

### 502 Bad Gateway

**Erro:** Backend não responde

**Solução:** 
1. Vá no Railway → Deployments
2. Veja os logs
3. Procure por erros

### Login não funciona

**Erro:** Credenciais inválidas

**Solução:**
1. Vá no Railway → Deployments
2. Veja se o seed foi executado
3. Se não, execute manualmente:
   ```bash
   # No Railway, vá em Settings → Deploy Trigger
   # Ou force um novo deploy
   ```

---

## 📊 Monitorar

### Ver logs do backend

1. Railway → Seu projeto → backend
2. Clique em **"Deployments"**
3. Clique no deployment ativo
4. Veja os logs em tempo real

### Ver logs do frontend

1. Vercel → Seu projeto
2. Clique em **"Deployments"**
3. Clique no deployment ativo
4. Veja os logs

---

## 💰 Custos

- **Vercel:** Grátis (ilimitado para hobby)
- **Railway:** $5/mês de crédito grátis
  - ~500 horas de servidor
  - ~1GB de PostgreSQL

**Total: R$ 0/mês** (até acabar crédito Railway)

---

## 🔄 Atualizações Futuras

Sempre que você fizer mudanças:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push
```

**Deploy automático!** 🚀
- Vercel detecta push e faz deploy do frontend
- Railway detecta push e faz deploy do backend

---

## 🎯 Próximos Passos

- [ ] Configurar domínio próprio
- [ ] Adicionar monitoramento (Sentry)
- [ ] Configurar backup do banco
- [ ] Adicionar analytics
- [ ] Configurar e-mails (SendGrid)

---

**Dúvidas?** Veja o guia completo em `DEPLOY_GUIA_COMPLETO.md`
