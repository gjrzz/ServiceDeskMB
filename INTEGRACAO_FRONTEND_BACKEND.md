# 🔗 Integração Frontend ↔️ Backend

Guia para conectar o frontend React ao backend Node.js.

## 📦 O que foi criado

### Backend (Node.js + TypeScript + Express + Prisma + PostgreSQL)

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema completo do banco
│   └── seed.ts                # Dados iniciais
├── src/
│   ├── middleware/
│   │   └── auth.middleware.ts # Autenticação JWT
│   ├── routes/
│   │   ├── auth.routes.ts     # Login, logout, refresh
│   │   ├── user.routes.ts     # CRUD de usuários
│   │   ├── ticket.routes.ts   # CRUD de chamados
│   │   ├── kb.routes.ts       # Base de conhecimento
│   │   ├── notification.routes.ts # Notificações
│   │   └── upload.routes.ts   # Upload de arquivos
│   ├── utils/
│   │   └── jwt.utils.ts       # Funções JWT
│   └── server.ts              # Servidor principal
├── .env                       # Configurações
└── package.json
```

### Banco de Dados PostgreSQL

- ✅ 10 tabelas criadas
- ✅ Relacionamentos configurados
- ✅ Índices otimizados
- ✅ Dados de exemplo populados

---

## 🚀 Passo a Passo

### 1. Instalar Backend

```bash
cd ServiceDeskMB/backend

# Opção A: Script automático (recomendado)
chmod +x setup.sh
./setup.sh

# Opção B: Manual
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 2. Iniciar Backend

```bash
npm run dev
```

✅ Backend rodando em `http://localhost:3001`

### 3. Testar Backend

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gabriel@montebravo.com.br","senha":"123456"}'
```

---

## 🔌 Conectar Frontend

### Instalar Axios no Frontend

```bash
cd ServiceDeskMB
npm install axios
```

### Criar serviço de API

Crie o arquivo `src/services/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('http://localhost:3001/api/auth/refresh', {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou, fazer logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Exemplo de uso no AuthContext

```typescript
import api from './services/api';

// Login
const handleLogin = async (email: string, senha: string) => {
  try {
    const { data } = await api.post('/auth/login', { email, senha });
    
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    
    setUsuarioLogado(data.usuario);
    return true;
  } catch (error) {
    console.error('Erro no login:', error);
    return false;
  }
};

// Logout
const handleLogout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
  } catch (error) {
    console.error('Erro no logout:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    setUsuarioLogado(null);
  }
};

// Buscar usuários
const fetchUsuarios = async () => {
  try {
    const { data } = await api.get('/users');
    setUsuarios(data);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
  }
};

// Criar chamado
const criarChamado = async (chamadoData: any) => {
  try {
    const { data } = await api.post('/tickets', chamadoData);
    return data;
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    throw error;
  }
};
```

---

## 🔄 Migração de localStorage para API

### Antes (localStorage)

```typescript
const usuarios = JSON.parse(localStorage.getItem('mb_usuarios') || '[]');
```

### Depois (API)

```typescript
const { data: usuarios } = await api.get('/users');
```

### Checklist de Migração

- [ ] Substituir `localStorage` de usuários por `api.get('/users')`
- [ ] Substituir `localStorage` de chamados por `api.get('/tickets')`
- [ ] Substituir `localStorage` de KB por `api.get('/kb')`
- [ ] Substituir `localStorage` de notificações por `api.get('/notifications')`
- [ ] Implementar login real com JWT
- [ ] Implementar refresh token automático
- [ ] Remover dados mockados (MOCK_TICKETS, etc)
- [ ] Atualizar upload de arquivos para usar `/api/upload`
- [ ] Atualizar upload de avatar para usar `/api/upload/avatar`

---

## 🔐 Fluxo de Autenticação

```
1. Usuário faz login
   ↓
2. Backend valida credenciais
   ↓
3. Backend retorna accessToken (15min) + refreshToken (7 dias)
   ↓
4. Frontend salva tokens no localStorage
   ↓
5. Frontend adiciona accessToken em todas as requisições
   ↓
6. Quando accessToken expira (401):
   - Frontend usa refreshToken para pegar novo accessToken
   - Repete requisição original
   ↓
7. Quando refreshToken expira:
   - Redireciona para login
```

---

## 📊 Mapeamento de Dados

### Usuário

**Frontend (atual):**
```typescript
interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: "admin" | "usuario";
  departamento: string;
  avatar: string;
  avatarUrl?: string;
  ativo: boolean;
  criadoEm: string;
}
```

**Backend (Prisma):**
```typescript
enum Perfil {
  ADMIN
  USUARIO
}

model Usuario {
  id: string
  nome: string
  email: string
  senha: string
  perfil: Perfil
  departamento: string
  avatar: string
  avatarUrl?: string
  ativo: boolean
  criadoEm: DateTime
  atualizadoEm: DateTime
}
```

**Ajustes necessários:**
- `perfil`: "admin" → "ADMIN", "usuario" → "USUARIO"
- `criadoEm`: string → Date

### Chamado

**Frontend (atual):**
```typescript
interface TicketData {
  id: string;
  title: string;
  requester: string;
  priority: "Baixo" | "Médio" | "Alto" | "Crítico";
  status: "Aberto" | "Em Andamento" | ...;
  category: "Hardware" | "Software" | ...;
  assignee: string;
  created: string;
  description: string;
}
```

**Backend (Prisma):**
```typescript
enum Prioridade {
  BAIXO
  MEDIO
  ALTO
  CRITICO
}

model Chamado {
  id: string
  titulo: string
  descricao: string
  prioridade: Prioridade
  status: StatusChamado
  categoria: Categoria
  solicitanteId: string
  responsavelId?: string
  criadoEm: DateTime
}
```

**Ajustes necessários:**
- `title` → `titulo`
- `requester` → `solicitante` (objeto completo)
- `assignee` → `responsavel` (objeto completo)
- `created` → `criadoEm` (Date)
- Enums em UPPERCASE

---

## 🧪 Testando a Integração

### 1. Backend rodando

```bash
cd backend
npm run dev
```

### 2. Frontend rodando

```bash
cd ..
npm run dev
```

### 3. Testar login

1. Abra `http://localhost:5173`
2. Faça login com: `gabriel@montebravo.com.br` / `123456`
3. Verifique no DevTools → Network se as requisições estão indo para `localhost:3001`
4. Verifique no DevTools → Application → Local Storage se os tokens foram salvos

### 4. Testar CRUD

- Criar usuário
- Criar chamado
- Adicionar comentário
- Atualizar status
- Upload de arquivo

---

## 🐛 Problemas Comuns

### CORS Error

**Erro:** `Access to XMLHttpRequest blocked by CORS policy`

**Solução:** Verifique se `FRONTEND_URL` no `.env` do backend está correto:

```env
FRONTEND_URL="http://localhost:5173"
```

### 401 Unauthorized

**Erro:** Todas as requisições retornam 401

**Solução:** 
1. Verifique se o token está sendo enviado no header
2. Verifique se o token não expirou
3. Faça login novamente

### Network Error

**Erro:** `Network Error` ou `ERR_CONNECTION_REFUSED`

**Solução:** Backend não está rodando. Execute `npm run dev` no backend.

---

## 📝 Próximos Passos

1. ✅ Backend configurado
2. 🔜 Migrar AuthContext para usar API
3. 🔜 Migrar TicketContext para usar API
4. 🔜 Migrar upload de arquivos
5. 🔜 Implementar WebSocket para tempo real
6. 🔜 Adicionar loading states
7. 🔜 Adicionar error handling
8. 🔜 Deploy em produção

---

## 💡 Dicas

- Use **React Query** ou **SWR** para cache e sincronização
- Implemente **loading states** em todas as requisições
- Adicione **error boundaries** para capturar erros
- Use **TypeScript** para tipar as respostas da API
- Implemente **retry logic** para requisições falhadas
- Adicione **toast notifications** para feedback ao usuário

---

Quer que eu implemente a integração completa do frontend com o backend agora? 🚀
