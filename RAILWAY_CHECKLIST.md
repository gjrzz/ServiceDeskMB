# ✅ Checklist de Deploy no Railway

Use este checklist para garantir que tudo está configurado corretamente.

## 📦 Preparação (Antes de começar)

- [ ] Conta criada no Railway.app
- [ ] Repositório no GitHub atualizado
- [ ] Backend testado localmente
- [ ] Chaves JWT geradas (use `node backend/generate-secrets.js`)

---

## 🗄️ Banco de Dados

- [ ] PostgreSQL criado no Railway
- [ ] URL do banco copiada
- [ ] Conexão testada

---

## 🔐 Variáveis de Ambiente (11 no total)

### Obrigatórias
- [ ] `DATABASE_URL` - URL do PostgreSQL do Railway
- [ ] `JWT_SECRET` - Chave aleatória de 64 caracteres
- [ ] `JWT_REFRESH_SECRET` - Outra chave diferente
- [ ] `NODE_ENV` - "production"
- [ ] `FRONTEND_URL` - URL do GitHub Pages

### Configurações
- [ ] `JWT_EXPIRES_IN` - "15m"
- [ ] `JWT_REFRESH_EXPIRES_IN` - "7d"
- [ ] `PORT` - "3001"
- [ ] `UPLOAD_DIR` - "./uploads"
- [ ] `MAX_FILE_SIZE` - "10485760"
- [ ] `RATE_LIMIT_WINDOW_MS` - "900000"
- [ ] `RATE_LIMIT_MAX_REQUESTS` - "100"

---

## ⚙️ Configuração do Serviço

- [ ] Build Command configurado:
  ```
  cd backend && npm install && npx prisma generate && npm run build
  ```

- [ ] Start Command configurado:
  ```
  cd backend && npx prisma migrate deploy && npm start
  ```

- [ ] Domain gerado no Railway

---

## 🚀 Deploy

- [ ] Primeiro deploy executado
- [ ] Logs verificados (sem erros)
- [ ] Migrations executadas com sucesso
- [ ] Servidor iniciado corretamente

---

## 🧪 Testes

- [ ] Endpoint `/api/health` responde
- [ ] Login funciona via Postman/curl
- [ ] Banco de dados acessível
- [ ] CORS configurado corretamente

---

## 🌐 Frontend

- [ ] URL do Railway copiada
- [ ] `src/config/api.ts` atualizado
- [ ] CORS no backend inclui URL do frontend
- [ ] Frontend compilado (`npm run build`)
- [ ] Deploy no GitHub Pages feito

---

## ✨ Teste Final

- [ ] Abrir aplicação no GitHub Pages
- [ ] Fazer login com usuário padrão
- [ ] Criar um chamado de teste
- [ ] Verificar se dados são salvos
- [ ] Testar logout e login novamente

---

## 📊 Monitoramento

- [ ] Verificar uso de créditos no Railway
- [ ] Configurar alertas (opcional)
- [ ] Salvar URL do backend em local seguro
- [ ] Documentar credenciais de acesso

---

## 🎉 Pronto!

Se todos os itens estão marcados, seu deploy está completo! 🚀

**URL do Backend:** `_______________________________________`

**URL do Frontend:** `_______________________________________`

**Data do Deploy:** `_______________________________________`

---

## 🆘 Problemas?

Consulte o arquivo `GUIA_RAILWAY_DEPLOY.md` seção "Troubleshooting"
