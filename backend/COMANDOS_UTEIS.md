# 🛠️ Comandos Úteis - Backend

Referência rápida de comandos para desenvolvimento.

## 🚀 Desenvolvimento

```bash
# Iniciar servidor em modo desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Iniciar servidor em produção
npm start
```

## 🗄️ Prisma

```bash
# Gerar cliente Prisma (após alterar schema)
npm run prisma:generate

# Criar nova migração
npm run prisma:migrate

# Aplicar migrações pendentes
npx prisma migrate deploy

# Resetar banco (CUIDADO: apaga tudo!)
npx prisma migrate reset

# Popular banco com dados de exemplo
npm run prisma:seed

# Abrir Prisma Studio (interface gráfica)
npm run prisma:studio

# Formatar schema.prisma
npx prisma format

# Validar schema
npx prisma validate

# Ver status das migrações
npx prisma migrate status
```

## 🔍 PostgreSQL

```bash
# Conectar ao PostgreSQL
psql postgres

# Conectar a um banco específico
psql -d servicedesk_mb

# Listar bancos de dados
\l

# Conectar a um banco
\c servicedesk_mb

# Listar tabelas
\dt

# Descrever tabela
\d usuarios

# Ver dados de uma tabela
SELECT * FROM usuarios;

# Sair
\q

# Criar banco via terminal
createdb servicedesk_mb

# Deletar banco via terminal
dropdb servicedesk_mb

# Backup do banco
pg_dump servicedesk_mb > backup.sql

# Restaurar backup
psql servicedesk_mb < backup.sql
```

## 🧪 Testes de API

### Health Check

```bash
curl http://localhost:3001/api/health
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gabriel@montebravo.com.br",
    "senha": "123456"
  }'
```

### Listar Usuários (com token)

```bash
# Substitua SEU_TOKEN pelo token recebido no login
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Criar Chamado

```bash
curl -X POST http://localhost:3001/api/tickets \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste de chamado",
    "descricao": "Descrição do problema",
    "prioridade": "MEDIO",
    "categoria": "SOFTWARE"
  }'
```

### Listar Chamados

```bash
curl http://localhost:3001/api/tickets \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar Chamado

```bash
curl http://localhost:3001/api/tickets/ID_DO_CHAMADO \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 📦 NPM

```bash
# Instalar dependências
npm install

# Instalar dependência específica
npm install nome-do-pacote

# Instalar dependência de desenvolvimento
npm install -D nome-do-pacote

# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated

# Limpar cache
npm cache clean --force

# Reinstalar tudo do zero
rm -rf node_modules package-lock.json
npm install
```

## 🐛 Debug

```bash
# Ver logs do PostgreSQL (Linux)
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Ver logs do PostgreSQL (macOS Homebrew)
tail -f /usr/local/var/log/postgres.log

# Verificar se porta 3001 está em uso
lsof -i :3001

# Matar processo na porta 3001
kill -9 $(lsof -t -i:3001)

# Ver processos Node rodando
ps aux | grep node

# Verificar uso de memória
node --max-old-space-size=4096 dist/server.js
```

## 🔧 Git

```bash
# Status
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: adicionar backend completo"

# Push
git push origin main

# Ver histórico
git log --oneline

# Criar branch
git checkout -b feature/nova-funcionalidade

# Voltar para main
git checkout main

# Merge
git merge feature/nova-funcionalidade
```

## 🚀 Deploy

### Heroku

```bash
# Login
heroku login

# Criar app
heroku create servicedesk-mb-backend

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Ver config
heroku config

# Setar variáveis de ambiente
heroku config:set JWT_SECRET="sua_chave_secreta"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# Ver logs
heroku logs --tail

# Executar migrações
heroku run npm run prisma:migrate

# Abrir app
heroku open
```

### Railway

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Adicionar PostgreSQL
railway add

# Deploy
railway up

# Ver logs
railway logs
```

### Docker

```bash
# Build
docker build -t servicedesk-backend .

# Run
docker run -p 3001:3001 servicedesk-backend

# Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## 📊 Monitoramento

```bash
# Ver uso de CPU/memória
top

# Ver uso de disco
df -h

# Ver conexões ativas no PostgreSQL
psql -d servicedesk_mb -c "SELECT * FROM pg_stat_activity;"

# Ver tamanho do banco
psql -d servicedesk_mb -c "SELECT pg_size_pretty(pg_database_size('servicedesk_mb'));"

# Ver tamanho das tabelas
psql -d servicedesk_mb -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

## 🧹 Limpeza

```bash
# Limpar node_modules
rm -rf node_modules

# Limpar dist
rm -rf dist

# Limpar uploads
rm -rf uploads/*

# Limpar logs
rm -rf *.log

# Limpar tudo
rm -rf node_modules dist uploads/*.* *.log
```

## 🔐 Segurança

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Gerar nova chave JWT (Linux/macOS)
openssl rand -base64 64

# Gerar nova chave JWT (Node)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## 📝 Logs

```bash
# Ver logs do servidor
tail -f logs/app.log

# Ver logs de erro
tail -f logs/error.log

# Ver logs em tempo real com filtro
tail -f logs/app.log | grep ERROR

# Limpar logs antigos
find logs/ -name "*.log" -mtime +30 -delete
```

## 🎯 Produtividade

```bash
# Alias úteis (adicione ao ~/.bashrc ou ~/.zshrc)
alias dev="npm run dev"
alias studio="npm run prisma:studio"
alias migrate="npm run prisma:migrate"
alias seed="npm run prisma:seed"
alias logs="tail -f logs/app.log"

# Recarregar aliases
source ~/.bashrc  # ou source ~/.zshrc
```

## 🆘 Troubleshooting

```bash
# PostgreSQL não inicia
sudo service postgresql start  # Linux
brew services start postgresql@14  # macOS

# Porta já em uso
lsof -ti:3001 | xargs kill -9

# Prisma Client desatualizado
npm run prisma:generate

# Migrações pendentes
npm run prisma:migrate

# Reset completo (CUIDADO!)
npx prisma migrate reset
npm run prisma:seed

# Verificar conexão com banco
psql -d servicedesk_mb -c "SELECT 1;"

# Verificar se servidor está respondendo
curl http://localhost:3001/api/health
```

---

## 💡 Dicas

1. Use `npm run dev` para desenvolvimento (hot reload)
2. Use `npm run prisma:studio` para visualizar dados
3. Sempre faça backup antes de `migrate reset`
4. Use variáveis de ambiente para senhas
5. Mantenha dependências atualizadas
6. Monitore logs em produção
7. Configure alertas para erros
8. Use TypeScript para evitar bugs

---

**Salve este arquivo para referência rápida!** 📌
