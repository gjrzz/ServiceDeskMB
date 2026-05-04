# 🎫 Central de Atendimento TI — Monte Bravo

<div align="center">

![Monte Bravo Service Desk](https://img.shields.io/badge/Monte%20Bravo-Service%20Desk-8B5CF6?style=for-the-badge)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-fbbf24?style=for-the-badge)
![Built with Kiro](https://img.shields.io/badge/Built%20with-Kiro-a78bfa?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-98%25-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-latest-646CFF?style=for-the-badge&logo=vite)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=threedotjs)

**Sistema completo de Service Desk para gestão de chamados de TI da Monte Bravo Corretora**

🔗 **[github.com/gjrzz/ServiceDeskMB](https://github.com/gjrzz/ServiceDeskMB)**

</div>

---

## 🤖 Desenvolvido com Kiro

> Este projeto foi inteiramente construído com o auxílio do **[Kiro](https://kiro.dev)** — IDE com agente de IA da Amazon, que permitiu iterar rapidamente sobre a arquitetura, implementar funcionalidades complexas e resolver bugs de forma conversacional, sem abrir mão da qualidade do código.
>
> Todo o sistema — desde o background animado com Three.js até o sistema de filas segregadas e a geração de relatórios em XLSX — foi desenvolvido através de prompts iterativos no Kiro, demonstrando o potencial de desenvolvimento assistido por IA para aplicações de nível empresarial.
>
> O projeto utiliza o template oficial do Google AI Studio ([google-gemini/aistudio-repository-template](https://github.com/google-gemini/aistudio-repository-template)) como base estrutural.

---

## 📋 Sobre o Projeto

A **Central de Atendimento TI** é uma Single Page Application (SPA) completa que oferece uma experiência de Service Desk profissional para a Monte Bravo Corretora. O sistema foi inspirado em plataformas como o ServiceNow, adaptado para a realidade da empresa com identidade visual própria em tons de roxo.

### ✨ Destaques Visuais

- **Background animado** com partículas Three.js em onda senoidal contínua
- **Paleta Monte Bravo**: tons de roxo (`#8B5CF6`), cinza escuro e branco
- **Tema claro/escuro** com transição suave e partículas que adaptam cor
- **Glassmorphism** nos cards com `backdrop-filter: blur`
- **Design system** completo com CSS variables

---

## 🚀 Funcionalidades

### 🔐 Autenticação e Controle de Acesso
- Login com e-mail e senha validados contra base de usuários
- Sessão persistida no `localStorage`
- Dois perfis: **Administrador** e **Usuário Padrão**
- Interface completamente diferente por perfil
- Verificação de sessões ativas ao desativar/excluir usuários

### 🎫 Gestão de Chamados
- Abertura de chamados com título, categoria, prioridade, descrição e impacto
- **Filas segregadas**:
  - 📥 **Fila Geral** — chamados sem responsável (qualquer admin pode assumir)
  - 👤 **Minha Fila** — chamados atribuídos ao admin logado
  - 👥 **Filas dos outros admins** — visível para todos, somente leitura
- Status: `Aberto` → `Em Andamento` → `Aguardando` → `Resolvido` / `Contestado` / `Fechado`
- **Sistema de Contestação**: comentário em chamado resolvido reabre automaticamente como "Contestado"
- SLA por prioridade: Crítico 4h | Alto 8h | Médio 24h | Baixo 72h
- Timeline completa de atividades, comentários públicos e notas internas

### 📊 Dashboard (Admin)
- Métricas em tempo real calculadas do estado global
- Gráficos SVG nativos: volume por dia e chamados por categoria
- Feed de atividade recente
- **Seção de Satisfação**: CSAT, NPS simplificado, taxa de resolução, distribuição de notas e comentários recentes

### 📚 Base de Conhecimento
- CRUD completo de artigos (somente admin)
- Renderizador de Markdown nativo sem biblioteca externa
- Busca em tempo real por título, tags e conteúdo
- Votação 👍/👎, artigos relacionados e sugestão ao abrir chamado

### 🔔 Notificações
- Painel via `ReactDOM.createPortal` (sem conflito de z-index)
- Notificações específicas por perfil (admin vs. usuário)
- Navegação direta ao clicar: abre o chamado/artigo exato

### 😊 Pesquisa de Satisfação
- Pop-up automático ao resolver chamado
- Pergunta principal + nota em estrelas + facilidade de uso + comentário livre
- Contesta e reabre automaticamente se usuário indicar problema não resolvido
- Métricas consolidadas no dashboard do admin

### 👥 Gestão de Usuários (Admin)
- CRUD completo com definição de perfil
- Ativação/desativação, redefinição de senha
- Proteções: não excluir a si mesmo, não excluir o último admin
- Log de auditoria de exclusões

### 📈 Relatórios
- Filtros por período, status e prioridade
- Seleção granular de colunas
- **Exportação CSV** com BOM UTF-8
- **Exportação XLSX** com 3 abas: Chamados, Resumo por Status, Por Responsável

---

## 🛠️ Stack Técnica

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **TypeScript** | latest | Tipagem estática em todo o projeto |
| **React** | 18 | Interface, estado e componentes |
| **Vite** | latest | Build tool e dev server |
| **Three.js** | r128 | Background animado de partículas |
| **Tailwind CSS** | latest | Utilitários de estilo |
| **JSZip** | 3.10 | Geração de arquivos XLSX |
| **localStorage** | — | Persistência de dados client-side |
| **ReactDOM.createPortal** | — | Notificações e pop-ups sem z-index conflict |

---

## 📁 Estrutura do Projeto

```
ServiceDeskMB/
│
├── src/                        # Código fonte TypeScript + React
│   └── ...                     # Componentes, contextos, views, utils
│
├── index.html                  # Entry point HTML
├── vite.config.ts              # Configuração do Vite
├── tsconfig.json               # Configuração do TypeScript
├── package.json                # Dependências e scripts
├── metadata.json               # Metadados do projeto (AI Studio)
├── .env.example                # Variáveis de ambiente de exemplo
├── .gitignore
└── README.md
```

---

## 🔑 Credenciais de Demonstração

| Perfil | E-mail | Senha |
|--------|--------|-------|
| **Administrador** | `gabriel.juarez@montebravo.com.br` | `admin123` |
| **Usuário Padrão** | `ana.lima@montebravo.com.br` | `user123` |

---

## ▶️ Como Executar

### 🏠 Desenvolvimento Local

```bash
# 1. Clonar o repositório
git clone https://github.com/gjrzz/ServiceDeskMB.git
cd ServiceDeskMB

# 2. Instalar dependências
npm install

# 3. Copiar variáveis de ambiente
cp .env.example .env

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` e faça login com as credenciais acima.

```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

### 🚀 Deploy em Produção

O sistema está pronto para deploy com backend no Railway e frontend no GitHub Pages.

**📖 Guia Completo de Deploy:**
1. **Comece aqui:** [`INICIO_AQUI.md`](./INICIO_AQUI.md) — Guia rápido visual
2. **Deploy Backend:** [`GUIA_RAILWAY_DEPLOY.md`](./GUIA_RAILWAY_DEPLOY.md) — Passo a passo do Railway
3. **Atualizar URL:** [`COMO_ATUALIZAR_URL_RAILWAY.md`](./COMO_ATUALIZAR_URL_RAILWAY.md) — Como configurar a API
4. **Checklist:** [`RAILWAY_CHECKLIST.md`](./RAILWAY_CHECKLIST.md) — Não esqueça nada
5. **Resumo Técnico:** [`RESUMO_CONFIGURACAO_API.md`](./RESUMO_CONFIGURACAO_API.md) — Detalhes da configuração

**⚡ Resumo Ultra-Rápido:**
```bash
# 1. Deploy backend no Railway (https://railway.app)
# 2. Copie a URL gerada
# 3. Atualize src/config/api.ts linha 14
# 4. Build e deploy do frontend
npm run build
```

**Tempo estimado:** 30-40 minutos

---

## 🗺️ Roadmap

### ✅ Concluído
- [x] Frontend completo com React + TypeScript
- [x] Sistema de autenticação e perfis
- [x] Gestão completa de chamados com filas segregadas
- [x] Dashboard com métricas e gráficos
- [x] Base de conhecimento com Markdown
- [x] Sistema de notificações
- [x] Pesquisa de satisfação
- [x] Relatórios com exportação CSV/XLSX
- [x] Backend com Node.js + Express + Prisma
- [x] Banco de dados PostgreSQL
- [x] API REST completa
- [x] Configuração para deploy no Railway
- [x] Documentação completa de deploy

### 🚧 Em Desenvolvimento
- [ ] Testes automatizados (Jest + React Testing Library)
- [ ] CI/CD com GitHub Actions

### 📋 Próximas Features
- [ ] Autenticação via Microsoft Entra ID (OAuth 2.0)
- [ ] Integração com Microsoft Teams (notificações)
- [ ] Suporte a anexos reais (Railway Storage ou S3)
- [ ] SLA com horário comercial (desconta fins de semana e feriados)
- [ ] App mobile (React Native)
- [ ] Websockets para notificações em tempo real
- [ ] Sistema de templates de resposta
- [ ] Automação de atribuição de chamados

---

## 👤 Autor

**Gabriel Juarez**  
Analista de TI — Monte Bravo Corretora  
Estudante de Engenharia de Software — FIAP (3º semestre)  
GitHub: [@gjrzz](https://github.com/gjrzz)

---

## 🏢 Sobre a Monte Bravo

A Monte Bravo é uma corretora de investimentos independente com foco em atendimento personalizado e soluções financeiras para pessoas físicas e jurídicas.

---

<div align="center">

**Construído com 🤖 [Kiro](https://kiro.dev) + ☕ + muito `console.log`**

*"De prompt em prompt, um Service Desk nasceu."*

</div>
