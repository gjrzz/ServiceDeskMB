# 🔧 Configuração da API

Esta pasta contém a configuração para conectar o frontend ao backend.

## 📁 Arquivos

- **`api.ts`** - Configuração principal da API
- **`api.example.ts`** - Exemplos de uso (referência)

## 🚀 Como Configurar

### 1️⃣ Após Deploy no Railway

1. Faça o deploy do backend no Railway
2. No Railway, vá em **Settings** → **Networking** → **Generate Domain**
3. Copie a URL gerada (ex: `https://servicedesk-backend-production-xxxx.up.railway.app`)

### 2️⃣ Atualizar api.ts

Abra o arquivo `src/config/api.ts` e atualize a linha 14:

```typescript
// ANTES (padrão)
const RAILWAY_API_URL = 'https://SEU-PROJETO.up.railway.app';

// DEPOIS (com sua URL do Railway)
const RAILWAY_API_URL = 'https://servicedesk-backend-production-xxxx.up.railway.app';
```

### 3️⃣ Testar

```bash
# Desenvolvimento (usa localhost)
npm run dev

# Produção (usa Railway)
npm run build
```

## 📖 Como Usar no Código

### Importar

```typescript
import { API_ENDPOINTS, apiPost, apiGet } from '@/config/api';
```

### Fazer Login

```typescript
const handleLogin = async () => {
  try {
    const response = await apiPost(
      API_ENDPOINTS.auth.login, 
      { email, senha },
      false // não precisa de auth para login
    );
    
    // Salvar token
    localStorage.setItem('token', response.token);
    
    console.log('Login bem-sucedido!');
  } catch (error) {
    console.error('Erro no login:', error);
  }
};
```

### Listar Chamados

```typescript
const loadTickets = async () => {
  try {
    const tickets = await apiGet(API_ENDPOINTS.tickets.list);
    console.log('Chamados:', tickets);
  } catch (error) {
    console.error('Erro ao carregar chamados:', error);
  }
};
```

### Criar Chamado

```typescript
const createTicket = async () => {
  try {
    const newTicket = await apiPost(
      API_ENDPOINTS.tickets.create,
      {
        title: 'Problema com impressora',
        description: 'A impressora não está funcionando',
        priority: 'Alto',
        category: 'Hardware'
      }
    );
    
    console.log('Chamado criado:', newTicket);
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
  }
};
```

### Upload de Arquivo

```typescript
const handleUpload = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await apiUpload(
      API_ENDPOINTS.upload.file,
      formData
    );
    
    console.log('Arquivo enviado:', result.url);
  } catch (error) {
    console.error('Erro no upload:', error);
  }
};
```

## 🔐 Autenticação

O token JWT é automaticamente incluído nos headers quando você usa as funções `apiGet`, `apiPost`, etc.

### Como funciona:

1. Após login, salve o token:
   ```typescript
   localStorage.setItem('token', response.token);
   ```

2. As funções da API pegam automaticamente:
   ```typescript
   const token = localStorage.getItem('token');
   headers['Authorization'] = `Bearer ${token}`;
   ```

3. Para requisições sem autenticação:
   ```typescript
   await apiPost(url, data, false); // false = sem auth
   ```

## 🌐 Ambientes

### Desenvolvimento (localhost)
```
API_URL = http://localhost:3001
```

### Produção (Railway)
```
API_URL = https://seu-projeto.up.railway.app
```

A detecção é automática baseada em `import.meta.env.PROD`

## 📋 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuário atual

### Chamados
- `GET /api/tickets` - Listar todos
- `POST /api/tickets` - Criar novo
- `GET /api/tickets/:id` - Obter específico
- `PUT /api/tickets/:id` - Atualizar
- `DELETE /api/tickets/:id` - Deletar
- `PUT /api/tickets/:id/status` - Atualizar status
- `POST /api/tickets/:id/comments` - Adicionar comentário

### Usuários
- `GET /api/users` - Listar todos
- `POST /api/users` - Criar novo
- `PUT /api/users/:id` - Atualizar
- `DELETE /api/users/:id` - Deletar

### Base de Conhecimento
- `GET /api/kb` - Listar artigos
- `POST /api/kb` - Criar artigo
- `GET /api/kb/:id` - Obter artigo
- `GET /api/kb/search?q=termo` - Buscar

### Notificações
- `GET /api/notifications` - Listar
- `PUT /api/notifications/:id/read` - Marcar como lida
- `PUT /api/notifications/read-all` - Marcar todas

### Upload
- `POST /api/upload` - Upload de arquivo
- `POST /api/upload/image` - Upload de imagem
- `POST /api/upload/avatar` - Upload de avatar

### Health
- `GET /api/health` - Status da API

## 🐛 Debug

Para ver logs de debug em desenvolvimento, abra o console do navegador:

```
🔧 API Configuration:
  Environment: development
  API URL: http://localhost:3001
  Production: false
```

## ⚠️ Importante

1. **Nunca commite** a URL do Railway com credenciais
2. **Sempre teste** localmente antes de fazer deploy
3. **Verifique CORS** no backend para aceitar seu domínio
4. **Use HTTPS** em produção (Railway fornece automaticamente)

## 🆘 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se o backend está rodando
- Verifique a URL no `api.ts`
- Verifique CORS no backend

### Erro: "401 Unauthorized"
- Token expirado ou inválido
- Faça login novamente
- Verifique se o token está sendo salvo

### Erro: "CORS policy"
- Configure CORS no backend
- Adicione a URL do frontend na whitelist

## 📚 Mais Exemplos

Veja o arquivo `api.example.ts` para mais exemplos de uso!
