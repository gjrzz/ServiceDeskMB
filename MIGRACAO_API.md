# 🔄 Guia de Migração: localStorage → API

Este documento explica como migrar o frontend do localStorage para a API do backend.

## ✅ Status Atual

### Concluído
- ✅ Backend funcionando (`http://localhost:3001`)
- ✅ Serviços criados em `src/services/`
- ✅ Configuração da API (`src/config/api.ts`)
- ✅ Arquivo `.env` do backend configurado

### Próximos Passos
- ⏳ Atualizar Providers para usar os serviços
- ⏳ Testar funcionalidades
- ⏳ Remover código legado

---

## 📋 Plano de Migração

### Fase 1: Autenticação ✅ (Serviço criado)
- [x] Criar `auth.service.ts`
- [ ] Atualizar `AuthProvider` no `App.tsx`
- [ ] Testar login/logout
- [ ] Verificar persistência de sessão

### Fase 2: Usuários ✅ (Serviço criado)
- [x] Criar `user.service.ts`
- [ ] Atualizar `AuthProvider` para buscar usuários da API
- [ ] Testar CRUD de usuários
- [ ] Verificar permissões

### Fase 3: Tickets ✅ (Serviço criado)
- [x] Criar `ticket.service.ts`
- [ ] Atualizar `TicketProvider` no `App.tsx`
- [ ] Testar criação de tickets
- [ ] Testar atualização de status
- [ ] Testar comentários e atividades
- [ ] Testar avaliações

### Fase 4: Base de Conhecimento ✅ (Serviço criado)
- [x] Criar `kb.service.ts`
- [ ] Atualizar `KBProvider` no `App.tsx`
- [ ] Testar CRUD de artigos
- [ ] Testar busca
- [ ] Testar votação

### Fase 5: Notificações ✅ (Serviço criado)
- [x] Criar `notification.service.ts`
- [ ] Atualizar sistema de notificações
- [ ] Testar criação e leitura
- [ ] Testar contagem de não lidas

---

## 🚀 Como Testar

### 1. Iniciar o Backend

```bash
cd backend
npm run dev
```

Deve aparecer:
```
✅ Conectado ao banco de dados PostgreSQL
🚀 Servidor rodando em http://localhost:3001
```

### 2. Iniciar o Frontend

```bash
# Em outro terminal, na raiz do projeto
npm run dev
```

### 3. Testar a API Manualmente

Você pode testar os endpoints usando o navegador ou ferramentas como Postman:

```bash
# Health check
curl http://localhost:3001/api/health

# Login (exemplo)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@montebravo.com.br","senha":"admin123"}'
```

---

## 🔧 Exemplo de Migração: AuthProvider

### Antes (localStorage)

```typescript
const fazerLogin = async (email: string, senha: string) => {
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  if (!usuario) {
    return { success: false, message: "Credenciais inválidas" };
  }
  setUsuarioLogado(usuario);
  localStorage.setItem("mb_sessao", JSON.stringify(usuario));
  return { success: true };
};
```

### Depois (API)

```typescript
import { AuthService } from '@/src/services';

const fazerLogin = async (email: string, senha: string) => {
  const result = await AuthService.login({ email, senha });
  
  if (result.success && result.user) {
    setUsuarioLogado(result.user);
    return { success: true };
  }
  
  return { 
    success: false, 
    message: result.message || "Erro ao fazer login" 
  };
};
```

---

## 🎯 Diferenças Importantes

### 1. Tipos de Dados

O backend usa **ENUM em maiúsculas**, enquanto o frontend usa strings:

**Backend (Prisma):**
```typescript
enum Perfil {
  ADMIN
  USUARIO
  MANAGER
}

enum StatusChamado {
  ABERTO
  EM_ANDAMENTO
  RESOLVIDO
  // ...
}
```

**Frontend (atual):**
```typescript
type Perfil = "admin" | "usuario" | "manager";
type Status = "Aberto" | "Em Andamento" | "Resolvido";
```

**Solução:** Os serviços já usam os tipos corretos do backend. Você pode:
1. Manter os tipos do frontend e fazer conversão
2. Ou migrar para os tipos do backend (recomendado)

### 2. IDs

- **Backend:** Usa `cuid()` (ex: `ckl1234567890`)
- **Frontend:** Usa IDs customizados (ex: `TKT-0001`)

**Solução:** O backend gera IDs automaticamente. Você pode:
1. Usar os IDs do backend
2. Ou adicionar um campo `codigo` customizado no backend

### 3. Datas

- **Backend:** Retorna ISO strings (ex: `2024-01-15T10:30:00.000Z`)
- **Frontend:** Usa strings amigáveis (ex: `há 2 horas`)

**Solução:** Criar funções helper para formatar datas:

```typescript
// src/utils/date.ts
export const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `há ${minutes} minutos`;
  if (hours < 24) return `há ${hours} horas`;
  return `há ${days} dias`;
};
```

---

## 🧪 Checklist de Testes

### Autenticação
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Logout
- [ ] Persistência de sessão (refresh da página)
- [ ] Token expira corretamente
- [ ] Refresh token funciona

### Usuários
- [ ] Listar usuários
- [ ] Criar novo usuário
- [ ] Editar usuário
- [ ] Desativar usuário
- [ ] Deletar usuário
- [ ] Permissões (admin vs usuário)

### Tickets
- [ ] Listar todos os tickets
- [ ] Listar meus tickets
- [ ] Criar novo ticket
- [ ] Editar ticket
- [ ] Mudar status
- [ ] Mudar prioridade
- [ ] Atribuir responsável
- [ ] Adicionar comentário
- [ ] Adicionar comentário interno
- [ ] Avaliar ticket
- [ ] Deletar ticket

### Base de Conhecimento
- [ ] Listar artigos
- [ ] Criar artigo
- [ ] Editar artigo
- [ ] Publicar/despublicar
- [ ] Buscar artigos
- [ ] Votar (útil/não útil)
- [ ] Visualizações incrementam
- [ ] Deletar artigo

### Notificações
- [ ] Listar notificações
- [ ] Contagem de não lidas
- [ ] Marcar como lida
- [ ] Marcar todas como lidas
- [ ] Deletar notificação
- [ ] Deletar todas

---

## 🐛 Problemas Comuns

### 1. CORS Error

**Erro:** `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5173' has been blocked by CORS`

**Solução:** Já está configurado no backend (`server.ts`):
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'https://gjrzz.github.io'],
  credentials: true,
}));
```

### 2. Token não está sendo enviado

**Erro:** `401 Unauthorized`

**Solução:** Verificar se o token está sendo salvo no login:
```typescript
// Deve estar em auth.service.ts
localStorage.setItem('token', response.token);
```

### 3. Dados não aparecem

**Erro:** Lista vazia mesmo com dados no banco

**Solução:** 
1. Verificar se o backend tem dados (usar seed)
2. Verificar console do navegador para erros
3. Verificar Network tab no DevTools

---

## 📚 Recursos

- [Documentação da API](./backend/README.md)
- [Serviços](./src/services/README.md)
- [Configuração da API](./src/config/README.md)
- [Schema do Prisma](./backend/prisma/schema.prisma)

---

## 🎉 Próximo Passo

Agora vamos atualizar o `AuthProvider` para usar o `AuthService`. Quer que eu faça isso?
