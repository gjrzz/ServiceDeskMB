# 🚀 Deploy do Frontend - Passo a Passo

## ✅ Status Atual

- ✅ Backend configurado: `https://servicedeskmb-production.up.railway.app`
- ✅ Frontend configurado: `https://gjrzz.github.io/ServiceDeskMB/`
- ✅ CORS configurado
- ✅ Build compilado sem erros
- ⏳ **Falta:** Fazer deploy no GitHub Pages

---

## 🎯 O Que Fazer Agora

### Opção 1: Deploy Manual (Recomendado)

```bash
# 1. Commit as mudanças
git add .
git commit -m "Configure Railway backend URL and CORS"
git push origin main

# 2. Ir para a branch pages
git checkout pages

# 3. Copiar os arquivos compilados
# No Windows (PowerShell):
Copy-Item -Path dist/* -Destination . -Recurse -Force

# 4. Commit e push
git add .
git commit -m "Deploy frontend with Railway integration"
git push origin pages

# 5. Voltar para main
git checkout main
```

---

### Opção 2: Script Automático

Crie um arquivo `deploy.sh` na raiz:

```bash
#!/bin/bash

echo "🚀 Iniciando deploy..."

# Build
echo "📦 Compilando..."
npm run build

# Commit na main
echo "💾 Salvando mudanças..."
git add .
git commit -m "Update configuration"
git push origin main

# Deploy no pages
echo "🌐 Fazendo deploy no GitHub Pages..."
git checkout pages
cp -r dist/* .
git add .
git commit -m "Deploy: $(date)"
git push origin pages
git checkout main

echo "✅ Deploy concluído!"
echo "🔗 Acesse: https://gjrzz.github.io/ServiceDeskMB/"
```

Execute:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

### Opção 3: GitHub Actions (Automático)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        publish_branch: pages
```

Depois é só fazer push na main que o deploy acontece automaticamente!

---

## 🧪 Testar Antes de Fazer Deploy

### 1. Testar o Backend
```bash
curl https://servicedeskmb-production.up.railway.app/api/health
```

**Deve retornar:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

### 2. Testar o Build Local
```bash
npm run preview
```

Abra `http://localhost:4173` e teste:
- ✅ Login funciona
- ✅ Criar chamado funciona
- ✅ Console mostra URL correta

---

## 📋 Checklist Pré-Deploy

Antes de fazer deploy, verifique:

- [ ] Backend está online (`/api/health` responde)
- [ ] Build compilou sem erros (`npm run build`)
- [ ] Testou localmente (`npm run preview`)
- [ ] Console mostra URL correta do Railway
- [ ] CORS está configurado no backend
- [ ] Todas as variáveis de ambiente no Railway

---

## 🎯 Após o Deploy

### 1. Aguardar GitHub Pages Atualizar
- Pode levar 1-5 minutos
- Veja o status em: Settings → Pages

### 2. Testar a Aplicação
1. Abra: https://gjrzz.github.io/ServiceDeskMB/
2. Abra o Console (F12)
3. Verifique se mostra:
   ```
   🔧 API Configuration:
     API URL: https://servicedeskmb-production.up.railway.app
   ```
4. Faça login:
   - Email: `gabriel.juarez@montebravo.com.br`
   - Senha: `admin123`

### 3. Testar Funcionalidades
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Criar chamado funciona
- [ ] Dados são salvos
- [ ] Notificações aparecem

---

## 🆘 Problemas Comuns

### ❌ GitHub Pages não atualiza
**Solução:**
1. Vá em Settings → Pages
2. Verifique se a branch está como `pages`
3. Force um novo deploy: faça um commit vazio
   ```bash
   git commit --allow-empty -m "Force deploy"
   git push origin pages
   ```

### ❌ Página em branco
**Solução:**
1. Verifique o Console (F12) para erros
2. Verifique se o `base` está correto no `vite.config.ts`:
   ```typescript
   base: '/ServiceDeskMB/'
   ```

### ❌ "Failed to fetch"
**Solução:**
1. Verifique se o backend está online
2. Verifique o CORS no backend
3. Veja o Console para detalhes do erro

### ❌ CORS error
**Solução:**
1. Já configuramos! Mas se persistir:
2. Adicione `FRONTEND_URL` nas variáveis do Railway
3. Faça um novo deploy no Railway

---

## 📊 Estrutura de Deploy

```
main branch (código fonte)
    ↓
npm run build
    ↓
dist/ (arquivos compilados)
    ↓
pages branch (deploy)
    ↓
GitHub Pages
    ↓
https://gjrzz.github.io/ServiceDeskMB/
```

---

## 🎉 Pronto!

Depois do deploy, você terá:
- ✅ Frontend online no GitHub Pages
- ✅ Backend online no Railway
- ✅ Banco PostgreSQL no Railway
- ✅ Sistema completo funcionando
- ✅ Acesso de qualquer lugar

---

## 📝 Comandos Rápidos

```bash
# Build
npm run build

# Preview local
npm run preview

# Deploy manual
git checkout pages && cp -r dist/* . && git add . && git commit -m "Deploy" && git push && git checkout main

# Ver logs do Railway
# Acesse: https://railway.app → Seu projeto → Deployments → View Logs
```

---

**Última atualização:** 04/05/2025  
**Tempo estimado:** 10-15 minutos

---

**Vamos fazer o deploy! 🚀**
