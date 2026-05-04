# 🔧 Como Atualizar a URL do Railway

## 📍 Onde Atualizar

**Arquivo:** `src/config/api.ts`  
**Linha:** 14

---

## 🚀 Passo a Passo

### 1️⃣ Fazer Deploy no Railway
1. Acesse https://railway.app
2. Faça login com GitHub
3. Crie novo projeto e selecione seu repositório
4. Adicione PostgreSQL
5. Configure as 11 variáveis de ambiente (veja `GUIA_RAILWAY_DEPLOY.md`)
6. Aguarde o deploy completar

### 2️⃣ Obter a URL do Backend
1. No Railway, clique no serviço do **Backend**
2. Vá em **Settings** → **Networking**
3. Clique em **Generate Domain**
4. Railway vai gerar uma URL tipo:
   ```
   https://servicedesk-backend-production-a1b2.up.railway.app
   ```
5. **Copie essa URL completa!**

### 3️⃣ Atualizar o Arquivo
1. Abra o arquivo: `src/config/api.ts`
2. Vá até a **linha 14**
3. Substitua:
   ```typescript
   const RAILWAY_API_URL = 'https://SEU-BACKEND-RAILWAY.up.railway.app';
   ```
   
   Por (cole sua URL):
   ```typescript
   const RAILWAY_API_URL = 'https://servicedesk-backend-production-a1b2.up.railway.app';
   ```

### 4️⃣ Salvar e Fazer Deploy
```bash
# Salve o arquivo (Ctrl+S)

# Compile o frontend
npm run build

# Faça commit
git add src/config/api.ts
git commit -m "Update Railway backend URL"
git push origin main

# Deploy no GitHub Pages
git checkout pages
# ... copie dist/ e faça push
```

---

## ✅ Verificar se Funcionou

### Teste 1: Backend Direto
Abra no navegador:
```
https://sua-url-railway.up.railway.app/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-05-04T..."
}
```

### Teste 2: Frontend
1. Abra seu GitHub Pages
2. Abra o Console do navegador (F12)
3. Procure por:
   ```
   🔧 API Configuration:
     Environment: production
     API URL: https://sua-url-railway.up.railway.app
     Production: true
   ```

### Teste 3: Login
1. Tente fazer login no sistema
2. Se funcionar, está tudo certo! 🎉

---

## 🔍 Exemplo Completo

**Antes (linha 14):**
```typescript
const RAILWAY_API_URL = 'https://SEU-BACKEND-RAILWAY.up.railway.app';
```

**Depois (com sua URL real):**
```typescript
const RAILWAY_API_URL = 'https://servicedesk-backend-production-a1b2.up.railway.app';
```

---

## ⚠️ Importante

- ✅ Use a URL **completa** com `https://`
- ✅ **NÃO** adicione `/api` no final
- ✅ **NÃO** adicione barra `/` no final
- ✅ Certifique-se que é a URL do **Backend**, não do PostgreSQL

---

## 🆘 Problemas?

### ❌ Erro: "Failed to fetch"
**Causa:** URL incorreta ou backend não está rodando  
**Solução:** Verifique se a URL está correta e se o backend está online no Railway

### ❌ Erro: "CORS policy"
**Causa:** Backend não está aceitando requisições do frontend  
**Solução:** Adicione a URL do GitHub Pages na variável `FRONTEND_URL` no Railway

### ❌ Erro: "Network error"
**Causa:** Backend pode estar em sleep mode  
**Solução:** Acesse a URL do backend diretamente para "acordá-lo"

---

## 📝 Anotações

**Minha URL do Railway:**
```
_____________________________________________
```

**Data da atualização:**
```
_____________________________________________
```

**Testado e funcionando:** [ ]

---

**Última atualização:** 04/05/2025
