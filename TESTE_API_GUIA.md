# 🧪 Guia de Teste da API

## 🎯 Objetivo

Testar todos os serviços da API antes de integrar no código principal.

---

## 🚀 Como Usar

### 1️⃣ Certifique-se que o backend está rodando

```bash
cd backend
npm run dev
```

Deve aparecer:
```
✅ Conectado ao banco de dados PostgreSQL
🚀 Servidor rodando em http://localhost:3001
```

### 2️⃣ Ative a página de testes

Abra o arquivo `src/main.tsx` e **troque** a linha:

```typescript
import App from './App.tsx';
```

Por:

```typescript
import App from './TestApp.tsx';
```

Salve o arquivo.

### 3️⃣ Inicie o frontend

```bash
# Na raiz do projeto
npm run dev
```

### 4️⃣ Acesse a página de testes

Abra o navegador em: **http://localhost:5173**

Você verá uma interface de testes com vários botões.

---

## 🧪 Testes Disponíveis

### 🔐 Autenticação

1. **Login (Admin)**
   - Faz login com: `gabriel@montebravo.com.br` / `123456`
   - Salva o token no localStorage
   - Atualiza o status do usuário na tela

2. **Obter Usuário Atual**
   - Busca os dados do usuário logado
   - Usa o token salvo no localStorage

3. **Logout**
   - Remove o token do localStorage
   - Limpa o status do usuário

### 👥 Usuários

1. **Listar Usuários**
   - Lista todos os usuários do banco
   - Requer estar logado

2. **Criar Usuário**
   - Cria um novo usuário de teste
   - Email único gerado automaticamente

### 🎫 Tickets

1. **Listar Todos os Tickets**
   - Lista todos os tickets do sistema
   - Requer estar logado

2. **Meus Tickets**
   - Lista apenas os tickets do usuário logado
   - Requer estar logado

3. **Criar Ticket**
   - Cria um novo ticket de teste
   - Requer estar logado

### 📚 Base de Conhecimento

1. **Listar Artigos**
   - Lista todos os artigos da KB
   - Não requer autenticação (artigos públicos)

2. **Buscar "senha"**
   - Busca artigos que contenham "senha"
   - Testa a funcionalidade de busca

### 🔔 Notificações

1. **Listar Notificações**
   - Lista notificações do usuário logado
   - Requer estar logado

2. **Contar Não Lidas**
   - Retorna o número de notificações não lidas
   - Requer estar logado

---

## 📊 Interpretando os Resultados

### ✅ Sucesso

```
[10:30:45] 🔐 Testando login...
[10:30:46] ✅ Login bem-sucedido!
{
  "id": "clx123...",
  "nome": "Gabriel Juarez",
  "email": "gabriel@montebravo.com.br",
  ...
}
```

### ❌ Erro

```
[10:30:45] 🔐 Testando login...
[10:30:46] ❌ Erro: Credenciais inválidas
```

### ⚠️ Não Autenticado

```
[10:30:45] 👥 Listando usuários...
[10:30:46] ❌ Erro: HTTP error! status: 401
```

**Solução:** Faça login primeiro!

---

## 🔍 Verificando no Console do Navegador

Abra o **DevTools** (F12) e vá na aba **Console**. Você verá:

1. **Logs detalhados** de cada requisição
2. **Erros** se algo der errado
3. **Dados retornados** pela API

### Verificar Token

No console, digite:

```javascript
localStorage.getItem('token')
```

Deve retornar algo como: `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

---

## 🐛 Problemas Comuns

### 1. "Erro: HTTP error! status: 401"

**Causa:** Não está autenticado ou token expirou

**Solução:** 
1. Clique em "Login (Admin)"
2. Tente novamente

### 2. "Erro: Failed to fetch"

**Causa:** Backend não está rodando

**Solução:**
```bash
cd backend
npm run dev
```

### 3. "Erro: CORS"

**Causa:** Configuração de CORS no backend

**Solução:** Já está configurado, mas verifique se o backend está rodando na porta 3001

### 4. Nada aparece no console

**Causa:** Erro de importação ou sintaxe

**Solução:** 
1. Verifique o console do navegador (F12)
2. Verifique o terminal do frontend por erros

---

## ✅ Checklist de Testes

Marque conforme for testando:

### Autenticação
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas (teste manual)
- [ ] Obter usuário atual após login
- [ ] Logout
- [ ] Token persiste após refresh da página

### Usuários
- [ ] Listar usuários (logado)
- [ ] Criar novo usuário
- [ ] Tentar listar sem estar logado (deve dar erro 401)

### Tickets
- [ ] Listar todos os tickets
- [ ] Listar meus tickets
- [ ] Criar novo ticket
- [ ] Tickets aparecem com dados corretos

### Base de Conhecimento
- [ ] Listar artigos
- [ ] Buscar artigos
- [ ] Artigos aparecem com dados corretos

### Notificações
- [ ] Listar notificações
- [ ] Contar não lidas
- [ ] Notificações aparecem corretamente

---

## 🎓 Próximos Passos

Depois de testar tudo e confirmar que funciona:

1. **Volte o main.tsx ao normal:**
   ```typescript
   import App from './App.tsx';
   ```

2. **Comece a integração:**
   - Atualize o `AuthProvider` para usar `AuthService`
   - Atualize o `TicketProvider` para usar `TicketService`
   - E assim por diante...

3. **Documente problemas:**
   - Se encontrar algum bug, anote
   - Verifique os logs do backend
   - Verifique o Network tab do DevTools

---

## 📝 Notas Importantes

1. **Dados de Teste:** Os dados foram criados pelo seed. Você pode criar mais dados usando os botões de "Criar".

2. **Token Expira:** O token JWT expira em 15 minutos. Se der erro 401, faça login novamente.

3. **Banco de Dados:** Está usando o banco do Railway (produção). Cuidado ao deletar dados!

4. **Logs:** Todos os logs aparecem tanto no console da página quanto no console do navegador.

---

## 🆘 Precisa de Ajuda?

Se algo não funcionar:

1. Verifique se o backend está rodando
2. Verifique o console do navegador (F12)
3. Verifique o terminal do backend por erros
4. Verifique o arquivo `.env` do backend
5. Tente fazer logout e login novamente

---

**Boa sorte nos testes! 🚀**
