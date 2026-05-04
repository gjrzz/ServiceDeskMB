# 🚀 COMECE AQUI - Deploy do ServiceDesk

## 👋 Olá!

Este é o seu guia rápido para fazer o deploy completo do sistema.

---

## 📊 Status Atual

```
✅ Frontend desenvolvido
✅ Backend desenvolvido  
✅ API configurada
✅ Documentação criada
⏳ Aguardando deploy no Railway
⏳ Aguardando atualização da URL
```

---

## 🎯 O Que Você Precisa Fazer (3 Passos)

### 📍 PASSO 1: Deploy no Railway
**Tempo:** 15-20 minutos  
**Arquivo:** `GUIA_RAILWAY_DEPLOY.md` 📖

**Resumo ultra-rápido:**
1. Acesse https://railway.app
2. Login com GitHub
3. New Project → Deploy from GitHub → ServiceDeskMB
4. Add PostgreSQL
5. Configure 11 variáveis (lista no guia)
6. Generate Domain
7. **COPIE A URL!** (ex: `https://servicedesk-backend-production-xxxx.up.railway.app`)

---

### 📍 PASSO 2: Atualizar URL
**Tempo:** 2 minutos  
**Arquivo:** `COMO_ATUALIZAR_URL_RAILWAY.md` 🔧

**Resumo ultra-rápido:**
1. Abra: `src/config/api.ts`
2. Linha 14: Cole a URL do Railway
3. Salve (Ctrl+S)

**Antes:**
```typescript
const RAILWAY_API_URL = 'https://SEU-BACKEND-RAILWAY.up.railway.app';
```

**Depois:**
```typescript
const RAILWAY_API_URL = 'https://servicedesk-backend-production-xxxx.up.railway.app';
```

---

### 📍 PASSO 3: Deploy Frontend
**Tempo:** 5 minutos

```bash
# Compile
npm run build

# Commit
git add src/config/api.ts
git commit -m "Update Railway URL"
git push origin main

# Deploy no GitHub Pages
git checkout pages
# Copie dist/ para raiz
# Commit e push
```

---

## ✅ Checklist Rápido

Use este checklist enquanto faz o deploy:

```
[ ] Conta criada no Railway
[ ] Projeto criado
[ ] PostgreSQL adicionado
[ ] 11 variáveis configuradas
[ ] Deploy completado
[ ] URL do Railway copiada
[ ] src/config/api.ts atualizado (linha 14)
[ ] Frontend compilado (npm run build)
[ ] Deploy no GitHub Pages
[ ] Teste: backend/api/health funciona
[ ] Teste: login no sistema funciona
[ ] Teste: criar chamado funciona
```

---

## 📚 Guias Disponíveis

| Quando Usar | Arquivo | Descrição |
|-------------|---------|-----------|
| **AGORA** | `GUIA_RAILWAY_DEPLOY.md` | Passo a passo completo do Railway |
| **DEPOIS** | `COMO_ATUALIZAR_URL_RAILWAY.md` | Como atualizar a URL |
| **DURANTE** | `RAILWAY_CHECKLIST.md` | Checklist para não esquecer nada |
| **REFERÊNCIA** | `RESUMO_CONFIGURACAO_API.md` | Resumo técnico completo |
| **VISÃO GERAL** | `PROXIMOS_PASSOS.md` | Visão geral dos próximos passos |

---

## 🔑 Variáveis de Ambiente (Railway)

Você vai precisar configurar estas **11 variáveis**:

### Copie do PostgreSQL
1. `DATABASE_URL` - Railway gera automaticamente

### Gere com o script
```bash
node backend/generate-secrets.js
```
2. `JWT_SECRET`
3. `JWT_REFRESH_SECRET`

### Configure manualmente
4. `NODE_ENV` = `production`
5. `FRONTEND_URL` = `https://seu-usuario.github.io/ServiceDeskMB`
6. `JWT_EXPIRES_IN` = `15m`
7. `JWT_REFRESH_EXPIRES_IN` = `7d`
8. `PORT` = `3001`
9. `UPLOAD_DIR` = `./uploads`
10. `MAX_FILE_SIZE` = `10485760`
11. `RATE_LIMIT_WINDOW_MS` = `900000`
12. `RATE_LIMIT_MAX_REQUESTS` = `100`

💡 **Dica:** Copie do arquivo `backend/.env.railway.example`

---

## ⚡ Comandos Úteis

### Gerar chaves JWT
```bash
node backend/generate-secrets.js
```

### Testar localmente
```bash
cd backend
npm run dev
```

### Compilar frontend
```bash
npm run build
```

### Ver se tem erros
```bash
npm run build
# Se compilar sem erros, está tudo OK!
```

---

## 🎯 Fluxo Visual

```
┌─────────────────────────────────────────────┐
│  1. DEPLOY NO RAILWAY                       │
│  ├─ Criar projeto                           │
│  ├─ Adicionar PostgreSQL                    │
│  ├─ Configurar 11 variáveis                 │
│  ├─ Aguardar deploy                         │
│  └─ Copiar URL gerada                       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. ATUALIZAR FRONTEND                      │
│  ├─ Abrir src/config/api.ts                 │
│  ├─ Linha 14: colar URL do Railway          │
│  └─ Salvar arquivo                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. DEPLOY FRONTEND                         │
│  ├─ npm run build                           │
│  ├─ git commit e push                       │
│  └─ Deploy no GitHub Pages                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. TESTAR TUDO                             │
│  ├─ Backend: /api/health                    │
│  ├─ Login no sistema                        │
│  ├─ Criar chamado                           │
│  └─ Verificar se salva                      │
└─────────────────────────────────────────────┘
                    ↓
              🎉 PRONTO!
```

---

## 💡 Dicas Importantes

### ✅ Faça
- Siga a ordem dos passos
- Copie a URL completa do Railway (com `https://`)
- Teste o backend antes de atualizar o frontend
- Use o checklist para não esquecer nada

### ❌ Não Faça
- Não pule etapas
- Não adicione `/api` no final da URL
- Não use a URL do PostgreSQL (é diferente!)
- Não esqueça de configurar as 11 variáveis

---

## 🆘 Problemas?

### Backend não funciona
1. Verifique os logs no Railway
2. Confirme que todas as variáveis estão configuradas
3. Teste a URL: `https://sua-url.up.railway.app/api/health`

### Frontend não conecta
1. Verifique se a URL está correta no `api.ts` (linha 14)
2. Abra o Console do navegador (F12) para ver erros
3. Confirme que o backend está online

### CORS error
1. Configure `FRONTEND_URL` no Railway
2. Adicione a URL do GitHub Pages

---

## 📞 Recursos

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Guias do Projeto:** Veja os arquivos `.md` na raiz

---

## 🎉 Depois que Funcionar

Você terá:
- ✅ Backend rodando 24/7 no Railway
- ✅ Banco PostgreSQL configurado
- ✅ Frontend no GitHub Pages
- ✅ Sistema completo online
- ✅ Acesso de qualquer lugar

---

## 📝 Anotações

Use este espaço para anotar informações importantes:

**URL do Railway:**
```
_________________________________________________
```

**URL do GitHub Pages:**
```
_________________________________________________
```

**Data do Deploy:**
```
_________________________________________________
```

**Usuário Admin:**
```
Email: gabriel.juarez@montebravo.com.br
Senha: admin123
```

---

## 🚀 Vamos Começar!

**Próximo passo:** Abra o arquivo `GUIA_RAILWAY_DEPLOY.md` e siga o passo a passo!

Boa sorte! 🎯

---

**Criado em:** 04/05/2025  
**Tempo estimado total:** 30-40 minutos
