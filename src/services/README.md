# 📦 Serviços da API

Esta pasta contém todos os serviços que fazem a comunicação com o backend.

## 🎯 Objetivo

Substituir o uso de `localStorage` por chamadas à API REST do backend, mantendo a mesma interface para facilitar a migração.

## 📁 Estrutura

```
services/
├── auth.service.ts          # Autenticação (login, logout, registro)
├── user.service.ts          # Gerenciamento de usuários
├── ticket.service.ts        # Gerenciamento de chamados
├── kb.service.ts            # Base de conhecimento
├── notification.service.ts  # Notificações
├── index.ts                 # Exportação centralizada
└── README.md                # Este arquivo
```

## 🚀 Como Usar

### Importação

```typescript
// Importar serviço específico
import { AuthService } from '@/services';

// Ou importar função específica
import { login, logout } from '@/services/auth.service';
```

### Exemplos de Uso

#### 1. Autenticação

```typescript
import { AuthService } from '@/services';

// Login
const result = await AuthService.login({
  email: 'usuario@exemplo.com',
  senha: 'senha123'
});

if (result.success) {
  console.log('Usuário logado:', result.user);
} else {
  console.error('Erro:', result.message);
}

// Logout
await AuthService.logout();

// Verificar se está autenticado
const isAuth = AuthService.isAuthenticated();

// Obter usuário atual
const user = await AuthService.getCurrentUser();
```

#### 2. Usuários

```typescript
import { UserService } from '@/services';

// Listar usuários
const users = await UserService.listUsers();

// Criar usuário
const newUser = await UserService.createUser({
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  senha: 'senha123',
  departamento: 'TI',
  perfil: 'USUARIO'
});

// Atualizar usuário
const updated = await UserService.updateUser('user-id', {
  nome: 'João Silva Jr.',
  departamento: 'Desenvolvimento'
});

// Deletar usuário
await UserService.deleteUser('user-id');
```

#### 3. Tickets (Chamados)

```typescript
import { TicketService } from '@/services';

// Listar todos os tickets
const tickets = await TicketService.listTickets();

// Listar meus tickets
const myTickets = await TicketService.listMyTickets();

// Criar ticket
const newTicket = await TicketService.createTicket({
  titulo: 'Problema com impressora',
  descricao: 'A impressora não está funcionando',
  prioridade: 'MEDIO',
  categoria: 'HARDWARE'
});

// Atualizar status
const updated = await TicketService.updateTicketStatus('ticket-id', 'EM_ANDAMENTO');

// Adicionar comentário
await TicketService.addComment('ticket-id', 'Estou verificando o problema');

// Avaliar ticket
await TicketService.rateTicket('ticket-id', 5, true, 'Ótimo atendimento!');
```

#### 4. Base de Conhecimento

```typescript
import { KBService } from '@/services';

// Listar artigos publicados
const articles = await KBService.listArticles(true);

// Criar artigo
const newArticle = await KBService.createArticle({
  titulo: 'Como resetar senha',
  conteudo: 'Passo a passo...',
  categoria: 'Acesso',
  tags: ['senha', 'acesso', 'tutorial'],
  publicado: true
});

// Buscar artigos
const results = await KBService.searchArticles('impressora');

// Votar em artigo
await KBService.voteArticle('article-id', true); // útil
```

#### 5. Notificações

```typescript
import { NotificationService } from '@/services';

// Listar notificações
const notifications = await NotificationService.listNotifications();

// Contagem de não lidas
const count = await NotificationService.getUnreadCount();

// Marcar como lida
await NotificationService.markAsRead('notification-id');

// Marcar todas como lidas
await NotificationService.markAllAsRead();

// Deletar notificação
await NotificationService.deleteNotification('notification-id');
```

## 🔄 Migração do localStorage

### Antes (localStorage)

```typescript
// Salvar no localStorage
localStorage.setItem('mb_tickets', JSON.stringify(tickets));

// Ler do localStorage
const saved = localStorage.getItem('mb_tickets');
const tickets = saved ? JSON.parse(saved) : [];
```

### Depois (API)

```typescript
// Buscar da API
const tickets = await TicketService.listTickets();

// Criar novo ticket
const newTicket = await TicketService.createTicket(data);
```

## ⚠️ Tratamento de Erros

Todos os serviços lançam erros que devem ser tratados:

```typescript
try {
  const tickets = await TicketService.listTickets();
  // Sucesso
} catch (error) {
  console.error('Erro ao buscar tickets:', error);
  // Mostrar mensagem de erro ao usuário
}
```

## 🔐 Autenticação

Os serviços automaticamente incluem o token JWT nas requisições. O token é armazenado no `localStorage` após o login:

```typescript
// O token é salvo automaticamente no login
await AuthService.login({ email, senha });

// E incluído automaticamente em todas as requisições
const tickets = await TicketService.listTickets(); // Token incluído
```

## 📊 Status da Migração

- ✅ Serviços criados
- ⏳ Integração com Providers (próximo passo)
- ⏳ Testes de integração
- ⏳ Remoção do código legado de localStorage

## 🔗 Próximos Passos

1. Atualizar os Providers (AuthProvider, TicketProvider, etc.) para usar os serviços
2. Testar cada funcionalidade
3. Remover código legado de localStorage
4. Adicionar loading states e tratamento de erros na UI
