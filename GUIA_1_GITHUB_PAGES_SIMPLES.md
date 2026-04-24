# 🚀 Guia 1 — Deploy no GitHub Pages (Só Frontend)

> Use este guia se quiser colocar o site no ar rapidamente, sem backend.
> Os dados ficam no localStorage do navegador de cada usuário.

---

## O que funciona neste modo
- ✅ Login (usuários mockados)
- ✅ Criar/editar chamados
- ✅ Base de conhecimento
- ✅ Tema claro/escuro
- ✅ SLA, relatórios, notificações
- ⚠️ Dados não são compartilhados entre usuários (cada um vê o seu localStorage)
- ❌ Sem banco de dados real

---

## Pré-requisitos
- Git instalado: https://git-scm.com/download/win
- Node.js instalado: https://nodejs.org (versão LTS)
- Conta no GitHub: https://github.com

---

## Passo 1 — Instalar dependências

Abra o terminal (PowerShell ou CMD) na pasta do projeto:

```powershell
npm install
```

---

## Passo 2 — Testar o build localmente

```powershell
npm run build
npm run preview
```

Acesse http://localhost:4173 e confirme que está tudo funcionando.

---

## Passo 3 — Criar repositório no GitHub

1. Acesse https://github.com/new
2. Nome: `service-desk-mb`
3. Visibilidade: **Public**
4. Clique em **Create repository**

---

## Passo 4 — Enviar código para o GitHub

No terminal, dentro da pasta do projeto:

```powershell
git init
git add .
git commit -m "Service Desk MB - deploy inicial"
git remote add origin https://github.com/SEU_USUARIO/service-desk-mb.git
git branch -M main
git push -u origin main
```

> Substitua `SEU_USUARIO` pelo seu username do GitHub.

---

## Passo 5 — Fazer o deploy

```powershell
npm run deploy
```

Isso vai buildar o projeto e enviar para a branch `gh-pages` automaticamente.

---

## Passo 6 — Configurar GitHub Pages

1. No repositório do GitHub, clique em **Settings**
2. No menu lateral, clique em **Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Em **Branch**, selecione **gh-pages**
5. Clique em **Save**

---

## Passo 7 — Acessar o site

Após 1-2 minutos, seu site estará em:

```
https://SEU_USUARIO.github.io/service-desk-mb/
```

---

## Atualizações futuras

Sempre que fizer mudanças no código:

```powershell
git add .
git commit -m "Descrição da mudança"
git push origin main
npm run deploy
```

---

## Problema: página em branco

Verifique se o `vite.config.ts` tem o `base` correto:

```typescript
base: process.env.NODE_ENV === 'production' ? '/service-desk-mb/' : '/',
```

O nome entre as barras deve ser **exatamente igual** ao nome do repositório no GitHub.
