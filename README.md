# 🎫 Central de Atendimento TI — Monte Bravo

<div align="center">

![Monte Bravo Service Desk](https://img.shields.io/badge/Monte%20Bravo-Service%20Desk-8B5CF6?style=for-the-badge)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-fbbf24?style=for-the-badge)
![Built with Kiro](https://img.shields.io/badge/Built%20with-Kiro-a78bfa?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek0xMiAyMGMtNC40MiAwLTgtMy41OC04LThzMy41OC04IDgtOCA4IDMuNTggOCA4LTMuNTggOC04IDh6Ii8+PC9zdmc+)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=threedotjs)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwindcss)

**Sistema completo de Service Desk para gestão de chamados de TI da Monte Bravo Corretora**

</div>

---

## 🤖 Desenvolvido com Kiro

> Este projeto foi inteiramente construído com o auxílio do **[Kiro](https://kiro.dev)** — IDE com agente de IA da Amazon, que permitiu iterar rapidamente sobre a arquitetura, implementar funcionalidades complexas e resolver bugs de forma conversacional, sem abrir mão da qualidade do código.
>
> Todo o sistema — desde o background animado com Three.js até o sistema de filas segregadas e a geração de relatórios em XLSX — foi desenvolvido através de prompts iterativos no Kiro, demonstrando o potencial de desenvolvimento assistido por IA para aplicações de nível empresarial.

---

## 📋 Sobre o Projeto

A **Central de Atendimento TI** é uma Single Page Application (SPA) completa, desenvolvida em arquivo HTML único, que oferece uma experiência de Service Desk profissional para a Monte Bravo Corretora. O sistema foi inspirado em plataformas como o ServiceNow, adaptado para a realidade da empresa com identidade visual própria.

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
- Interface completamente diferente por perfil (admin vê tudo; usuário só vê seus chamados)
- Verificação de sessões ativas ao desativar/excluir usuários

### 🎫 Gestão de Chamados
- Abertura de chamados com título, categoria, prioridade, descrição e impacto
- **Filas segregadas**:
  - 📥 **Fila Geral** — chamados sem responsável (qualquer admin pode assumir)
  - 👤 **Minha Fila** — chamados atribuídos ao admin logado
  - 👥 **Filas dos outros admins** — visível para todos, somente leitura
- Status completo: `Aberto` → `Em Andamento` → `Aguardando` → `Resolvido` / `Contestado` / `Fechado`
- **Sistema de Contestação**: quando usuário comenta em chamado resolvido, ele é automaticamente reaberto como "Contestado"
- SLA por prioridade: Crítico 4h | Alto 8h | Médio 24h | Baixo 72h
- Timeline completa de atividades dentro de cada chamado
- Comentários públicos e notas internas (apenas admins)
- Exclusão individual e em massa com confirmação

### 📊 Dashboard (Admin)
- Métricas em tempo real calculadas do estado global
- Cards clicáveis que filtram a fila correspondente
- Gráfico de volume de chamados por dia (SVG nativo)
- Gráfico de chamados por categoria (donut SVG)
- Feed de atividade recente de todos os chamados
- **Seção de Satisfação**:
  - CSAT médio com estrelas
  - Taxa de resolução confirmada pelos usuários
  - NPS simplificado (promotores vs. detratores)
  - Facilidade de uso do sistema
  - Distribuição de notas com barras visuais
  - Comentários recentes dos usuários

### 📚 Base de Conhecimento
- Criação, edição e exclusão de artigos (somente admin)
- Renderizador de Markdown nativo (sem biblioteca externa)
- Busca em tempo real por título, tags e conteúdo
- Filtro por categorias: Hardware, Software, Rede, Segurança, Acesso, Outros
- Votação 👍/👎 com feedback persistido
- Artigos relacionados sugeridos automaticamente
- Rascunhos visíveis apenas para admins
- Integração com chamados: sugestão de artigos ao abrir novo chamado

### 🔔 Notificações
- Painel de notificações via portal React (sem z-index conflict)
- **Para Admins**: novo chamado aberto, chamado contestado, avaliação recebida, usuário criado, artigo publicado
- **Para Usuários**: status atualizado, responsável atribuído, chamado resolvido, comentário recebido
- Navegação direta ao clicar: leva ao chamado/artigo específico
- Marcar como lida, limpar todas, deletar individualmente
- Badge com contagem de não lidas

### 😊 Pesquisa de Satisfação
- Pop-up automático ao resolver chamado (se solicitante estiver logado)
- Verificação de avaliações pendentes no login
- Pergunta principal: "O problema foi resolvido?" (👍/👎)
- Pesquisa de satisfação: nota em estrelas (1-5), facilidade de uso (1-5), comentário livre
- Se não resolvido: contesta automaticamente e reabre o chamado
- Métricas exportadas para o dashboard do admin

### 👥 Gestão de Usuários (Admin)
- CRUD completo de usuários
- Definição de perfil: Administrador ou Usuário Padrão
- Ativação/desativação de contas
- Redefinição de senha
- Proteções: não excluir a si mesmo, não excluir o último admin
- Log de auditoria de exclusões

### 📈 Relatórios
- Modal de configuração completo com:
  - Filtros por período (7/15/30/60/90 dias ou todos)
  - Filtros por status e prioridade
  - Seleção granular de colunas
- **Exportação CSV**: com BOM UTF-8 para compatibilidade com Excel
- **Exportação XLSX**: 3 abas — Chamados, Resumo por Status, Por Responsável
- Colunas disponíveis: ID, Assunto, Solicitante, Responsável, Categoria, Prioridade, Status, Data Abertura, Data Resolução, Tempo de Resolução, SLA, Problema Resolvido, Nota de Satisfação
- Preview dinâmico: mostra quantos chamados serão incluídos antes de gerar

---

## 🛠️ Stack Técnica

| Tecnologia | Uso |
|-----------|-----|
| **React 18** (CDN) | Interface, estado e componentes |
| **Three.js r128** (CDN) | Background animado de partículas |
| **Tailwind CSS** (CDN) | Utilitários de estilo |
| **JSZip 3.10** (CDN) | Geração de arquivos XLSX |
| **Google Fonts** | Inter + JetBrains Mono |
| **localStorage** | Persistência de dados (tickets, usuários, artigos, sessão, tema) |
| **ReactDOM.createPortal** | Notificações e pop-ups sem conflito de z-index |

> Nenhum backend. Nenhum bundler. Um único arquivo `.html`.

---

## 📁 Estrutura do Projeto

```
index.html
│
├── <canvas id="bg-canvas">          # Three.js — background animado
├── <div id="root">                  # React app
│
├── CSS Variables (tema claro/escuro)
├── Animações globais (@keyframes)
│
├── Contexts/
│   ├── AuthContext                  # usuários, login, sessão
│   └── AppContext                   # tickets, artigos, notificações, tema
│
├── Components/
│   ├── Layout/
│   │   ├── Sidebar
│   │   ├── Header + SinoNotificacoes
│   │   └── ToastContainer
│   │
│   ├── Views/
│   │   ├── ViewDashboard
│   │   ├── ViewMeusChamados
│   │   ├── ViewFilasChamados
│   │   ├── ViewNovoChamado
│   │   ├── ViewKnowledgeBase
│   │   ├── ViewRelatorios
│   │   ├── ViewUsuarios
│   │   └── ViewConfiguracoes
│   │
│   ├── Modals/
│   │   ├── ModalChamado
│   │   ├── ModalArtigo
│   │   ├── ModalUsuario
│   │   ├── ModalGerarRelatorio
│   │   └── ConfirmDialog (global)
│   │
│   └── PopupSatisfacao
│
└── Utils/
    ├── formatarTempoRelativo()
    ├── calcularMetricasSatisfacao()
    ├── exportarCSV()
    └── exportarXLSX()
```

---

## 🔑 Credenciais de Demonstração

| Perfil | E-mail | Senha |
|--------|--------|-------|
| **Administrador** | `gabriel.juarez@montebravo.com.br` | `admin123` |
| **Usuário Padrão** | `ana.lima@montebravo.com.br` | `user123` |

---

## ▶️ Como Executar

Por ser um arquivo HTML único com todas as dependências via CDN:

```bash
# Opção 1: abrir direto no navegador
open index.html

# Opção 2: servidor local (recomendado para evitar restrições de CORS)
npx serve .
# ou
python -m http.server 8080
```

Acesse `http://localhost:8080` e faça login com as credenciais acima.

> **Requisito**: conexão com internet para carregar as dependências CDN (React, Three.js, Tailwind, JSZip).

---

## 🗺️ Roadmap

- [ ] Backend real com Node.js + Express
- [ ] Banco de dados PostgreSQL
- [ ] Autenticação via Microsoft Entra ID (OAuth 2.0)
- [ ] Integração com Microsoft Teams (notificações)
- [ ] Deploy no Azure App Service
- [ ] Suporte a anexos reais (Azure Blob Storage)
- [ ] SLA com horário comercial (desconta fins de semana e feriados)
- [ ] App mobile (React Native)

---

## 👤 Autor

**Gabriel Juarez**
Analista de TI — Monte Bravo Corretora
Estudante de Engenharia de Software — FIAP (3º semestre)

---

## 🏢 Sobre a Monte Bravo

A Monte Bravo é uma corretora de investimentos independente com foco em atendimento personalizado e soluções financeiras para pessoas físicas e jurídicas.

---

<div align="center">

**Construído com 🤖 [Kiro](https://kiro.dev) + ☕ + muito `console.log`**

*"De prompt em prompt, um Service Desk nasceu."*

</div>
