import React, { useEffect, useRef, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  Home,
  Ticket,
  PlusCircle,
  List,
  BookOpen,
  BarChart2,
  Settings as SettingsIcon,
  Bell,
  Search,
  User,
  LogOut,
  ChevronRight,
  MessageSquare,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Filter,
  ChevronDown,
  Monitor,
  Cpu,
  Network,
  Lock,
  Smartphone,
  Settings,
  Moon,
  Sun,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Activity,
  FileSpreadsheet,
} from "lucide-react";

// --- APP CONTEXT ---
interface ConfirmDialogOptions {
  titulo: string;
  mensagem: string;
  mensagemExtra?: string;
  textoBotao?: string;
  tipo?: 'perigo' | 'aviso';
  onConfirmar: () => void;
}

interface Notificacao {
  id: string;
  tipo: 'chamado_criado' | 'chamado_atualizado' | 'chamado_resolvido' | 'comentario_adicionado' | 'status_alterado' | 'prioridade_alterada' | 'kb_criado' | 'kb_editado' | 'usuario_criado';
  titulo: string;
  mensagem: string;
  linkTipo: 'chamado' | 'artigo' | 'usuario' | null;
  linkId: string | null;
  destinatarios: string[];
  lida: boolean;
  timestamp: Date;
}

interface AppContextType {
  pedirConfirmacao: (options: ConfirmDialogOptions) => void;
  fecharConfirm: () => void;
  showToast: (message: string, type?: "success" | "info" | "error") => void;
  confirmDialog: {
    aberto: boolean;
    titulo: string;
    mensagem: string;
    mensagemExtra?: string;
    textoBotao?: string;
    tipo?: 'perigo' | 'aviso';
    onConfirmar: () => void;
  };
  notificacoes: Notificacao[];
  criarNotificacao: (notif: Omit<Notificacao, 'id' | 'lida' | 'timestamp'>) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: (usuarioId: string, perfil: string) => void;
  deletarNotificacao: (id: string) => void;
  limparTodasNotificacoes: (usuarioId: string, perfil: string) => void;
  getNotificacoesDoUsuario: (usuarioId: string, perfil: string) => Notificacao[];
  getNaoLidas: (usuarioId: string, perfil: string) => number;
  navegarParaChamado: (id: string) => void;
  navegarParaArtigo: (id: string) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};

// --- THEME CONTEXT ---
type Tema = 'claro' | 'escuro';

interface ThemeContextType {
  tema: Tema;
  alternarTema: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [tema, setTema] = useState<Tema>(() => {
    return (localStorage.getItem('mb_tema') as Tema) || 'escuro';
  });

  const alternarTema = () => {
    const novo = tema === 'escuro' ? 'claro' : 'escuro';
    setTema(novo);
    localStorage.setItem('mb_tema', novo);
    
    // @ts-ignore
    if (window.__bgMaterial && window.__bgRenderer) {
      if (novo === 'claro') {
        // @ts-ignore
        window.__bgMaterial.color.setHex(0x7C3AED);
        // @ts-ignore
        window.__bgMaterial.opacity = 0.3;
        // @ts-ignore
        window.__bgRenderer.setClearColor(0xf5f3ff, 1);
      } else {
        // @ts-ignore
        window.__bgMaterial.color.setHex(0xb48cff);
        // @ts-ignore
        window.__bgMaterial.opacity = 0.6;
        // @ts-ignore
        window.__bgRenderer.setClearColor(0x0d0b14, 1);
      }
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema);
  }, [tema]);

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

// --- THREE.JS BACKGROUND ---
// Código movido para dentro do componente principal para evitar execução imediata

// --- TYPES & MOCK DATA ---
type Priority = "Baixo" | "Médio" | "Alto" | "Crítico";
type Status =
  | "Aberto"
  | "Em Andamento"
  | "Aguardando Aprovação"
  | "Aguardando"
  | "Resolvido"
  | "Fechado"
  | "Contestado";
type Category = "Hardware" | "Software" | "Rede" | "Acesso" | "Outros";

type Perfil = "admin" | "usuario";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: Perfil;
  departamento: string;
  avatar: string;
  ativo: boolean;
  criadoEm: string;
}

interface Attachment {
  name: string;
  size: number;
  type: string;
  url?: string; // Para armazenar URL do arquivo (simulado)
}

interface TicketData {
  id: string;
  title: string;
  requester: string;
  solicitanteId?: string;
  email?: string;
  priority: Priority;
  status: Status;
  category: Category;
  assignee: string;
  created: string;
  sla: string;
  description: string;
  attachments?: Attachment[];
}

const MOCK_TICKETS: TicketData[] = [
  {
    id: "TKT-0001",
    title: "VPN não conecta após troca de senha",
    requester: "Ana Lima",
    solicitanteId: "u002",
    email: "ana.lima@montebravo.com.br",
    priority: "Alto",
    status: "Aberto",
    category: "Rede",
    assignee: "Gabriel Juarez",
    created: "há 2 horas",
    sla: "6h restantes",
    description:
      "Troquei minha senha hoje de manhã e agora o cliente VPN diz que a autenticação falhou.",
    attachments: [
      {
        name: "erro_vpn_screenshot.png",
        size: 1024 * 1024 * 2.5, // 2.5MB
        type: "image/png",
        url: "https://via.placeholder.com/800x600/7C3AED/FFFFFF?text=Erro+VPN"
      },
      {
        name: "log_conexao.txt",
        size: 1024 * 15, // 15KB
        type: "text/plain",
        url: "https://exemplo.com/files/log_conexao.txt"
      }
    ]
  },
  {
    id: "TKT-0002",
    title: "Configuração de MacBook novo para João Silva",
    requester: "RH",
    priority: "Médio",
    status: "Em Andamento",
    category: "Hardware",
    assignee: "Carlos Mendes",
    created: "Ontem às 14:30",
    sla: "12h restantes",
    description:
      "Por favor, prepare um novo MacBook Pro para João Silva começando na próxima segunda-feira.",
  },
  {
    id: "TKT-0003",
    title: "Excel travando com planilhas grandes",
    requester: "Maria Santos",
    priority: "Baixo",
    status: "Resolvido",
    category: "Software",
    assignee: "Pedro Alves",
    created: "há 3 dias",
    sla: "Cumprido",
    description:
      "Toda vez que abro a planilha Financeira do Q3, o Excel trava e fecha.",
    attachments: [
      {
        name: "planilha_problematica.xlsx",
        size: 1024 * 1024 * 8.2, // 8.2MB
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        url: "https://exemplo.com/files/planilha_problematica.xlsx"
      },
      {
        name: "erro_excel.jpg",
        size: 1024 * 1024 * 1.8, // 1.8MB
        type: "image/jpeg",
        url: "https://via.placeholder.com/1200x800/FF6B6B/FFFFFF?text=Erro+Excel"
      }
    ]
  },
  {
    id: "TKT-0004",
    title: "Solicitação de acesso: pasta SharePoint Financeiro",
    requester: "João Silva",
    solicitanteId: "u003",
    email: "joao.silva@montebravo.com.br",
    priority: "Médio",
    status: "Aguardando Aprovação",
    category: "Acesso",
    assignee: "Não atribuído",
    created: "há 4 horas",
    sla: "20h restantes",
    description:
      "Preciso de acesso à pasta Financeiro para a próxima auditoria.",
  },
  {
    id: "TKT-0005",
    title: "CRÍTICO: Banco de dados de produção inacessível",
    requester: "Alerta de Sistema",
    priority: "Crítico",
    status: "Em Andamento",
    category: "Rede",
    assignee: "Gabriel Juarez",
    created: "há 15 minutos",
    sla: "3h 45m restantes",
    description:
      "Alerta automatizado: Tempo limite de conexão com o cluster de BD primário.",
  },
  {
    id: "TKT-0006",
    title: "Impressora da sala 302 offline",
    requester: "Ana Lima",
    solicitanteId: "u002",
    email: "ana.lima@montebravo.com.br",
    priority: "Baixo",
    status: "Aberto",
    category: "Hardware",
    assignee: "Não atribuído",
    created: "há 5 horas",
    sla: "67h restantes",
    description:
      "A impressora está mostrando um código de erro 49 e não imprime.",
  },
  {
    id: "TKT-0007",
    title: "Outlook não sincroniza no iPhone",
    requester: "Carlos Mendes",
    priority: "Médio",
    status: "Aberto",
    category: "Software",
    assignee: "Pedro Alves",
    created: "há 1 hora",
    sla: "23h restantes",
    description:
      "Meus e-mails não estão atualizando no meu telefone desde a atualização do iOS.",
  },
  {
    id: "TKT-0008",
    title: "Solicitação de monitor adicional — setup duplo",
    requester: "Maria Santos",
    priority: "Baixo",
    status: "Aberto",
    category: "Hardware",
    assignee: "Não atribuído",
    created: "há 1 dia",
    sla: "48h restantes",
    description:
      "Gostaria de um segundo monitor para melhorar a produtividade.",
  },
  {
    id: "TKT-0009",
    title: "MFA não funciona — usuário bloqueado",
    requester: "Pedro Alves",
    priority: "Crítico",
    status: "Resolvido",
    category: "Acesso",
    assignee: "Gabriel Juarez",
    created: "há 2 dias",
    sla: "Cumprido",
    description: "Perdi meu telefone e não consigo autenticar.",
  },
  {
    id: "TKT-0010",
    title: "Wi-Fi lento na sala de reuniões A",
    requester: "João Silva",
    solicitanteId: "u003",
    email: "joao.silva@montebravo.com.br",
    priority: "Médio",
    status: "Em Andamento",
    category: "Rede",
    assignee: "Carlos Mendes",
    created: "há 3 horas",
    sla: "21h restantes",
    description: "A conexão cai frequentemente durante chamadas de vídeo.",
  },
  {
    id: "TKT-0011",
    title: "Teams não abre após atualização do Windows",
    requester: "Equipe de Design",
    priority: "Médio",
    status: "Aberto",
    category: "Software",
    assignee: "Não atribuído",
    created: "há 6 horas",
    sla: "18h restantes",
    description: "Nossas licenças expiram na próxima semana, por favor renove.",
  },
  {
    id: "TKT-0012",
    title: "Solicitação de licença Adobe Acrobat",
    requester: "Recepção",
    priority: "Baixo",
    status: "Aguardando",
    category: "Software",
    assignee: "Gabriel Juarez",
    created: "há 4 dias",
    sla: "Pausado",
    description: "Preciso da nova senha para a rede de convidados deste mês.",
  },
  {
    id: "TKT-0013",
    title: "Notebook não liga — bateria ou placa",
    requester: "Ana Lima",
    solicitanteId: "u002",
    email: "ana.lima@montebravo.com.br",
    priority: "Alto",
    status: "Em Andamento",
    category: "Hardware",
    assignee: "Não atribuído",
    created: "há 2 horas",
    sla: "70h restantes",
    description: "A barra de espaço no meu teclado externo está travando.",
  },
  {
    id: "TKT-0014",
    title: "Redefinição de senha — Active Directory",
    requester: "Carlos Mendes",
    priority: "Médio",
    status: "Resolvido",
    category: "Acesso",
    assignee: "Não atribuído",
    created: "há 1 dia",
    sla: "Cumprido",
    description:
      "Recebendo um erro 403 Forbidden ao tentar acessar a wiki de engenharia.",
  },
  {
    id: "TKT-0015",
    title: "Lentidão geral no sistema após migração",
    requester: "Equipe de Segurança",
    priority: "Alto",
    status: "Aberto",
    category: "Rede",
    assignee: "Pedro Alves",
    created: "há 5 horas",
    sla: "3h restantes",
    description:
      "Implantar o patch mais recente do Zoom para resolver CVE-2026-1234.",
  },
];

const MOCK_ARTICLES = [
  {
    id: "KB-01",
    title: "Como redefinir sua senha corporativa",
    category: "Acesso",
    views: 1240,
    helpful: 95,
    updated: "há 2 dias",
  },
  {
    id: "KB-02",
    title: "Guia de configuração da VPN — Windows e Mac",
    category: "Rede",
    views: 856,
    helpful: 88,
    updated: "há 1 semana",
  },
  {
    id: "KB-03",
    title: "Configurando o Microsoft Authenticator (MFA)",
    category: "Segurança",
    views: 2105,
    helpful: 92,
    updated: "há 1 mês",
  },
  {
    id: "KB-04",
    title: "Como solicitar acesso a pastas compartilhadas",
    category: "Acesso",
    views: 432,
    helpful: 75,
    updated: "há 3 semanas",
  },
  {
    id: "KB-05",
    title: "Resolvendo problemas de sincronização do Outlook",
    category: "Software",
    views: 650,
    helpful: 81,
    updated: "há 5 dias",
  },
  {
    id: "KB-06",
    title: "Checklist de configuração inicial do MacBook",
    category: "Hardware",
    views: 320,
    helpful: 98,
    updated: "há 2 meses",
  },
  {
    id: "KB-07",
    title: "Como entrar em uma reunião pelo Teams",
    category: "Software",
    views: 150,
    helpful: 60,
    updated: "há 6 meses",
  },
  {
    id: "KB-08",
    title: "Configuração e solução de problemas de impressora",
    category: "Hardware",
    views: 980,
    helpful: 85,
    updated: "há 1 semana",
  },
  {
    id: "KB-09",
    title: "Guia de conexão via área de trabalho remota",
    category: "Rede",
    views: 540,
    helpful: 79,
    updated: "há 2 semanas",
  },
  {
    id: "KB-10",
    title: "Política de instalação de softwares",
    category: "Segurança",
    views: 1120,
    helpful: 90,
    updated: "há 3 meses",
  },
];

// --- UTILS ---
const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "Crítico":
      return "text-danger bg-danger/10 border-danger/20";
    case "Alto":
      return "text-warning bg-warning/10 border-warning/20";
    case "Médio":
      return "text-info bg-info/10 border-info/20";
    case "Baixo":
      return "text-text-muted bg-text-muted/10 border-text-muted/20";
    default:
      return "text-text-muted bg-text-muted/10 border-text-muted/20";
  }
};

const getStatusColor = (status: Status) => {
  switch (status) {
    case "Aberto":
      return "text-info bg-info/10 border-info/20";
    case "Em Andamento":
      return "text-accent-primary bg-accent-primary/10 border-accent-primary/20";
    case "Aguardando Aprovação":
      return "text-warning bg-warning/10 border-warning/20";
    case "Aguardando":
      return "text-warning bg-warning/10 border-warning/20";
    case "Resolvido":
      return "text-success bg-success/10 border-success/20";
    case "Fechado":
      return "text-text-muted bg-text-muted/10 border-text-muted/20";
    case "Contestado":
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    default:
      return "text-text-muted bg-text-muted/10 border-text-muted/20";
  }
};

// Utilitários para anexos
const isImageFile = (type: string) => {
  return type.startsWith('image/');
};

const getFileIcon = (type: string, name: string) => {
  if (isImageFile(type)) {
    return '🖼️';
  }
  
  const extension = name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📋';
    case 'zip':
    case 'rar':
    case '7z':
      return '🗜️';
    case 'txt':
      return '📃';
    case 'mp4':
    case 'avi':
    case 'mov':
      return '🎥';
    case 'mp3':
    case 'wav':
    case 'flac':
      return '🎵';
    default:
      return '📎';
  }
};

const generateFileUrl = (file: File | Attachment) => {
  // Em um sistema real, isso seria uma URL do servidor
  // Para demonstração, vamos criar URLs simuladas
  if (file instanceof File) {
    return URL.createObjectURL(file);
  }
  
  // Para anexos já salvos, simular uma URL
  return `https://exemplo.com/files/${file.name}`;
};

const downloadFile = (attachment: Attachment) => {
  // Em um sistema real, isso faria uma requisição para o servidor
  // Para demonstração, vamos simular o download
  const link = document.createElement('a');
  link.href = attachment.url || generateFileUrl(attachment);
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- COMPONENTS ---

// Componente para visualização de anexos
const AttachmentViewer = ({ attachment, onDownload }: { attachment: Attachment, onDownload: () => void }) => {
  const [showPreview, setShowPreview] = useState(false);
  const isImage = isImageFile(attachment.type);
  const fileIcon = getFileIcon(attachment.type, attachment.name);

  return (
    <>
      <div 
        className="flex items-center justify-between p-3 bg-bg-surface border border-border-subtle rounded-xl hover:border-accent-primary/50 transition-colors group cursor-pointer"
        onClick={() => isImage ? setShowPreview(true) : onDownload()}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary">
            <span className="text-sm">{fileIcon}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-text-primary truncate font-medium">{attachment.name}</span>
            <span className="text-[10px] text-text-muted">{(attachment.size / 1024 / 1024).toFixed(2)} MB</span>
            {isImage && (
              <span className="text-[10px] text-accent-primary">Clique para visualizar</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isImage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
              }}
              className="p-1 text-text-muted hover:text-accent-primary transition-colors"
              title="Visualizar imagem"
            >
              👁️
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="p-1 text-text-muted hover:text-accent-primary transition-colors"
            title="Baixar arquivo"
          >
            <ArrowDownRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal de preview para imagens */}
      <AnimatePresence>
        {showPreview && isImage && (
          <div 
            className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] bg-bg-surface rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{attachment.name}</h3>
                  <p className="text-sm text-text-muted">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={onDownload}
                    className="flex items-center gap-2"
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Baixar
                  </Button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center bg-bg-primary/50">
                <img
                  src={attachment.url || generateFileUrl(attachment)}
                  alt={attachment.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback se a imagem não carregar
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij5JbWFnZW0gbsOjbyBlbmNvbnRyYWRhPC90ZXh0Pgo8L3N2Zz4=';
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const ICONES_TIMELINE: Record<string, React.ReactNode> = {
  comment: <MessageSquare className="w-4 h-4 text-accent-primary" />,
  internal_comment: <MessageSquare className="w-4 h-4 text-warning" />,
  status_change: <Activity className="w-4 h-4 text-info" />,
  contestacao: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  reanalise: <RefreshCw className="w-4 h-4 text-accent-primary" />,
  default: <Activity className="w-4 h-4 text-text-muted" />
};

function Timeline({ historico, ticketAtivo }: { historico: any[], ticketAtivo: any }) {
  if (!historico || historico.length === 0) {
    return (
      <div className="relative pl-6 border-l-2 border-border-subtle space-y-8">
        <div className="relative">
          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-bg-surface border-2 border-border-subtle"></div>
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">
              {ticketAtivo.requester}
            </span>{" "}
            criou o chamado
          </p>
          <p className="text-xs text-text-muted mt-1">
            {ticketAtivo.created}
          </p>
        </div>
      </div>
    );
  }

  // Ordenar por timestamp (mais recente primeiro) se existir, senão manter ordem
  const historicoOrdenado = [...historico].sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return b.timestamp.getTime() - a.timestamp.getTime();
    }
    return 0;
  });

  return (
    <div className="relative pl-6 border-l-2 border-border-subtle space-y-8">
      {historicoOrdenado.map((entrada, idx) => {
        // Defesa contra entradas malformadas
        if (!entrada || !entrada.type) return null;

        const icone = ICONES_TIMELINE[entrada.type] || ICONES_TIMELINE.default;
        
        return (
          <div key={entrada.id || idx} className="relative">
            <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center">
              {icone}
            </div>
            
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-text-primary">
                {entrada.autor || 'Sistema'}
              </span>
              <span className="text-xs text-text-muted ml-auto">
                {entrada.time || 'Agora'}
              </span>
            </div>
            
            <div className="text-sm text-text-secondary bg-bg-elevated/30 p-3 rounded-lg border border-border-subtle" style={{ wordBreak: 'break-word' }}>
              {entrada.text}
            </div>
          </div>
        );
      })}
      <div className="relative">
        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-bg-surface border-2 border-border-subtle"></div>
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">
            {ticketAtivo.requester}
          </span>{" "}
          criou o chamado
        </p>
        <p className="text-xs text-text-muted mt-1">
          {ticketAtivo.created}
        </p>
        {ticketAtivo.attachments && ticketAtivo.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Anexos:</p>
            {ticketAtivo.attachments.map((anexo: any, i: number) => (
              <div key={i}>
                <AttachmentViewer
                  attachment={anexo}
                  onDownload={() => downloadFile(anexo)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ConfirmDialog = () => {
  const { confirmDialog, fecharConfirm } = useAppContext();
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!confirmDialog.aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !carregando) fecharConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmDialog.aberto, carregando, fecharConfirm]);

  if (!confirmDialog.aberto) return null;

  const handleConfirmar = async () => {
    setCarregando(true);
    try {
      await confirmDialog.onConfirmar();
    } catch (e) {
      console.error('Erro ao confirmar:', e);
    } finally {
      setCarregando(false);
      fecharConfirm();
    }
  };

  const handleCancelar = () => {
    if (carregando) return;
    fecharConfirm();
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={handleCancelar}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-bg-surface border border-border-subtle rounded-2xl max-w-md w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${confirmDialog.tipo === 'perigo' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">{confirmDialog.titulo}</h3>
        </div>

        <p className="text-text-secondary mb-4">{confirmDialog.mensagem}</p>

        {confirmDialog.mensagemExtra && (
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 mb-6">
            <p className="text-sm text-warning flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {confirmDialog.mensagemExtra}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleCancelar} disabled={carregando}>
            Cancelar
          </Button>
          <button
            onClick={handleConfirmar}
            disabled={carregando}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              confirmDialog.tipo === 'perigo'
                ? 'bg-danger text-white hover:bg-danger/90'
                : 'bg-warning text-black hover:bg-warning/90'
            }`}
          >
            {carregando ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : null}
            {confirmDialog.textoBotao || 'Confirmar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Badge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({
  children,
  className,
  ...props
}, ref) => (
  <span
    ref={ref}
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    {...props}
  >
    {children}
  </span>
));
Badge.displayName = "Badge";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  children,
  className = "",
  ...props
}, ref) => (
  <div
    ref={ref}
    className={`bg-bg-surface border border-border-subtle rounded-xl overflow-hidden backdrop-blur-md ${className}`}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}: any) => {
  const baseStyle =
    "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary cursor-pointer";
  const variants = {
    primary:
      "bg-accent-primary text-white hover:bg-accent-secondary focus:ring-accent-primary shadow-[0_0_15px_var(--color-accent-glow)]",
    secondary:
      "bg-white/5 text-text-primary hover:bg-white/10 focus:ring-white/20 border border-border-subtle",
    danger:
      "bg-danger/20 text-danger hover:bg-danger/30 focus:ring-danger border border-danger/30",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-white/5",
  };
  return (
    <button
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }: any) => (
  <input
    className={`w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all ${className}`}
    {...props}
  />
);

const Select = ({ className = "", children, ...props }: any) => (
  <select
    className={`w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all appearance-none cursor-pointer ${className}`}
    {...props}
  >
    {children}
  </select>
);

const AcessoNegado = () => {
  const { usuarioLogado } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-danger" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        Acesso Negado
      </h2>
      <p className="text-text-secondary mb-8 max-w-md">
        Você não tem permissão para acessar esta área. Esta seção é restrita a
        administradores.
      </p>
    </div>
  );
};

const UsuariosView = () => {
  const {
    usuarios,
    usuarioLogado,
    criarUsuario,
    editarUsuario,
    alterarStatusUsuario,
    redefinirSenha,
    excluirUsuario,
  } = useAuth();
  const { pedirConfirmacao, showToast } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const admins = usuarios.filter((u) => u.perfil === "admin").length;
  const inativos = usuarios.filter((u) => !u.ativo).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nome = (form.elements.namedItem("nome") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const departamento = (
      form.elements.namedItem("departamento") as HTMLSelectElement
    ).value;
    const perfil = (form.elements.namedItem("perfil") as HTMLSelectElement)
      .value as Perfil;
    const senha = (form.elements.namedItem("senha") as HTMLInputElement)?.value;
    const confirmarSenha = (
      form.elements.namedItem("confirmarSenha") as HTMLInputElement
    )?.value;

    if (!editingUser) {
      if (senha !== confirmarSenha) {
        showToast("As senhas não coincidem", "error");
        return;
      }
      if (usuarios.some((u) => u.email === email)) {
        showToast("Este e-mail já está em uso", "error");
        return;
      }
      criarUsuario({ nome, email, departamento, perfil, senha });
      showToast("Usuário criado com sucesso", "success");
    } else {
      editarUsuario(editingUser.id, { nome, email, departamento, perfil });
      if (isResettingPassword) {
        if (senha !== confirmarSenha) {
          showToast("As senhas não coincidem", "error");
          return;
        }
        redefinirSenha(editingUser.id, senha);
      }
      showToast("Usuário atualizado com sucesso", "success");
    }

    setShowModal(false);
    setEditingUser(null);
    setIsResettingPassword(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">
          Gerenciamento de Usuários
        </h2>
        <Button
          onClick={() => {
            setEditingUser(null);
            setIsResettingPassword(false);
            setShowModal(true);
          }}
          className="gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm font-medium text-text-secondary">
            Total de Usuários
          </p>
          <p className="text-3xl font-bold text-text-primary mt-2">
            {usuarios.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-text-secondary">
            Administradores
          </p>
          <p className="text-3xl font-bold text-accent-primary mt-2">
            {admins}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-text-secondary">
            Usuários Padrão
          </p>
          <p className="text-3xl font-bold text-info mt-2">
            {usuarios.length - admins}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-text-secondary">Inativos</p>
          <p className="text-3xl font-bold text-danger mt-2">{inativos}</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-text-secondary">
              <tr>
                <th className="px-6 py-3 font-medium">Usuário</th>
                <th className="px-6 py-3 font-medium">E-mail</th>
                <th className="px-6 py-3 font-medium">Perfil</th>
                <th className="px-6 py-3 font-medium">Departamento</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs ${u.perfil === "admin" ? "bg-accent-primary/20 text-accent-primary" : "bg-white/10 text-white"}`}
                      >
                        {u.avatar}
                      </div>
                      <span className="font-medium text-text-primary">
                        {u.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        u.perfil === "admin"
                          ? "bg-accent-primary/20 text-accent-primary"
                          : "bg-white/10 text-text-secondary"
                      }
                    >
                      {u.perfil === "admin" ? "Admin" : "Usuário"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {u.departamento}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        u.ativo
                          ? "bg-success/20 text-success"
                          : "bg-danger/20 text-danger"
                      }
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setIsResettingPassword(false);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-text-muted hover:text-accent-primary transition-colors"
                        title="Editar Usuário"
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (u.id === usuarioLogado?.id) {
                            showToast(
                              "Você não pode desativar seu próprio usuário.",
                              "error"
                            );
                            return;
                          }
                          pedirConfirmacao({
                            titulo: u.ativo ? 'Desativar Usuário' : 'Reativar Usuário',
                            mensagem: `Tem certeza que deseja ${u.ativo ? "desativar" : "reativar"} ${u.nome}?`,
                            textoBotao: u.ativo ? 'Desativar' : 'Reativar',
                            tipo: u.ativo ? 'perigo' : 'aviso',
                            onConfirmar: () => alterarStatusUsuario(u.id, !u.ativo)
                          });
                        }}
                        className={`p-1.5 transition-colors ${u.ativo ? "text-text-muted hover:text-danger" : "text-danger hover:text-success"}`}
                        title={u.ativo ? "Desativar Usuário" : "Ativar Usuário"}
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      {usuarioLogado?.id !== u.id && (
                        <button
                          onClick={() => {
                            const adminsAtivos = usuarios.filter(user => user.perfil === 'admin' && user.ativo).length;
                            if (u.perfil === 'admin' && adminsAtivos <= 1 && u.ativo) {
                              showToast("Não é possível excluir o último administrador ativo.", "error");
                              return;
                            }
                            pedirConfirmacao({
                              titulo: 'Excluir Usuário',
                              mensagem: `Deseja realmente excluir permanentemente o usuário ${u.nome}?`,
                              mensagemExtra: 'Todos os chamados abertos por ele perderão o vínculo com o solicitante. Esta ação não pode ser desfeita.',
                              textoBotao: 'Excluir Usuário',
                              tipo: 'perigo',
                              onConfirmar: () => excluirUsuario(u.id)
                            });
                          }}
                          className="p-1.5 text-text-muted hover:text-danger transition-colors"
                          title="Excluir Usuário Permanentemente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-bg-surface border border-border-subtle rounded-xl shadow-2xl z-[2000] p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-primary">
                  {editingUser ? "Editar Usuário" : "Novo Usuário"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Nome Completo *
                  </label>
                  <Input
                    name="nome"
                    required
                    defaultValue={editingUser?.nome}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    E-mail Corporativo *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    required
                    defaultValue={editingUser?.email}
                    disabled={!!editingUser}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Departamento *
                    </label>
                    <Select
                      name="departamento"
                      required
                      defaultValue={editingUser?.departamento || "TI"}
                    >
                      <option value="TI">TI</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Comercial">Comercial</option>
                      <option value="RH">RH</option>
                      <option value="Jurídico">Jurídico</option>
                      <option value="Operações">Operações</option>
                      <option value="Diretoria">Diretoria</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Perfil *
                    </label>
                    <Select
                      name="perfil"
                      required
                      defaultValue={editingUser?.perfil || "usuario"}
                    >
                      <option value="usuario">Usuário Padrão</option>
                      <option value="admin">Administrador</option>
                    </Select>
                  </div>
                </div>

                {(!editingUser || isResettingPassword) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        {editingUser ? "Nova Senha *" : "Senha Inicial *"}
                      </label>
                      <Input
                        name="senha"
                        type="password"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Confirmar Senha *
                      </label>
                      <Input
                        name="confirmarSenha"
                        type="password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                {editingUser && !isResettingPassword && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsResettingPassword(true)}
                      className="w-full text-sm"
                    >
                      Redefinir Senha
                    </Button>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowModal(false);
                      setIsResettingPassword(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingUser ? "Salvar Alterações" : "Criar Usuário"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ---- EXPORTAR CSV ----
function exportarCSV(linhas: any[], nomeArquivo: string, titulo: string) {
  const headers = Object.keys(linhas[0]);

  const escaparCSV = (val: any) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const linhasCSV = [
    // Linha de título
    `"${titulo}"`,
    `"Gerado em: ${new Date().toLocaleString('pt-BR')}"`,
    `"Total de chamados: ${linhas.length}"`,
    '',
    // Header
    headers.map(escaparCSV).join(','),
    // Dados
    ...linhas.map(linha => headers.map(h => escaparCSV(linha[h])).join(','))
  ];

  const conteudo = '\uFEFF' + linhasCSV.join('\n'); // BOM para Excel reconhecer UTF-8
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, nomeArquivo + '.csv');
}

// ---- EXPORTAR XLSX ---- (puro JS, sem biblioteca)
function exportarXLSX(linhas: any[], nomeArquivo: string, titulo: string, ticketsOriginais: any[], showToast: any) {
  return new Promise<void>((resolve, reject) => {
    const headers = Object.keys(linhas[0]);

    // Construir XML das planilhas
    function escaparXML(val: any) {
      return String(val ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    function celulaStr(val: any, bold = false) {
      const v = escaparXML(val);
      return `<c t="inlineStr"${bold ? ' s="1"' : ''}><is><t>${v}</t></is></c>`;
    }

    // Aba 1: Chamados
    const rowsChamados = [
      // Título
      `<row r="1"><c t="inlineStr" s="1"><is><t>${escaparXML(titulo)}</t></is></c></row>`,
      `<row r="2"><c t="inlineStr"><is><t>Gerado em: ${new Date().toLocaleString('pt-BR')}</t></is></c></row>`,
      `<row r="3"><c t="inlineStr"><is><t>Total: ${linhas.length} chamados</t></is></c></row>`,
      `<row r="4"></row>`,
      // Headers
      `<row r="5">${headers.map(h => celulaStr(h, true)).join('')}</row>`,
      // Dados
      ...linhas.map((linha, i) =>
        `<row r="${i + 6}">${headers.map(h => celulaStr(linha[h])).join('')}</row>`
      )
    ];

    // Aba 2: Resumo por status
    const resumoStatus = ['Aberto','Em Andamento','Aguardando','Contestado','Resolvido','Fechado'].map(s => ({
      status: s,
      total: ticketsOriginais.filter((t: any) => t.status === s).length
    }));

    const rowsResumo = [
      `<row r="1">${celulaStr('Status', true)}${celulaStr('Total', true)}</row>`,
      ...resumoStatus.map((r, i) =>
        `<row r="${i + 2}">${celulaStr(r.status)}${celulaStr(r.total)}</row>`
      ),
      `<row r="${resumoStatus.length + 3}">${celulaStr('TOTAL', true)}${celulaStr(ticketsOriginais.length, true)}</row>`
    ];

    // Aba 3: Resumo por responsável
    const porResponsavel: Record<string, any> = {};
    ticketsOriginais.forEach((t: any) => {
      const r = t.assignee || 'Não atribuído';
      if (!porResponsavel[r]) porResponsavel[r] = { total: 0, resolvidos: 0, notas: [] };
      porResponsavel[r].total++;
      if (t.status === 'Resolvido') porResponsavel[r].resolvidos++;
      if (t.avaliacao?.nota) porResponsavel[r].notas.push(t.avaliacao.nota);
    });

    const rowsResp = [
      `<row r="1">${celulaStr('Responsável',true)}${celulaStr('Total',true)}${celulaStr('Resolvidos',true)}${celulaStr('Média Satisfação',true)}</row>`,
      ...Object.entries(porResponsavel).map(([nome, dados], i) => {
        const media = dados.notas.length > 0
          ? (dados.notas.reduce((a: number,b: number)=>a+b,0)/dados.notas.length).toFixed(1)
          : 'N/A';
        return `<row r="${i+2}">${celulaStr(nome)}${celulaStr(dados.total)}${celulaStr(dados.resolvidos)}${celulaStr(media)}</row>`;
      })
    ];

    // Montar XLSX (formato ZIP com XMLs internos)
    const xmlSheet1 = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsChamados.join('')}</sheetData></worksheet>`;
    const xmlSheet2 = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsResumo.join('')}</sheetData></worksheet>`;
    const xmlSheet3 = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsResp.join('')}</sheetData></worksheet>`;

    const xmlWorkbook = `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Chamados" sheetId="1" r:id="rId1"/><sheet name="Resumo por Status" sheetId="2" r:id="rId2"/><sheet name="Por Responsável" sheetId="3" r:id="rId3"/></sheets></workbook>`;

    const xmlRels = `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/></Relationships>`;

    const xmlContentTypes = `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;

    const xmlRelsTop = `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

    // Usar JSZip via CDN para montar o arquivo
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => {
      const JSZip = (window as any).JSZip;
      const zip = new JSZip();
      zip.file('[Content_Types].xml', xmlContentTypes);
      zip.file('_rels/.rels', xmlRelsTop);
      zip.file('xl/workbook.xml', xmlWorkbook);
      zip.file('xl/_rels/workbook.xml.rels', xmlRels);
      zip.file('xl/worksheets/sheet1.xml', xmlSheet1);
      zip.file('xl/worksheets/sheet2.xml', xmlSheet2);
      zip.file('xl/worksheets/sheet3.xml', xmlSheet3);

      zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        .then((blob: Blob) => {
          downloadBlob(blob, nomeArquivo + '.xlsx');
          resolve();
        })
        .catch(reject);
    };
    script.onerror = () => {
      showToast('Excel indisponível, gerando CSV...', 'info');
      exportarCSV(linhas, nomeArquivo, titulo);
      resolve();
    };
    if (!(window as any).JSZip) {
      document.head.appendChild(script);
    } else {
      script.onload(new Event('load'));
    }
  });
}

// ---- DOWNLOAD HELPER ----
function downloadBlob(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = nomeArquivo;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Helper para parsear datas relativas do mock (ex: "há 2 horas", "Ontem às 14:30")
function parseDataRelativa(dateStr: string): Date {
  const agora = new Date();
  if (!dateStr || dateStr === "Agora mesmo") return agora;
  
  const lower = dateStr.toLowerCase();
  
  if (lower.includes("há")) {
    const match = lower.match(/há (\d+) (hora|horas|minuto|minutos|dia|dias)/);
    if (match) {
      const num = parseInt(match[1]);
      const unit = match[2];
      const d = new Date(agora);
      if (unit.startsWith("hora")) d.setHours(d.getHours() - num);
      if (unit.startsWith("minuto")) d.setMinutes(d.getMinutes() - num);
      if (unit.startsWith("dia")) d.setDate(d.getDate() - num);
      return d;
    }
  }
  
  if (lower.includes("ontem")) {
    const d = new Date(agora);
    d.setDate(d.getDate() - 1);
    const timeMatch = lower.match(/às (\d{2}):(\d{2})/);
    if (timeMatch) {
      d.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
    }
    return d;
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? agora : parsed;
}

async function gerarRelatorio(config: any, tickets: any[], showToast?: (msg: string, type?: any) => void) {
  const safeToast = showToast || ((msg: string) => console.log(msg));
  
  // 1. Filtrar tickets
  const agora = new Date();
  const diasMs = parseInt(config.periodo) * 86400000;

  let ticketsFiltrados = [...tickets];

  if (config.periodo !== '0') {
    ticketsFiltrados = ticketsFiltrados.filter(t => {
      const criadoEm = parseDataRelativa(t.created);
      return (agora.getTime() - criadoEm.getTime()) <= diasMs;
    });
  }

  if (config.statusFiltro && config.statusFiltro.length > 0) {
    ticketsFiltrados = ticketsFiltrados.filter(t =>
      config.statusFiltro.includes(t.status)
    );
  }

  if (config.prioridadeFiltro && config.prioridadeFiltro.length > 0) {
    ticketsFiltrados = ticketsFiltrados.filter(t =>
      config.prioridadeFiltro.includes(t.priority)
    );
  }

  // 2. Construir linhas de dados
  const SLA_HORAS: Record<string, number> = { 'Crítico': 4, 'Alto': 8, 'Médio': 24, 'Baixo': 72 };

  const linhas = ticketsFiltrados.map(t => {
    const criadoEm = parseDataRelativa(t.created);
    const resolvidoEm = t.atualizadoEm && ['Resolvido','Fechado'].includes(t.status)
      ? new Date(t.atualizadoEm) : null;

    const diffMs        = resolvidoEm ? resolvidoEm.getTime() - criadoEm.getTime() : agora.getTime() - criadoEm.getTime();
    const diffHoras     = diffMs / 3600000;
    const slaLimite     = SLA_HORAS[t.priority] || 24;
    const slaCumprido   = resolvidoEm ? (diffHoras <= slaLimite ? 'Cumprido' : 'Violado') : (diffHoras > slaLimite ? 'Violado' : 'Em andamento');

    function formatarDuracao(ms: number) {
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      if (h >= 24) return `${Math.floor(h/24)}d ${h%24}h`;
      return `${h}h ${m}m`;
    }

    function formatarData(d: Date | null) {
      if (!d) return '';
      return new Date(d).toLocaleString('pt-BR', {
        day:'2-digit', month:'2-digit', year:'numeric',
        hour:'2-digit', minute:'2-digit'
      });
    }

    const linha: Record<string, any> = {};
    const c = config.colunas;

    if (c.id)             linha['ID']               = t.id || '';
    if (c.titulo)         linha['Assunto']           = t.title || '';
    if (c.solicitante)    linha['Solicitante']       = t.requester || '';
    if (c.responsavel)    linha['Responsável']       = t.assignee || 'Não atribuído';
    if (c.categoria)      linha['Categoria']         = t.category || '';
    if (c.prioridade)     linha['Prioridade']        = t.priority || '';
    if (c.status)         linha['Status']            = t.status || '';
    if (c.criadoEm)       linha['Data Abertura']     = formatarData(criadoEm);
    if (c.resolvidoEm)    linha['Data Resolução']    = resolvidoEm ? formatarData(resolvidoEm) : 'Não resolvido';
    if (c.tempoResolucao) linha['Tempo de Resolução']= resolvidoEm ? formatarDuracao(diffMs) : formatarDuracao(agora.getTime() - criadoEm.getTime()) + ' (em aberto)';
    if (c.sla)            linha['SLA']               = `${slaCumprido} (limite: ${slaLimite}h)`;
    if (c.avaliacao)      linha['Problema Resolvido']= t.avaliacao?.ignorado ? 'Sem resposta' : t.avaliacao?.resolvido === true ? 'Sim' : t.avaliacao?.resolvido === false ? 'Não' : 'Não avaliado';
    if (c.notaSatisfacao) linha['Nota Satisfação']   = t.avaliacao?.nota ? `${t.avaliacao.nota}/5` : 'Não avaliado';

    return linha;
  });

  if (linhas.length === 0) {
    safeToast('Nenhum chamado encontrado com os filtros selecionados', 'info');
    return;
  }

  const nomeArquivo = `relatorio_chamados_${new Date().toISOString().slice(0,10)}`;

  if (config.formato === 'csv') {
    exportarCSV(linhas, nomeArquivo, config.titulo);
  } else {
    await exportarXLSX(linhas, nomeArquivo, config.titulo, ticketsFiltrados, safeToast);
  }
}

function ModalGerarRelatorio({ onFechar, tickets, showToast }: { onFechar: () => void, tickets: any[], showToast: any }) {
  const [config, setConfig] = useState({
    titulo: 'Relatório de Chamados — Central TI',
    periodo: '30',          // dias
    statusFiltro: [] as string[],       // [] = todos
    prioridadeFiltro: [] as string[],
    formato: 'xlsx',
    colunas: {
      id: true,
      titulo: true,
      solicitante: true,
      responsavel: true,
      categoria: true,
      prioridade: true,
      status: true,
      criadoEm: true,
      resolvidoEm: true,
      tempoResolucao: true,
      sla: true,
      avaliacao: true,
      notaSatisfacao: true,
    } as Record<string, boolean>
  });
  const [gerando, setGerando] = useState(false);

  const STATUS_OPCOES = ['Aberto','Em Andamento','Aguardando','Contestado','Resolvido','Fechado'];
  const PRIORIDADE_OPCOES = ['Crítico','Alto','Médio','Baixo'];

  function toggleFiltro(arr: string[], valor: string) {
    return arr.includes(valor) ? arr.filter(v => v !== valor) : [...arr, valor];
  }

  async function handleGerar() {
    setGerando(true);
    try {
      await gerarRelatorio(config, tickets, showToast);
      showToast('Relatório gerado com sucesso!', 'success');
      onFechar();
    } catch(e) {
      showToast('Erro ao gerar relatório', 'error');
    } finally {
      setGerando(false);
    }
  }

  const previewTickets = useMemo(() => {
    let r = [...tickets];
    if (config.periodo !== '0') {
      const diasMs = parseInt(config.periodo) * 86400000;
      const agora = new Date();
      r = r.filter(t => {
        const criadoEm = parseDataRelativa(t.created);
        return (agora.getTime() - criadoEm.getTime()) <= diasMs;
      });
    }
    if (config.statusFiltro.length > 0) r = r.filter(t => config.statusFiltro.includes(t.status));
    if (config.prioridadeFiltro.length > 0) r = r.filter(t => config.prioridadeFiltro.includes(t.priority));
    return r;
  }, [tickets, config]);

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' };
  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px' };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:3000, background:'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding: '16px' }}
         onClick={onFechar}>
      <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'16px', padding:'24px', width:'100%', maxWidth:'560px', maxHeight:'85vh', overflowY:'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
           onClick={e => e.stopPropagation()}>

        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px' }}>
          <h3 style={{ margin:0, color:'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700 }}>📊 Gerar Relatório</h3>
          <button onClick={onFechar} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'24px', lineHeight: 1 }}>&times;</button>
        </div>

        {/* Título do relatório */}
        <div style={{ marginBottom:'16px' }}>
          <label style={labelStyle}>Título do Relatório</label>
          <input
            value={config.titulo}
            onChange={e => setConfig(p => ({...p, titulo: e.target.value}))}
            style={inputStyle}
          />
        </div>

        {/* Período */}
        <div style={{ marginBottom:'16px' }}>
          <label style={labelStyle}>Período</label>
          <select value={config.periodo} onChange={e => setConfig(p => ({...p, periodo: e.target.value}))} style={inputStyle}>
            <option value="7">Últimos 7 dias</option>
            <option value="15">Últimos 15 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="60">Últimos 60 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="0">Todos os registros</option>
          </select>
        </div>

        {/* Filtro de status */}
        <div style={{ marginBottom:'16px' }}>
          <label style={labelStyle}>Status (vazio = todos)</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {STATUS_OPCOES.map(s => (
              <button
                key={s}
                onClick={() => setConfig(p => ({...p, statusFiltro: toggleFiltro(p.statusFiltro, s)}))}
                style={{
                  padding:'4px 10px', borderRadius:'99px', fontSize:'12px', cursor:'pointer', transition: 'all 0.2s',
                  background: config.statusFiltro.includes(s) ? 'var(--color-accent-primary)' : 'var(--bg-elevated)',
                  color: config.statusFiltro.includes(s) ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${config.statusFiltro.includes(s) ? 'var(--color-accent-primary)' : 'var(--border-subtle)'}`,
                }}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Filtro de prioridade */}
        <div style={{ marginBottom:'16px' }}>
          <label style={labelStyle}>Prioridade (vazio = todas)</label>
          <div style={{ display:'flex', gap:'6px' }}>
            {PRIORIDADE_OPCOES.map(p => (
              <button
                key={p}
                onClick={() => setConfig(prev => ({...prev, prioridadeFiltro: toggleFiltro(prev.prioridadeFiltro, p)}))}
                style={{
                  flex:1, padding:'4px 8px', borderRadius:'6px', fontSize:'12px', cursor:'pointer', transition: 'all 0.2s',
                  background: config.prioridadeFiltro.includes(p) ? 'var(--color-accent-primary)' : 'var(--bg-elevated)',
                  color: config.prioridadeFiltro.includes(p) ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${config.prioridadeFiltro.includes(p) ? 'var(--color-accent-primary)' : 'var(--border-subtle)'}`,
                }}
              >{p}</button>
            ))}
          </div>
        </div>

        {/* Colunas */}
        <div style={{ marginBottom:'20px' }}>
          <label style={labelStyle}>Colunas a incluir</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {[
              ['id',             '🔖 ID do Chamado'],
              ['titulo',         '📝 Título/Assunto'],
              ['solicitante',    '👤 Solicitante'],
              ['responsavel',    '🔧 Responsável'],
              ['categoria',      '📂 Categoria'],
              ['prioridade',     '⚡ Prioridade'],
              ['status',         '🔵 Status'],
              ['criadoEm',       '📅 Data Abertura'],
              ['resolvidoEm',    '✅ Data Resolução'],
              ['tempoResolucao', '⏱️ Tempo de Resolução'],
              ['sla',            '🎯 SLA'],
              ['avaliacao',      '👍 Problema Resolvido'],
              ['notaSatisfacao', '⭐ Nota de Satisfação'],
            ].map(([key, label]) => (
              <label key={key} style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13px', color:'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={config.colunas[key]}
                  onChange={e => setConfig(p => ({...p, colunas: {...p.colunas, [key]: e.target.checked}}))}
                  style={{ accentColor: 'var(--color-accent-primary)', width:'16px', height:'16px', borderRadius: '4px' }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Formato */}
        <div style={{ marginBottom:'20px' }}>
          <label style={labelStyle}>Formato de exportação</label>
          <div style={{ display:'flex', gap:'8px' }}>
            {[['xlsx','📊 Excel (.xlsx)'],['csv','📄 CSV (.csv)']].map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setConfig(p => ({...p, formato: val}))}
                style={{
                  flex:1, padding:'10px', borderRadius:'8px', cursor:'pointer', transition: 'all 0.2s',
                  background: config.formato === val ? 'var(--color-accent-primary)' : 'var(--bg-elevated)',
                  border: `2px solid ${config.formato === val ? 'var(--color-accent-primary)' : 'var(--border-subtle)'}`,
                  color: config.formato === val ? '#fff' : 'var(--text-secondary)',
                  fontWeight: config.formato === val ? 600 : 400,
                }}
              >{lbl}</button>
            ))}
          </div>
        </div>

        <div style={{ background:'var(--bg-elevated)', borderRadius:'8px', padding:'12px 16px', marginBottom:'20px', fontSize:'13px', color:'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
          📋 O relatório incluirá <strong style={{color:'var(--text-primary)'}}>{previewTickets.length} chamados</strong> com <strong style={{color:'var(--text-primary)'}}>{Object.values(config.colunas).filter(Boolean).length} colunas</strong>
        </div>

        {/* Botões */}
        <div style={{ display:'flex', gap:'12px' }}>
          <button onClick={onFechar} style={{ flex:1, padding:'10px', background:'transparent', border:'1px solid var(--border-subtle)', borderRadius:'8px', color:'var(--text-muted)', cursor:'pointer', fontWeight: 500, transition: 'all 0.2s' }} className="hover:bg-white/5 hover:text-text-primary">
            Cancelar
          </button>
          <button
            onClick={handleGerar}
            disabled={gerando}
            style={{ flex:2, padding:'10px', background:'var(--color-accent-primary)', color:'#fff', border:'none', borderRadius:'8px', cursor: gerando ? 'not-allowed' : 'pointer', fontWeight:600, opacity: gerando ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition: 'all 0.2s' }}
            className="hover:bg-accent-hover"
          >
            {gerando ? '⏳ Gerando...' : `📥 Gerar ${config.formato.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- VIEWS ---

const Reports = () => {
  const { tickets } = useTickets();
  const { showToast } = useAppContext();
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);

  const categoryCount = tickets.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const categoryData = [
    {
      name: "Hardware",
      value: categoryCount["Hardware"] || 0,
      color: "#8B5CF6",
    },
    {
      name: "Software",
      value: categoryCount["Software"] || 0,
      color: "#a78bfa",
    },
    { name: "Rede", value: categoryCount["Rede"] || 0, color: "#34d399" },
    { name: "Acesso", value: categoryCount["Acesso"] || 0, color: "#fbbf24" },
    { name: "Outros", value: categoryCount["Outros"] || 0, color: "#5c5478" },
  ].filter((d) => d.value > 0);

  const priorityCount = tickets.reduce(
    (acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const priorityData = [
    { name: "Crítico", value: priorityCount["Crítico"] || 0, color: "#f87171" },
    { name: "Alto", value: priorityCount["Alto"] || 0, color: "#fbbf24" },
    { name: "Médio", value: priorityCount["Médio"] || 0, color: "#818cf8" },
    { name: "Baixo", value: priorityCount["Baixo"] || 0, color: "#5c5478" },
  ].filter((d) => d.value > 0);

  const resolutionData = [
    { name: "Semana 1", time: 4.2 },
    { name: "Semana 2", time: 3.8 },
    { name: "Semana 3", time: 4.5 },
    { name: "Semana 4", time: 3.1 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Relatórios</h2>
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => setModalRelatorioAberto(true)} 
            title="Configurar e Gerar Relatório"
            className="p-2.5 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center group"
          >
            <FileSpreadsheet className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <Select className="w-48">
            <option>Últimos 30 Dias</option>
            <option>Últimos 7 Dias</option>
            <option>Neste Trimestre</option>
            <option>Neste Ano</option>
          </Select>
        </div>
      </div>

      {modalRelatorioAberto && (
        <ModalGerarRelatorio 
          onFechar={() => setModalRelatorioAberto(false)} 
          tickets={tickets} 
          showToast={showToast} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-text-primary mb-6">
            Chamados por Categoria
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-bg-surface)",
                    borderColor: "var(--color-border-subtle)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {categoryData.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                ></div>
                {cat.name} ({cat.value})
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-text-primary mb-6">
            Chamados por Prioridade
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-subtle)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-bg-surface)",
                    borderColor: "var(--color-border-subtle)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  cursor={{ fill: "rgba(139, 92, 246, 0.05)" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-text-primary mb-6">
            Tempo Médio de Resolução (Horas)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={resolutionData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-subtle)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-bg-surface)",
                    borderColor: "var(--color-border-subtle)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "var(--color-accent-primary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="var(--color-accent-primary)"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "var(--color-accent-primary)",
                    strokeWidth: 2,
                    stroke: "var(--color-bg-primary)",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { usuarioLogado, editarUsuario, redefinirSenha, logExclusoes, limparLog } = useAuth();
  const { tema, alternarTema } = useTheme();
  const { pedirConfirmacao, showToast } = useAppContext();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nome = (form.elements.namedItem("nome") as HTMLInputElement).value;
    const departamento = (
      form.elements.namedItem("departamento") as HTMLSelectElement
    ).value;

    if (usuarioLogado) {
      editarUsuario(usuarioLogado.id, { nome, departamento });
      showToast("Perfil atualizado com sucesso!");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const senhaAtual = (
      form.elements.namedItem("senhaAtual") as HTMLInputElement
    ).value;
    const novaSenha = (form.elements.namedItem("novaSenha") as HTMLInputElement)
      .value;
    const confirmarSenha = (
      form.elements.namedItem("confirmarSenha") as HTMLInputElement
    ).value;

    if (usuarioLogado) {
      if (senhaAtual !== usuarioLogado.senha) {
        showToast("Senha atual incorreta!", "error");
        return;
      }
      if (novaSenha !== confirmarSenha) {
        showToast("As novas senhas não coincidem!", "error");
        return;
      }
      redefinirSenha(usuarioLogado.id, novaSenha);
      showToast("Senha atualizada com sucesso!");
      form.reset();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <h2 className="text-2xl font-bold text-text-primary">Configurações</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          {[
            { id: "general", label: "Geral", icon: SettingsIcon },
            { id: "profile", label: "Perfil", icon: User },
            { id: "security", label: "Segurança", icon: Lock },
            ...(usuarioLogado?.perfil === 'admin' ? [{ id: "audit", label: "Log de Auditoria", icon: List }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${activeTab === tab.id ? "bg-accent-primary/20 text-accent-primary" : "bg-white/5 text-text-primary hover:bg-white/10"}`}
            >
              <tab.icon
                className={`w-5 h-5 ${activeTab === tab.id ? "text-accent-primary" : "text-text-secondary"}`}
              />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          {activeTab === "general" && (
            <>
              <Card className="p-6 space-y-6">
                <h3 className="text-lg font-medium text-text-primary border-b border-border-subtle pb-4">
                  Preferências Gerais
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-text-primary">
                        Tema
                      </h4>
                      <p className="text-xs text-text-secondary">
                        Selecione o tema da interface
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => tema !== 'claro' && alternarTema()}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${tema === 'claro' ? 'border-accent-primary bg-accent-primary/5' : 'border-border-subtle bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-3">
                          <Sun className="w-6 h-6 text-orange-500" />
                        </div>
                        <p className="font-medium text-sm text-text-primary">Claro</p>
                        <p className="text-xs text-text-muted">Interface clara e limpa</p>
                      </button>
                      <button
                        onClick={() => tema !== 'escuro' && alternarTema()}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${tema === 'escuro' ? 'border-accent-primary bg-accent-primary/5' : 'border-border-subtle bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center mb-3">
                          <Moon className="w-6 h-6 text-accent-primary" />
                        </div>
                        <p className="font-medium text-sm text-text-primary">Escuro</p>
                        <p className="text-xs text-text-muted">Interface escura e moderna</p>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                    <div>
                      <h4 className="text-sm font-medium text-text-primary">
                        Idioma
                      </h4>
                      <p className="text-xs text-text-secondary">
                        Idioma do aplicativo
                      </p>
                    </div>
                    <Select className="w-40 py-1.5 text-sm">
                      <option>Português (BR)</option>
                      <option>English (US)</option>
                      <option>Spanish</option>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                    <div>
                      <h4 className="text-sm font-medium text-text-primary">
                        Fuso Horário
                      </h4>
                      <p className="text-xs text-text-secondary">
                        Defina seu fuso horário local
                      </p>
                    </div>
                    <Select className="w-40 py-1.5 text-sm">
                      <option>UTC-3 (Brasília)</option>
                      <option>UTC-5 (Eastern)</option>
                      <option>UTC+0 (London)</option>
                    </Select>
                  </div>
                </div>
              </Card>

              {usuarioLogado?.perfil === "admin" && (
                <Card className="p-6 space-y-6">
                  <h3 className="text-lg font-medium text-text-primary border-b border-border-subtle pb-4">
                    Configuração de SLA
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">
                          SLA Prioridade Crítica
                        </h4>
                        <p className="text-xs text-text-secondary">
                          Tempo de resolução alvo (horas)
                        </p>
                      </div>
                      <Input
                        type="number"
                        defaultValue="4"
                        className="w-24 py-1.5 text-sm text-center"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">
                          SLA Prioridade Alta
                        </h4>
                        <p className="text-xs text-text-secondary">
                          Tempo de resolução alvo (horas)
                        </p>
                      </div>
                      <Input
                        type="number"
                        defaultValue="8"
                        className="w-24 py-1.5 text-sm text-center"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button>Salvar Alterações</Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {activeTab === "profile" && (
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-medium text-text-primary border-b border-border-subtle pb-4">
                Meu Perfil
              </h3>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Nome Completo
                  </label>
                  <Input
                    name="nome"
                    required
                    defaultValue={usuarioLogado?.nome}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    E-mail Corporativo
                  </label>
                  <Input
                    name="email"
                    type="email"
                    disabled
                    defaultValue={usuarioLogado?.email}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    O e-mail não pode ser alterado.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Departamento
                  </label>
                  <Select
                    name="departamento"
                    required
                    defaultValue={usuarioLogado?.departamento}
                  >
                    <option value="TI">TI</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Comercial">Comercial</option>
                    <option value="RH">RH</option>
                    <option value="Jurídico">Jurídico</option>
                    <option value="Operações">Operações</option>
                    <option value="Diretoria">Diretoria</option>
                  </Select>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit">Atualizar Perfil</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-medium text-text-primary border-b border-border-subtle pb-4">
                Alterar Senha
              </h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Senha Atual
                  </label>
                  <Input name="senhaAtual" type="password" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Nova Senha
                  </label>
                  <Input
                    name="novaSenha"
                    type="password"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Confirmar Nova Senha
                  </label>
                  <Input
                    name="confirmarSenha"
                    type="password"
                    required
                    minLength={6}
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit">Alterar Senha</Button>
                </div>
              </form>
            </Card>
          )}
          {activeTab === "audit" && usuarioLogado?.perfil === "admin" && (
            <Card className="p-6 space-y-6 overflow-hidden">
              <div className="flex justify-between items-center border-b border-border-subtle pb-4">
                <div>
                  <h3 className="text-lg font-medium text-text-primary">Log de Auditoria</h3>
                  <p className="text-xs text-text-secondary">Registro de exclusões permanentes do sistema</p>
                </div>
                <Button 
                  variant="outline" 
                  className="text-danger border-danger/20 hover:bg-danger/10"
                  onClick={() => {
                    pedirConfirmacao({
                      titulo: 'Limpar Log de Auditoria',
                      mensagem: 'Deseja realmente limpar todo o log de auditoria?',
                      mensagemExtra: 'Esta ação não pode ser desfeita.',
                      textoBotao: 'Limpar Log',
                      tipo: 'perigo',
                      onConfirmar: () => limparLog()
                    });
                  }}
                >
                  Limpar Log
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-muted uppercase border-b border-border-subtle">
                    <tr>
                      <th className="px-4 py-3">Data/Hora</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Executor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {logExclusoes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                          Nenhum registro de exclusão encontrado.
                        </td>
                      </tr>
                    ) : (
                      logExclusoes.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                            {new Date(log.data).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={
                              log.tipo === 'ticket' ? 'bg-accent-primary/10 text-accent-primary' :
                              log.tipo === 'artigo' ? 'bg-info/10 text-info' :
                              'bg-danger/10 text-danger'
                            }>
                              {log.tipo.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-text-primary font-medium">{log.itemNome}</p>
                            <p className="text-[10px] text-text-muted font-mono">{log.itemId}</p>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            {log.executor}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DashboardView = ({
  onOpenTicket,
  setCurrentView,
}: {
  onOpenTicket: (t: TicketData) => void;
  setCurrentView?: (v: string) => void;
}) => {
  const { tickets, setFiltros } = useTickets();
  const { usuarioLogado } = useAuth();

  const abertos = tickets.filter((t) => t.status === "Aberto").length;
  const emAndamento = tickets.filter((t) => t.status === "Em Andamento").length;
  const resolvidos = tickets.filter((t) => t.status === "Resolvido").length;

  const meusChamados = tickets.filter(
    (t) =>
      t.solicitanteId === usuarioLogado?.id &&
      t.status !== "Resolvido" &&
      t.status !== "Fechado",
  );

  const handleCardClick = (status: string) => {
    if (setCurrentView) {
      setFiltros(prev => ({ ...prev, status }));
      setCurrentView('all-tickets');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Chamados Abertos",
            value: abertos.toString(),
            trend: "↑3 desde ontem",
            trendUp: false,
            color: "text-info",
            status: "Aberto"
          },
          {
            label: "Em Andamento",
            value: emAndamento.toString(),
            trend: "Estável",
            trendUp: true,
            color: "text-accent-primary",
            status: "Em Andamento"
          },
          {
            label: "Resolvidos",
            value: resolvidos.toString(),
            trend: "↑5 desde ontem",
            trendUp: true,
            color: "text-success",
            status: "Resolvido"
          },
          {
            label: "SLA Violado",
            value: "2",
            trend: "Ação necessária",
            trendUp: false,
            color: "text-danger",
            status: "todos"
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleCardClick(stat.status)}
            className="cursor-pointer"
          >
            <Card className="p-6 relative overflow-hidden group hover:border-accent-primary/50 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
              <p className="text-sm font-medium text-text-secondary">
                {stat.label}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className={stat.trendUp ? "text-success" : "text-danger"}>
                  {stat.trend}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-medium text-text-primary mb-6">
            Volume de Chamados (7 dias)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: "Seg", tickets: 45 },
                  { name: "Ter", tickets: 52 },
                  { name: "Qua", tickets: 38 },
                  { name: "Qui", tickets: 65 },
                  { name: "Sex", tickets: 48 },
                  { name: "Sáb", tickets: 25 },
                  { name: "Dom", tickets: 30 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-accent-primary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-accent-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-subtle)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-bg-surface)",
                    borderColor: "var(--color-border-subtle)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "var(--color-accent-primary)" }}
                />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="var(--color-accent-primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTickets)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-text-primary mb-6">
            Atividade Recente
          </h3>
          <div className="space-y-6">
            {tickets.slice(0, 5).map((ticket, i) => (
              <div key={i} className="flex gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs shrink-0 bg-accent-primary`}
                >
                  {ticket.requester.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium text-text-primary">
                      {ticket.requester}
                    </span>{" "}
                    abriu o{" "}
                    <span className="text-accent-primary cursor-pointer hover:underline" onClick={() => onOpenTicket(ticket)}>
                      {ticket.id}
                    </span>
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {ticket.created}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* My Open Tickets */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <h3 className="text-lg font-medium text-text-primary">
            Meus Chamados Abertos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-text-secondary">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Título</th>
                <th className="px-6 py-3 font-medium">Prioridade</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {meusChamados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Nenhum chamado aberto no momento.
                  </td>
                </tr>
              ) : (
                meusChamados.slice(0, 5).map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onOpenTicket(ticket)}
                    className="hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-text-secondary group-hover:text-accent-primary transition-colors">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4 text-text-primary font-medium truncate max-w-xs">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {ticket.created}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

const AllTicketsView = ({
  onOpenTicket,
  isMyTickets = false,
  selectedTickets,
  setSelectedTickets,
}: {
  onOpenTicket: (t: TicketData) => void;
  isMyTickets?: boolean;
  selectedTickets: string[];
  setSelectedTickets: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const { tickets, filtros, setFiltros, deletarChamados, deletarChamado, atualizarStatus, atualizarPrioridade, atribuirResponsavel } = useTickets();
  const { usuarioLogado, usuarios } = useAuth();
  const { pedirConfirmacao, showToast } = useAppContext();
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Forçar re-renderização quando tickets mudarem
  const [, forceUpdate] = useState({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  useEffect(() => {
    forceUpdate({});
    setLastUpdate(Date.now());
  }, [tickets]);

  const filteredTickets = tickets.filter((t) => {
    if (isMyTickets) {
      // Para admins: mostrar chamados atribuídos a eles
      // Para usuários: mostrar chamados que eles abriram
      if (usuarioLogado?.perfil === 'admin') {
        return t.assignee === usuarioLogado.nome;
      } else {
        return t.solicitanteId === usuarioLogado?.id;
      }
    }

    const matchBusca =
      (t.title?.toLowerCase() || "").includes((filtros.busca || "").toLowerCase()) ||
      (t.id?.toLowerCase() || "").includes((filtros.busca || "").toLowerCase()) ||
      (t.requester?.toLowerCase() || "").includes((filtros.busca || "").toLowerCase());
    const matchStatus =
      filtros.status === "todos" || t.status === filtros.status;
    const matchPrioridade =
      filtros.prioridade === "todas" || t.priority === filtros.prioridade;

    return matchBusca && matchStatus && matchPrioridade;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-text-primary">
          {isMyTickets 
            ? (usuarioLogado?.perfil === 'admin' ? "Chamados Atribuídos a Mim" : "Meus Chamados") 
            : "Todos os Chamados"
          }
        </h2>
        {!isMyTickets && (
          <div className="flex gap-2">
            <Button variant="secondary">
              <Filter className="w-4 h-4 mr-2" /> Filtrar
            </Button>
            <button 
              onClick={() => {
                const config = {
                  titulo: 'Exportação de Chamados — Lista Geral',
                  periodo: '0',
                  statusFiltro: filtros.status === 'todos' ? [] : [filtros.status],
                  prioridadeFiltro: filtros.prioridade === 'todas' ? [] : [filtros.prioridade],
                  formato: 'xlsx',
                  colunas: { id: true, titulo: true, solicitante: true, responsavel: true, categoria: true, prioridade: true, status: true, criadoEm: true, resolvidoEm: true, tempoResolucao: true, sla: true, avaliacao: true, notaSatisfacao: true }
                };
                gerarRelatorio(config, filteredTickets, showToast);
              }}
              title="Exportar para Excel"
              className="p-2 bg-accent-primary/10 text-accent-primary rounded-lg hover:bg-accent-primary hover:text-white transition-all duration-200 border border-accent-primary/20 flex items-center justify-center group"
            >
              <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {isMyTickets && (
        <Card className="p-6 mb-6 border-l-4 border-l-accent-primary">
          <p className="text-lg font-medium text-text-primary">
            Você tem{" "}
            {
              filteredTickets.filter(
                (t) => t.status !== "Resolvido" && t.status !== "Fechado",
              ).length
            }{" "}
            {usuarioLogado?.perfil === 'admin' ? 'chamados atribuídos' : 'chamados abertos'}
          </p>
        </Card>
      )}

      <Card className="p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Buscar chamados..."
            className="pl-10"
            value={filtros.busca}
            onChange={(e: any) =>
              setFiltros({ ...filtros, busca: e.target.value })
            }
          />
        </div>
        <Select
          className="w-40"
          value={filtros.status}
          onChange={(e: any) =>
            setFiltros({ ...filtros, status: e.target.value })
          }
        >
          <option value="todos">Todos os Status</option>
          <option value="Aberto">Aberto</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Resolvido">Resolvido</option>
          <option value="Contestado">Contestado</option>
        </Select>
        <Select
          className="w-40"
          value={filtros.prioridade}
          onChange={(e: any) =>
            setFiltros({ ...filtros, prioridade: e.target.value })
          }
        >
          <option value="todas">Todas Prioridades</option>
          <option value="Crítico">Crítico</option>
          <option value="Alto">Alto</option>
          <option value="Médio">Médio</option>
          <option value="Baixo">Baixo</option>
        </Select>
      </Card>

      <Card className="p-0 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table key={lastUpdate} className="w-full text-left text-sm">
            <thead className="bg-black/20 text-text-secondary">
              <tr>
                {usuarioLogado?.perfil === 'admin' && !isMyTickets && (
                  <th className="px-6 py-3 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-border-subtle bg-bg-surface text-accent-primary focus:ring-accent-primary"
                      checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTickets(filteredTickets.map(t => t.id));
                        else setSelectedTickets([]);
                      }}
                    />
                  </th>
                )}
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Título</th>
                {!isMyTickets && (
                  <th className="px-6 py-3 font-medium">Solicitante</th>
                )}
                <th className="px-6 py-3 font-medium">Categoria</th>
                <th className="px-6 py-3 font-medium">Prioridade</th>
                <th className="px-6 py-3 font-medium">Status</th>
                {!isMyTickets && (
                  <th className="px-6 py-3 font-medium">Responsável</th>
                )}
                <th className="px-6 py-3 font-medium">Criado em</th>
                {usuarioLogado?.perfil === 'admin' && !isMyTickets && (
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  {usuarioLogado?.perfil === 'admin' && !isMyTickets && (
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-border-subtle bg-bg-surface text-accent-primary focus:ring-accent-primary"
                        checked={selectedTickets.includes(ticket.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTickets([...selectedTickets, ticket.id]);
                          else setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
                        }}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 font-mono text-text-secondary group-hover:text-accent-primary transition-colors" onClick={() => onOpenTicket(ticket)}>
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4 text-text-primary font-medium truncate max-w-[200px]" onClick={() => onOpenTicket(ticket)}>
                    {ticket.title}
                  </td>
                  {!isMyTickets && (
                    <td className="px-6 py-4 text-text-secondary" onClick={() => onOpenTicket(ticket)}>
                      {ticket.requester}
                    </td>
                  )}
                  <td className="px-6 py-4 text-text-secondary" onClick={() => onOpenTicket(ticket)}>
                    {ticket.category}
                  </td>
                  <td className="px-6 py-4" onClick={() => onOpenTicket(ticket)}>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4" onClick={() => onOpenTicket(ticket)}>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </td>
                  {!isMyTickets && (
                    <td className="px-6 py-4 text-text-secondary" onClick={() => onOpenTicket(ticket)}>
                      {ticket.assignee}
                    </td>
                  )}
                  <td className="px-6 py-4 text-text-secondary" onClick={() => onOpenTicket(ticket)}>
                    {ticket.created}
                  </td>
                  {usuarioLogado?.perfil === 'admin' && !isMyTickets && (
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => {
                          pedirConfirmacao({
                            titulo: 'Excluir Chamado',
                            mensagem: `Tem certeza que deseja excluir o chamado ${ticket.id}?`,
                            mensagemExtra: 'Esta ação não pode ser desfeita.',
                            textoBotao: 'Excluir Chamado',
                            tipo: 'perigo',
                            onConfirmar: () => deletarChamado(ticket.id)
                          });
                        }}
                        className="p-2 text-text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                        title="Excluir Chamado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTickets.length === 0 && (
          <div className="p-12 text-center text-text-muted">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum chamado encontrado para sua busca.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

const NewTicketView = ({ onSubmit, onCancel, onOpenArticle }: { onSubmit: () => void, onCancel: () => void, onOpenArticle: (artigo: Artigo) => void }) => {
  const [loading, setLoading] = useState(false);
  const { criarChamado } = useTickets();
  const { artigos } = useKB();
  const { showToast } = useAppContext();
  const [titulo, setTitulo] = useState('');
  const [sugestao, setSugestao] = useState<Artigo | null>(null);
  const [anexos, setAnexos] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (titulo.length > 5) {
        const words = (titulo || "").toLowerCase().split(' ').filter(w => w.length > 3);
        const match = artigos.find(a => 
          a.publicado && (
            words.some(w => (a.titulo || "").toLowerCase().includes(w)) ||
            a.tags.some(t => words.includes((t || "").toLowerCase()))
          )
        );
        setSugestao(match || null);
      } else {
        setSugestao(null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [titulo, artigos]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndAddFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB

    newFiles.forEach(file => {
      if (file.size > maxSize) {
        showToast(`O arquivo ${file.name} excede o limite de 5MB`, 'error');
      } else {
        validFiles.push(file);
      }
    });

    setAnexos(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndAddFiles(e.target.files);
    }
  };

  const removerAnexo = (index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const category = (form.elements[1] as HTMLSelectElement).value as Category;
    const priority = (form.elements[2] as HTMLSelectElement).value as Priority;
    const description = (form.elements[3] as HTMLTextAreaElement).value;

    const anexosMetadados = anexos.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: generateFileUrl(file)
    }));

    setTimeout(() => {
      criarChamado({ 
        title: titulo, 
        category, 
        priority, 
        description,
        attachments: anexosMetadados
      });
      setLoading(false);
      onSubmit();
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <h2 className="text-2xl font-bold text-text-primary">Novo Chamado</h2>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Título
              </label>
              <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Resumo breve do problema..." required />
              
              <AnimatePresence>
                {sugestao && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                    <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-3 flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-text-primary mb-1">💡 Antes de abrir um chamado, veja se este artigo resolve:</p>
                        <button type="button" onClick={() => onOpenArticle(sugestao)} className="text-sm text-accent-primary hover:underline text-left">
                          "{sugestao.titulo}"
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Categoria
                </label>
                <Select required>
                  <option value="">Selecione a categoria</option>
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Rede</option>
                  <option>Acesso</option>
                  <option>Outros</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Prioridade
                </label>
                <Select required>
                  <option value="Baixo">Baixo</option>
                  <option value="Médio">Médio</option>
                  <option value="Alto">Alto</option>
                  <option value="Crítico">Crítico</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Descrição
              </label>
              <textarea
                className="w-full bg-bg-primary border border-border-subtle rounded-lg px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all min-h-[150px] resize-y"
                placeholder="Por favor, forneça o máximo de detalhes possível..."
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Anexos
              </label>
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  dragActive 
                    ? "border-accent-primary bg-accent-primary/5" 
                    : "border-border-subtle hover:bg-white/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className={`w-8 h-8 mx-auto mb-2 transition-colors ${dragActive ? "text-accent-primary" : "text-text-muted"}`} />
                <p className="text-sm text-text-secondary">
                  Arraste e solte arquivos aqui, ou{" "}
                  <span className="text-accent-primary">
                    clique para selecionar
                  </span>
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Tamanho máximo por arquivo: 5MB
                </p>
              </div>

              {anexos.length > 0 && (
                <div className="mt-4 space-y-2">
                  {anexos.map((file, index) => {
                    const isImage = isImageFile(file.type);
                    const fileIcon = getFileIcon(file.type, file.name);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-bg-surface border border-border-subtle rounded-lg group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {isImage ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-primary border border-border-subtle">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback para ícone se a imagem não carregar
                                  const container = e.currentTarget.parentElement;
                                  if (container) {
                                    container.innerHTML = `<div class="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary"><span class="text-lg">${fileIcon}</span></div>`;
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                              <span className="text-lg">{fileIcon}</span>
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm text-text-primary truncate font-medium">{file.name}</span>
                            <span className="text-[10px] text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            {isImage && (
                              <span className="text-[10px] text-accent-primary">Imagem • Preview disponível</span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removerAnexo(index);
                          }}
                          className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                          title="Remover arquivo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enviando...
                </span>
              ) : (
                "Enviar Chamado"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  const renderLine = (line: string, index: number) => {
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-bold text-accent-primary border-b border-border-subtle pb-2 mt-6 mb-4">{line.replace('## ', '')}</h2>;
    }
    if (line.startsWith('- [ ] ')) {
      return <div key={index} className="flex items-center gap-2 my-1"><div className="w-4 h-4 border border-text-muted rounded-sm shrink-0" /><span>{formatText(line.replace('- [ ] ', ''))}</span></div>;
    }
    if (line.startsWith('- [x] ')) {
      return <div key={index} className="flex items-center gap-2 my-1"><div className="w-4 h-4 bg-accent-primary rounded-sm flex items-center justify-center shrink-0"><CheckCircle className="w-3 h-3 text-white" /></div><span className="text-text-secondary line-through">{formatText(line.replace('- [x] ', ''))}</span></div>;
    }
    if (line.startsWith('- ')) {
      return <li key={index} className="ml-4 list-disc marker:text-accent-primary my-1">{formatText(line.replace('- ', ''))}</li>;
    }
    if (line.trim() === '') {
      return <br key={index} />;
    }
    return <p key={index} className="my-2 leading-relaxed">{formatText(line)}</p>;
  };

  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-text-primary">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-black/30 text-accent-primary px-1.5 py-0.5 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return <div className="text-text-secondary">{content.split('\n').map(renderLine)}</div>;
};

const ArtigoView = ({ artigo, onBack, onEdit }: { artigo: Artigo, onBack: () => void, onEdit: () => void }) => {
  const { usuarioLogado } = useAuth();
  const { deletarArtigo, votarArtigo } = useKB();
  const { pedirConfirmacao } = useAppContext();
  const [votou, setVotou] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleVote = (util: boolean) => {
    votarArtigo(artigo.id, util);
    setVotou(true);
    if (!util) setShowFeedback(true);
  };

  const handleDelete = () => {
    pedirConfirmacao({
      titulo: 'Excluir Artigo',
      mensagem: `Tem certeza que deseja excluir o artigo "${artigo.titulo}"?`,
      mensagemExtra: 'Esta ação não pode ser desfeita.',
      textoBotao: 'Excluir Artigo',
      tipo: 'perigo',
      onConfirmar: () => {
        deletarArtigo(artigo.id);
        onBack();
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row gap-8">
      <div className="flex-1 space-y-8">
        <div>
          <button onClick={onBack} className="text-sm text-text-muted hover:text-accent-primary mb-4 flex items-center gap-1 transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" /> Voltar para Base de Conhecimento
          </button>
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-accent-primary/20 text-accent-primary">{artigo.categoria}</Badge>
            {usuarioLogado?.perfil === 'admin' && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={onEdit} className="gap-2 h-8 text-xs"><SettingsIcon className="w-3 h-3" /> Editar</Button>
                <Button variant="outline" onClick={handleDelete} className="gap-2 h-8 text-xs text-danger border-danger/20 hover:bg-danger/10"><X className="w-3 h-3" /> Excluir</Button>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">{artigo.titulo}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
            <span>Por {artigo.autor}</span>
            <span>•</span>
            <span>Criado em {new Date(artigo.criadoEm).toLocaleDateString()}</span>
            <span>•</span>
            <span>Atualizado em {new Date(artigo.atualizadoEm).toLocaleDateString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {artigo.visualizacoes} visualizações</span>
          </div>
        </div>

        <Card className="p-8 bg-bg-surface/50">
          <MarkdownRenderer content={artigo.conteudo} />
        </Card>

        <div className="border-t border-border-subtle pt-8">
          {!votou ? (
            <div className="flex items-center gap-4">
              <span className="text-text-primary font-medium">Este artigo foi útil?</span>
              <button onClick={() => handleVote(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-success/20 hover:text-success transition-colors text-text-secondary"><ThumbsUp className="w-4 h-4" /> Sim</button>
              <button onClick={() => handleVote(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-danger/20 hover:text-danger transition-colors text-text-secondary"><ThumbsDown className="w-4 h-4" /> Não</button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-success font-medium flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Obrigado pelo feedback!</p>
              {showFeedback && (
                <div className="flex gap-2 max-w-md">
                  <Input value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="O que podemos melhorar? (opcional)" />
                  <Button onClick={() => setShowFeedback(false)}>Enviar</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-80 space-y-6 shrink-0">
        <Card className="p-5">
          <h3 className="font-medium text-text-primary mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {artigo.tags.map(tag => (
              <Badge key={tag} className="bg-white/5 text-text-secondary hover:bg-accent-primary/20 hover:text-accent-primary cursor-pointer transition-colors">#{tag}</Badge>
            ))}
          </div>
        </Card>
        
        <Card className="p-5 bg-gradient-to-br from-accent-primary/10 to-transparent border-accent-primary/20">
          <h3 className="font-medium text-text-primary mb-2">Não encontrou o que procurava?</h3>
          <p className="text-sm text-text-secondary mb-4">Nossa equipe de suporte está pronta para ajudar.</p>
          <Button className="w-full gap-2"><Ticket className="w-4 h-4" /> Abrir Chamado</Button>
        </Card>
      </div>
    </motion.div>
  );
};

const ArtigoModal = ({ artigo, onClose }: { artigo?: Artigo | null, onClose: () => void }) => {
  const { criarArtigo, editarArtigo } = useKB();
  const { showToast } = useAppContext();
  const [titulo, setTitulo] = useState(artigo?.titulo || '');
  const [categoria, setCategoria] = useState(artigo?.categoria || '');
  const [conteudo, setConteudo] = useState(artigo?.conteudo || '');
  const [tags, setTags] = useState<string[]>(artigo?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [publicado, setPublicado] = useState(artigo ? artigo.publicado : true);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent | React.FocusEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'blur') {
      e.preventDefault();
      const newTag = (tagInput || "").trim().toLowerCase();
      if (newTag && !tags.includes(newTag) && tags.length < 8) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const handleSave = async (isDraft: boolean) => {
    if (titulo.length < 5 || !categoria || conteudo.length < 50) {
      showToast('Preencha todos os campos obrigatórios corretamente.', 'error');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    
    const dados = { titulo, categoria, conteudo, tags, publicado: !isDraft };
    if (artigo) {
      editarArtigo(artigo.id, dados);
      showToast('Artigo atualizado com sucesso!', 'success');
    } else {
      criarArtigo(dados);
      showToast('Artigo criado com sucesso!', 'success');
    }
    onClose();
  };

  const insertFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('kb-content') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    setConteudo(before + prefix + selected + suffix + after);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-text-primary">{artigo ? 'Editar Artigo' : 'Novo Artigo'}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Título *</label>
              <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Como configurar a VPN" className="text-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Categoria *</label>
              <Select value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Rede">Rede</option>
                <option value="Segurança">Segurança</option>
                <option value="Acesso">Acesso</option>
                <option value="Outros">Outros</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Tags (máx 8)</label>
            <div className="flex flex-wrap gap-2 p-2 min-h-[42px] bg-black/20 border border-border-subtle rounded-lg focus-within:border-accent-primary focus-within:ring-1 focus-within:ring-accent-primary transition-all">
              {tags.map(tag => (
                <Badge key={tag} className="bg-accent-primary/20 text-accent-primary flex items-center gap-1 pr-1">
                  {tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setTags(tags.filter(t => t !== tag))} />
                </Badge>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                onBlur={handleAddTag}
                placeholder={tags.length < 8 ? "Adicionar tag..." : ""}
                disabled={tags.length >= 8}
                className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary min-w-[120px]"
              />
            </div>
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-text-secondary">Conteúdo *</label>
              <div className="flex items-center gap-2">
                <div className="flex bg-black/20 rounded-lg p-1">
                  <button onClick={() => insertFormat('**', '**')} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/10 rounded" title="Negrito"><b>N</b></button>
                  <button onClick={() => insertFormat('*', '*')} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/10 rounded italic" title="Itálico">I</button>
                  <button onClick={() => insertFormat('`', '`')} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/10 rounded font-mono" title="Código">{'</>'}</button>
                  <div className="w-px h-6 bg-border-subtle mx-1 self-center" />
                  <button onClick={() => insertFormat('\n## ')} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/10 rounded font-bold" title="Título 2">H2</button>
                  <button onClick={() => insertFormat('\n- ')} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/10 rounded" title="Lista"><List className="w-4 h-4" /></button>
                  <button onClick={() => insertFormat('\n- [ ] ')} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/10 rounded" title="Checkbox"><CheckCircle className="w-4 h-4" /></button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPreview(!preview)} className="gap-2">
                  <BookOpen className="w-4 h-4" /> {preview ? 'Editar' : 'Preview'}
                </Button>
              </div>
            </div>
            
            {preview ? (
              <div className="flex-1 min-h-[300px] p-4 bg-black/20 border border-border-subtle rounded-lg overflow-y-auto">
                <MarkdownRenderer content={conteudo || '*Nenhum conteúdo*'} />
              </div>
            ) : (
              <textarea
                id="kb-content"
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                placeholder="Escreva o conteúdo do artigo. Use ## para títulos, **texto** para negrito, - para listas..."
                className="flex-1 min-h-[300px] w-full bg-black/20 border border-border-subtle rounded-lg p-4 text-text-primary font-mono text-sm focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary resize-y"
              />
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border-subtle bg-bg-surface/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">Status:</span>
            <button 
              onClick={() => setPublicado(!publicado)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${publicado ? 'bg-accent-primary' : 'bg-border-subtle'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${publicado ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${publicado ? 'text-accent-primary' : 'text-text-muted'}`}>{publicado ? 'Publicado' : 'Rascunho'}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button variant="outline" onClick={() => handleSave(true)} disabled={loading} className="border-accent-primary/50 text-accent-primary hover:bg-accent-primary/10">Salvar Rascunho</Button>
            <Button onClick={() => handleSave(false)} disabled={loading}>{loading ? 'Salvando...' : 'Publicar Artigo'}</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const KnowledgeBaseView = () => {
  const { usuarioLogado } = useAuth();
  const { artigos, getArtigosFiltrados, registrarVisualizacao, deletarArtigo, deletarArtigos } = useKB();
  const { pedirConfirmacao } = useAppContext();
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [artigoLendo, setArtigoLendo] = useState<Artigo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [artigoEditando, setArtigoEditando] = useState<Artigo | null>(null);
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  const handleOpenArticle = (artigo: Artigo) => {
    registrarVisualizacao(artigo.id);
    setArtigoLendo(artigo);
  };

  useEffect(() => {
    const handleOpenArticleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Artigo>;
      if (customEvent.detail) {
        handleOpenArticle(customEvent.detail);
      }
    };
    const handleSetSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setBusca(customEvent.detail);
        setArtigoLendo(null); // Close article if open
      }
    };
    window.addEventListener('open-kb-article', handleOpenArticleEvent);
    window.addEventListener('set-kb-search', handleSetSearchEvent);
    return () => {
      window.removeEventListener('open-kb-article', handleOpenArticleEvent);
      window.removeEventListener('set-kb-search', handleSetSearchEvent);
    };
  }, []);

  const artigosFiltrados = getArtigosFiltrados(busca, categoriaAtiva);

  const categorias = [
    { id: 'Hardware', icon: Monitor, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { id: 'Software', icon: Cpu, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    { id: 'Rede', icon: Network, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    { id: 'Segurança', icon: Lock, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    { id: 'Acesso', icon: Smartphone, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    { id: 'Outros', icon: Settings, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  ];

  const handleDelete = (e: React.MouseEvent, artigo: Artigo) => {
    e.stopPropagation();
    pedirConfirmacao({
      titulo: 'Excluir Artigo',
      mensagem: `Tem certeza que deseja excluir o artigo "${artigo.titulo}"?`,
      mensagemExtra: 'Esta ação não pode ser desfeita.',
      textoBotao: 'Excluir Artigo',
      tipo: 'perigo',
      onConfirmar: () => deletarArtigo(artigo.id)
    });
  };

  if (artigoLendo) {
    return <ArtigoView artigo={artigoLendo} onBack={() => setArtigoLendo(null)} onEdit={() => { setArtigoEditando(artigoLendo); setModalOpen(true); }} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Hero Search */}
      <div className="text-center py-16 px-4 bg-bg-surface border border-border-subtle rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/10 to-transparent"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-text-primary mb-4">Base de Conhecimento</h2>
          <p className="text-lg text-text-secondary mb-8">Encontre respostas rápidas para os problemas mais comuns.</p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted" />
            <Input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Pesquisar artigos, guias, FAQs..."
              className="pl-14 py-6 text-lg rounded-2xl shadow-2xl bg-bg-primary/80 backdrop-blur-sm border-accent-primary/30 focus:border-accent-primary"
            />
          </div>
        </div>
        {usuarioLogado?.perfil === 'admin' && (
          <Button onClick={() => { setArtigoEditando(null); setModalOpen(true); }} className="absolute top-6 right-6 gap-2 shadow-lg">
            <PlusCircle className="w-4 h-4" /> Novo Artigo
          </Button>
        )}
      </div>

      {!busca && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.map(cat => {
            const count = artigos.filter(a => a.categoria === cat.id && (a.publicado || usuarioLogado?.perfil === 'admin')).length;
            const isSelected = categoriaAtiva === cat.id;
            return (
              <div 
                key={cat.id} 
                className={`bg-bg-surface border rounded-xl overflow-hidden backdrop-blur-md p-4 cursor-pointer transition-all hover:-translate-y-1 ${isSelected ? 'border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary' : 'border-border-subtle hover:border-border-subtle'}`}
                onClick={() => setCategoriaAtiva(isSelected ? 'todas' : cat.id)}
              >
                <div className={`w-10 h-10 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center mb-3`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-text-primary">{cat.id}</h3>
                <p className="text-xs text-text-muted mt-1">{count} artigos</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-text-primary">
              {busca ? `Resultados para "${busca}"` : categoriaAtiva !== 'todas' ? `Artigos em ${categoriaAtiva}` : 'Artigos Recentes'}
            </h3>
            {usuarioLogado?.perfil === 'admin' && (
              <button 
                onClick={() => {
                  setIsManageMode(!isManageMode);
                  setSelectedArticles([]);
                }}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${isManageMode ? 'bg-accent-primary text-white' : 'bg-white/5 text-text-muted hover:text-text-primary'}`}
              >
                {isManageMode ? 'Sair do Modo Gerenciamento' : 'Gerenciar Artigos'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isManageMode && selectedArticles.length > 0 && (
              <button 
                onClick={() => {
                  pedirConfirmacao({
                    titulo: 'Excluir Artigos Selecionados',
                    mensagem: `Tem certeza que deseja excluir os ${selectedArticles.length} artigos selecionados?`,
                    mensagemExtra: 'Esta ação não pode ser desfeita.',
                    textoBotao: 'Excluir Artigos',
                    tipo: 'perigo',
                    onConfirmar: () => {
                      deletarArtigos(selectedArticles);
                      setSelectedArticles([]);
                      setIsManageMode(false);
                    }
                  });
                }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-danger/10 text-danger text-xs font-bold hover:bg-danger/20 transition-colors border border-danger/20"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir Selecionados ({selectedArticles.length})
              </button>
            )}
            <span className="text-sm text-text-muted">{artigosFiltrados.length} encontrados</span>
          </div>
        </div>

        {artigosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-bg-surface/50 rounded-xl border border-border-subtle border-dashed">
            <Search className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Nenhum artigo encontrado</h3>
            <p className="text-text-secondary mb-6">Tente usar termos diferentes ou limpar os filtros.</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => { setBusca(''); setCategoriaAtiva('todas'); }}>Limpar Filtros</Button>
              {usuarioLogado?.perfil === 'admin' && (
                <Button onClick={() => { setArtigoEditando(null); setModalOpen(true); }} className="gap-2"><PlusCircle className="w-4 h-4" /> Criar Artigo</Button>
              )}
            </div>
          </div>
        ) : (
          <div className={busca ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
            {artigosFiltrados.map(artigo => {
              const catInfo = categorias.find(c => c.id === artigo.categoria) || categorias[5];
              const isSelected = selectedArticles.includes(artigo.id);
              
              return (
                <div 
                  key={artigo.id} 
                  className={`bg-bg-surface border rounded-xl overflow-hidden backdrop-blur-md p-6 cursor-pointer transition-all group relative ${isManageMode ? (isSelected ? 'border-accent-primary ring-1 ring-accent-primary' : 'border-border-subtle opacity-80') : 'border-border-subtle hover:border-accent-primary/40'}`} 
                  onClick={() => {
                    if (isManageMode) {
                      if (isSelected) setSelectedArticles(selectedArticles.filter(id => id !== artigo.id));
                      else setSelectedArticles([...selectedArticles, artigo.id]);
                    } else {
                      handleOpenArticle(artigo);
                    }
                  }}
                >
                  {isManageMode && (
                    <div className="absolute top-4 right-4 z-20">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-accent-primary border-accent-primary' : 'bg-white/5 border-border-subtle'}`}>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  )}
                  {!artigo.publicado && (
                    <div className="absolute top-0 right-0 bg-warning text-warning-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg">RASCUNHO</div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${catInfo.bg} ${catInfo.color} border-none`}>{artigo.categoria}</Badge>
                    {usuarioLogado?.perfil === 'admin' && !isManageMode && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setArtigoEditando(artigo); setModalOpen(true); }} className="p-1.5 text-text-muted hover:text-accent-primary hover:bg-white/10 rounded-md transition-colors"><SettingsIcon className="w-4 h-4" /></button>
                        <button onClick={(e) => handleDelete(e, artigo)} className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">{artigo.titulo}</h4>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                    {artigo.conteudo.replace(/[#*_`]/g, '').substring(0, 150)}...
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-muted pt-4 border-t border-border-subtle">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {artigo.visualizacoes}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {artigo.util}</span>
                    <span>Por {artigo.autor}</span>
                    <span>{new Date(artigo.atualizadoEm).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && <ArtigoModal artigo={artigoEditando} onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

// --- AUTH CONTEXT ---
const USUARIOS_INICIAIS: Usuario[] = [
  {
    id: "u001",
    nome: "Gabriel Juarez",
    email: "gabriel.juarez@montebravo.com.br",
    senha: "admin123",
    perfil: "admin",
    departamento: "TI",
    avatar: "GJ",
    ativo: true,
    criadoEm: new Date("2024-01-15").toISOString(),
  },
  {
    id: "u002",
    nome: "Ana Lima",
    email: "ana.lima@montebravo.com.br",
    senha: "user123",
    perfil: "usuario",
    departamento: "Financeiro",
    avatar: "AL",
    ativo: true,
    criadoEm: new Date("2024-02-10").toISOString(),
  },
  {
    id: "u003",
    nome: "João Silva",
    email: "joao.silva@montebravo.com.br",
    senha: "user123",
    perfil: "usuario",
    departamento: "Comercial",
    avatar: "JS",
    ativo: true,
    criadoEm: new Date("2024-03-05").toISOString(),
  },
];

interface LogExclusao {
  id: number;
  tipo: 'chamado' | 'artigo' | 'usuario';
  itemId: string;
  nome: string;
  excluidoPor: string;
  timestamp: string;
}

interface AuthContextType {
  usuarios: Usuario[];
  usuarioLogado: Usuario | null;
  fazerLogin: (
    email: string,
    senha: string,
  ) => { success: boolean; error?: string };
  fazerLogout: () => void;
  criarUsuario: (
    dados: Omit<Usuario, "id" | "criadoEm" | "avatar" | "ativo">,
  ) => void;
  editarUsuario: (id: string, dados: Partial<Usuario>) => void;
  alterarStatusUsuario: (id: string, ativo: boolean) => void;
  redefinirSenha: (id: string, novaSenha: string) => void;
  excluirUsuario: (id: string) => boolean;
  logExclusoes: LogExclusao[];
  registrarExclusao: (tipo: 'chamado' | 'artigo' | 'usuario', id: string, nome: string) => void;
  limparLog: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem("mb_usuarios");
    return saved ? JSON.parse(saved) : USUARIOS_INICIAIS;
  });

  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);

  const [logExclusoes, setLogExclusoes] = useState<LogExclusao[]>(() => {
    const saved = localStorage.getItem('mb_log');
    return saved ? JSON.parse(saved) : [];
  });

  const { showToast, criarNotificacao } = useAppContext();

  const registrarExclusao = (tipo: 'chamado' | 'artigo' | 'usuario', id: string, nome: string) => {
    const entrada: LogExclusao = {
      id: Date.now(),
      tipo,
      itemId: id,
      nome,
      excluidoPor: usuarioLogado?.nome || 'Sistema',
      timestamp: new Date().toISOString()
    };
    setLogExclusoes(prev => {
      const novo = [entrada, ...prev].slice(0, 100);
      localStorage.setItem('mb_log', JSON.stringify(novo));
      return novo;
    });
  };

  const limparLog = () => {
    setLogExclusoes([]);
    localStorage.removeItem('mb_log');
  };

  const excluirUsuario = (id: string) => {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return false;

    if (id === usuarioLogado?.id) {
      showToast('Você não pode excluir sua própria conta', 'error');
      return false;
    }

    if (usuario.perfil === 'admin') {
      const admins = usuarios.filter(u => u.perfil === 'admin' && u.ativo && u.id !== id);
      if (admins.length === 0) {
        showToast('Não é possível excluir o único administrador', 'error');
        return false;
      }
    }

    setUsuarios(prev => {
      const novo = prev.filter(u => u.id !== id);
      localStorage.setItem('mb_usuarios', JSON.stringify(novo));
      return novo;
    });

    const sessao = localStorage.getItem('mb_sessao');
    if (sessao) {
      try {
        const s = JSON.parse(sessao);
        if (s.id === id) fazerLogout();
      } catch(e) {}
    }

    registrarExclusao('usuario', id, usuario.nome);
    showToast(`Usuário ${usuario.nome} excluído permanentemente`, 'success');

    return true;
  };

  useEffect(() => {
    localStorage.setItem("mb_usuarios", JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    const sessao = localStorage.getItem("mb_sessao");
    if (sessao) {
      const u = JSON.parse(sessao);
      const ainda_existe = usuarios.find((x) => x.id === u.id && x.ativo);
      if (ainda_existe) setUsuarioLogado(ainda_existe);
    }
  }, [usuarios]);

  const fazerLogin = (email: string, senha: string) => {
    const usuario = usuarios.find(
      (u) => u.email === email && u.senha === senha,
    );

    if (!usuario) {
      return { success: false, error: "E-mail ou senha inválidos" };
    }

    if (!usuario.ativo) {
      return {
        success: false,
        error:
          "Sua conta está desativada. Entre em contato com o administrador.",
      };
    }

    setUsuarioLogado(usuario);
    localStorage.setItem("mb_sessao", JSON.stringify(usuario));
    return { success: true };
  };

  const fazerLogout = () => {
    setUsuarioLogado(null);
    localStorage.removeItem("mb_sessao");
  };

  const criarUsuario = (
    dados: Omit<Usuario, "id" | "criadoEm" | "avatar" | "ativo">,
  ) => {
    const id = "u" + Date.now();
    const avatar = dados.nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    const novoUsuario: Usuario = {
      ...dados,
      id,
      avatar,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };
    setUsuarios((prev) => [...prev, novoUsuario]);

    criarNotificacao({
      tipo: 'usuario_criado',
      titulo: 'Novo usuário cadastrado',
      mensagem: `${novoUsuario.nome} (${novoUsuario.perfil}) foi adicionado ao sistema`,
      linkTipo: 'usuario',
      linkId: novoUsuario.id,
      destinatarios: ['admin']
    });
  };

  const editarUsuario = (id: string, dados: Partial<Usuario>) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...dados } : u)),
    );
  };

  const alterarStatusUsuario = (id: string, ativo: boolean) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ativo } : u)));
    if (!ativo && usuarioLogado?.id === id) {
      fazerLogout();
    }
  };

  const redefinirSenha = (id: string, novaSenha: string) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, senha: novaSenha } : u)),
    );
  };

  return (
    <AuthContext.Provider
      value={{
        usuarios,
        usuarioLogado,
        fazerLogin,
        fazerLogout,
        criarUsuario,
        editarUsuario,
        alterarStatusUsuario,
        redefinirSenha,
        excluirUsuario,
        logExclusoes,
        registrarExclusao,
        limparLog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// --- CONTEXT ---
interface TicketContextType {
  tickets: TicketData[];
  filtros: {
    status: string;
    prioridade: string;
    categoria: string;
    busca: string;
  };
  setFiltros: React.Dispatch<
    React.SetStateAction<{
      status: string;
      prioridade: string;
      categoria: string;
      busca: string;
    }>
  >;
  ticketAtivo: TicketData | null;
  setTicketAtivo: React.Dispatch<React.SetStateAction<TicketData | null>>;
  criarChamado: (dados: Partial<TicketData>) => TicketData;
  atualizarStatus: (id: string, novoStatus: Status) => void;
  atualizarPrioridade: (id: string, novaPrioridade: Priority) => void;
  atribuirResponsavel: (id: string, responsavel: string) => void;
  adicionarComentario: (id: string, texto: string, isInterno: boolean) => void;
  adicionarAtividade: (id: string, text: string, type?: string) => void;
  deletarChamado: (id: string) => void;
  deletarChamados: (ids: string[]) => void;
  atividades: Record<string, any[]>;
}

const TicketContext = React.createContext<TicketContextType | undefined>(
  undefined,
);

export const useTickets = () => {
  const context = React.useContext(TicketContext);
  if (!context)
    throw new Error("useTickets must be used within a TicketProvider");
  return context;
};

export const TicketProvider = ({ children }: { children: React.ReactNode }) => {
  const [tickets, setTickets] = useState<TicketData[]>(() => {
    const saved = localStorage.getItem("mb_tickets");
    const initialTickets = saved ? JSON.parse(saved) : MOCK_TICKETS;
    
    // Fix existing corrupted localStorage data by assigning new IDs to duplicates
    const seenIds = new Set();
    let maxId = initialTickets.reduce((max: number, t: TicketData) => {
      const num = parseInt(t.id.replace('TKT-', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);

    const deduplicatedTickets = initialTickets.map((ticket: TicketData) => {
      if (seenIds.has(ticket.id)) {
        maxId++;
        const newId = `TKT-${String(maxId).padStart(4, "0")}`;
        seenIds.add(newId);
        return { ...ticket, id: newId };
      }
      seenIds.add(ticket.id);
      return ticket;
    });
    
    return deduplicatedTickets;
  });
  const [filtros, setFiltros] = useState({
    status: "todos",
    prioridade: "todas",
    categoria: "todas",
    busca: "",
  });
  const [ticketAtivo, setTicketAtivo] = useState<TicketData | null>(null);
  const [atividades, setAtividades] = useState<Record<string, any[]>>({});
  const { usuarioLogado, registrarExclusao } = useAuth();
  const { showToast, criarNotificacao } = useAppContext();

  useEffect(() => {
    localStorage.setItem("mb_tickets", JSON.stringify(tickets));
  }, [tickets]);

  const adicionarAtividade = (
    id: string,
    text: string,
    type: string = "system",
  ) => {
    setAtividades((prev) => ({
      ...prev,
      [id]: [
        {
          id: Date.now(),
          type,
          text,
          time: "Agora mesmo",
          autor: usuarioLogado?.nome || "Sistema",
          autorAvatar: usuarioLogado?.avatar || "SYS",
        },
        ...(prev[id] || []),
      ],
    }));
  };

  const criarChamado = (dados: Partial<TicketData>) => {
    const maxId = tickets.reduce((max, t) => {
      const num = parseInt(t.id.replace('TKT-', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const newId = `TKT-${String(maxId + 1).padStart(4, "0")}`;
    const newTicket: TicketData = {
      id: newId,
      title: dados.title || "Novo Chamado",
      requester: usuarioLogado?.nome || "Usuário",
      solicitanteId: usuarioLogado?.id,
      email: usuarioLogado?.email,
      priority: dados.priority || "Médio",
      status: "Aberto",
      category: dados.category || "Outros",
      assignee: "Não atribuído",
      created: "Agora mesmo",
      sla: "24h restantes",
      description: dados.description || "",
      attachments: dados.attachments || [],
    };
    setTickets([newTicket, ...tickets]);

    adicionarAtividade(newId, `${newTicket.requester} criou o chamado`);

    criarNotificacao({
      tipo: 'chamado_criado',
      titulo: 'Novo chamado aberto',
      mensagem: `${newTicket.id} — "${newTicket.title}" por ${usuarioLogado?.nome}`,
      linkTipo: 'chamado',
      linkId: newTicket.id,
      destinatarios: ['admin']
    });

    return newTicket;
  };

  const atualizarStatus = (id: string, novoStatus: Status) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    const statusAnterior = ticket.status;

    setTickets(prevTickets =>
      prevTickets.map((t) => (t.id === id ? { ...t, status: novoStatus } : t))
    );
    adicionarAtividade(id, `Status alterado para ${novoStatus}`);

    criarNotificacao({
      tipo: 'status_alterado',
      titulo: 'Status atualizado',
      mensagem: `${id} mudou de "${statusAnterior}" para "${novoStatus}"`,
      linkTipo: 'chamado',
      linkId: id,
      destinatarios: ['admin']
    });

    if (ticket.solicitanteId && ticket.solicitanteId !== usuarioLogado?.id) {
      criarNotificacao({
        tipo: 'status_alterado',
        titulo: `Seu chamado foi atualizado`,
        mensagem: `${id} — "${ticket.title}": status alterado para "${novoStatus}"`,
        linkTipo: 'chamado',
        linkId: id,
        destinatarios: [ticket.solicitanteId]
      });
    }

    if (novoStatus === 'Resolvido') {
      criarNotificacao({
        tipo: 'chamado_resolvido',
        titulo: 'Chamado resolvido',
        mensagem: `${id} — "${ticket.title}" foi resolvido`,
        linkTipo: 'chamado',
        linkId: id,
        destinatarios: ['admin', ticket.solicitanteId || '']
      });
    }
  };

  const atualizarPrioridade = (id: string, novaPrioridade: Priority) => {
    setTickets(prevTickets =>
      prevTickets.map((t) =>
        t.id === id ? { ...t, priority: novaPrioridade } : t,
      )
    );
    adicionarAtividade(id, `Prioridade alterada para ${novaPrioridade}`);
  };

  const atribuirResponsavel = (id: string, responsavel: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    setTickets(prevTickets =>
      prevTickets.map((t) => (t.id === id ? { ...t, assignee: responsavel } : t))
    );
    adicionarAtividade(id, `Atribuído a ${responsavel}`);

    if (ticket.solicitanteId) {
      criarNotificacao({
        tipo: 'chamado_atualizado',
        titulo: 'Responsável atribuído ao seu chamado',
        mensagem: `${id} foi atribuído para ${responsavel}`,
        linkTipo: 'chamado',
        linkId: id,
        destinatarios: [ticket.solicitanteId]
      });
    }
  };

  const adicionarComentario = (
    id: string,
    texto: string,
    isInterno: boolean,
  ) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    let statusMudouParaContestado = false;

    if (ticket.status === 'Resolvido' && usuarioLogado?.perfil === 'usuario') {
      atualizarStatus(id, 'Contestado');
      statusMudouParaContestado = true;
      adicionarAtividade(id, "Chamado contestado pelo usuário", "status_change");
    }

    adicionarAtividade(id, texto, isInterno ? "internal_comment" : "comment");

    if (!isInterno) {
      if (ticket.solicitanteId && ticket.solicitanteId !== usuarioLogado?.id) {
        criarNotificacao({
          tipo: 'comentario_adicionado',
          titulo: 'Novo comentário no seu chamado',
          mensagem: `${usuarioLogado?.nome} comentou em ${id} — "${ticket.title}"`,
          linkTipo: 'chamado',
          linkId: id,
          destinatarios: [ticket.solicitanteId]
        });
      }

      if (usuarioLogado?.perfil !== 'admin') {
        criarNotificacao({
          tipo: statusMudouParaContestado ? 'chamado_contestado' : 'comentario_adicionado',
          titulo: statusMudouParaContestado ? 'Chamado Contestado' : 'Comentário em chamado',
          mensagem: statusMudouParaContestado 
            ? `${usuarioLogado?.nome} contestou a resolução do chamado ${id} — "${ticket.title}"`
            : `${usuarioLogado?.nome} comentou em ${id} — "${ticket.title}"`,
          linkTipo: 'chamado',
          linkId: id,
          destinatarios: ['admin']
        });
      }
    }
  };

  const deletarChamado = (id: string) => {
    setTickets(prev => {
      const novo = prev.filter(t => t.id !== id);
      localStorage.setItem('mb_tickets', JSON.stringify(novo));
      return novo;
    });
    registrarExclusao('chamado', id, tickets.find(t => t.id === id)?.title || id);
    showToast(`Chamado excluído com sucesso`, 'success');
  };

  const deletarChamados = (ids: string[]) => {
    setTickets(prev => {
      const novo = prev.filter(t => !ids.includes(t.id));
      localStorage.setItem('mb_tickets', JSON.stringify(novo));
      return novo;
    });
    const ticketsToDelete = tickets.filter(t => ids.includes(t.id));
    ticketsToDelete.forEach(t => registrarExclusao('chamado', t.id, t.title));
    showToast(`${ids.length} chamados excluídos`, 'success');
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        filtros,
        setFiltros,
        ticketAtivo,
        setTicketAtivo,
        criarChamado,
        atualizarStatus,
        atualizarPrioridade,
        atribuirResponsavel,
        adicionarComentario,
        adicionarAtividade,
        deletarChamado,
        deletarChamados,
        atividades,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export interface Artigo {
  id: string;
  titulo: string;
  categoria: string;
  conteudo: string;
  tags: string[];
  autor: string;
  autorId: string;
  visualizacoes: number;
  util: number;
  naoUtil: number;
  publicado: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const ARTIGOS_INICIAIS: Artigo[] = [
  {
    id: 'kb001',
    titulo: 'Como redefinir sua senha corporativa',
    categoria: 'Acesso',
    conteudo: `## Visão Geral\nEste artigo explica como redefinir sua senha corporativa de forma segura.\n\n## Passo a Passo\n\n**1. Acesse o portal de redefinição**\nAbra o navegador e acesse: https://passwordreset.microsoftonline.com\n\n**2. Informe seu e-mail corporativo**\nDigite seu e-mail no formato nome@montebravo.com.br e clique em "Próximo".\n\n**3. Escolha o método de verificação**\nSelecione entre: aplicativo Microsoft Authenticator, SMS ou e-mail alternativo.\n\n**4. Crie a nova senha**\nA senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.\n\n**5. Confirme e aguarde**\nApós a confirmação, aguarde 2 minutos para a sincronização em todos os sistemas.\n\n## Observações\n- Após 3 tentativas incorretas a conta será bloqueada\n- Em caso de bloqueio, abra um chamado para o TI\n- A senha expira a cada 90 dias`,
    tags: ['senha', 'acesso', 'microsoft', 'login'],
    autor: 'Gabriel Juarez',
    autorId: 'u001',
    visualizacoes: 142,
    util: 38,
    naoUtil: 3,
    publicado: true,
    criadoEm: new Date('2024-01-20'),
    atualizadoEm: new Date('2024-03-15')
  },
  {
    id: 'kb002',
    titulo: 'Guia de configuração da VPN — Windows e Mac',
    categoria: 'Rede',
    conteudo: `## O que é a VPN corporativa?\nA VPN (Virtual Private Network) permite que você acesse a rede interna da Monte Bravo de forma segura fora do escritório.\n\n## Instalação no Windows\n\n**1. Baixe o cliente VPN**\nAcesse \\\\servidor-ti\\software\\vpn e copie o instalador para seu computador.\n\n**2. Execute a instalação**\nClique duas vezes no instalador e siga as instruções. Aceite os termos e clique em "Instalar".\n\n**3. Configure o servidor**\n- Abra o cliente VPN após instalação\n- Clique em "Nova Conexão"\n- Servidor: vpn.montebravo.com.br\n- Protocolo: IKEv2\n\n**4. Conecte com suas credenciais**\nUse seu e-mail e senha corporativos.\n\n## Instalação no Mac\n\n**1. Acesse Preferências do Sistema → Rede**\n**2. Clique no "+" para adicionar nova conexão**\n**3. Interface: VPN | Tipo: IKEv2**\n**4. Servidor: vpn.montebravo.com.br**\n**5. Autenticação: usuário e senha corporativos**\n\n## Problemas comuns\n- **Erro de autenticação**: verifique se sua senha não expirou\n- **Conexão lenta**: tente o servidor alternativo vpn2.montebravo.com.br\n- **Não conecta no 4G**: desative o firewall temporariamente para teste`,
    tags: ['vpn', 'rede', 'acesso remoto', 'windows', 'mac'],
    autor: 'Gabriel Juarez',
    autorId: 'u001',
    visualizacoes: 89,
    util: 27,
    naoUtil: 1,
    publicado: true,
    criadoEm: new Date('2024-02-01'),
    atualizadoEm: new Date('2024-02-01')
  },
  {
    id: 'kb003',
    titulo: 'Configurando o Microsoft Authenticator (MFA)',
    categoria: 'Segurança',
    conteudo: `## Por que usar MFA?\nA autenticação multifator adiciona uma camada extra de segurança à sua conta, protegendo contra acessos não autorizados mesmo que sua senha seja comprometida.\n\n## Instalação do aplicativo\n\n**Android:** Acesse a Play Store, busque "Microsoft Authenticator" e instale.\n**iPhone:** Acesse a App Store, busque "Microsoft Authenticator" e instale.\n\n## Configuração inicial\n\n**1. Acesse o portal de segurança**\nNo computador, acesse: https://aka.ms/mfasetup\n\n**2. Adicione o método de autenticação**\nClique em "Adicionar método" → selecione "Aplicativo autenticador"\n\n**3. Escaneie o QR Code**\nAbra o Microsoft Authenticator no celular → toque em "+" → "Conta corporativa ou de estudante" → "Escanear QR Code"\n\n**4. Confirme a configuração**\nO portal exibirá um número de 2 dígitos. Selecione este número no aplicativo para confirmar.\n\n## Uso diário\nAo fazer login, após inserir senha, o aplicativo enviará uma notificação. Abra e aprove. Se não aparecer notificação, abra o app e use o código de 6 dígitos mostrado na tela.\n\n## Perdi o celular — o que fazer?\nAbra um chamado urgente para o TI imediatamente. Não compartilhe seus códigos com ninguém.`,
    tags: ['mfa', 'autenticador', 'segurança', '2fa', 'microsoft'],
    autor: 'Gabriel Juarez',
    autorId: 'u001',
    visualizacoes: 203,
    util: 61,
    naoUtil: 2,
    publicado: true,
    criadoEm: new Date('2024-01-25'),
    atualizadoEm: new Date('2024-04-01')
  },
  {
    id: 'kb004',
    titulo: 'Checklist de configuração inicial do MacBook',
    categoria: 'Hardware',
    conteudo: `## Primeiros passos ao receber seu MacBook\n\nEste checklist garante que seu MacBook esteja configurado corretamente com todas as ferramentas necessárias.\n\n## ✅ Checklist Completo\n\n**Configurações básicas do sistema:**\n- [ ] Ligar e seguir o assistente de configuração inicial\n- [ ] Conectar ao Wi-Fi corporativo (rede: MonteBravo-Corp, solicitar senha ao TI)\n- [ ] Fazer login com Apple ID corporativo (solicitar ao TI)\n- [ ] Ativar FileVault (criptografia do disco)\n- [ ] Configurar senha de tela de bloqueio\n\n**Instalar aplicativos obrigatórios:**\n- [ ] Company Portal (instalar via link enviado pelo TI)\n- [ ] Microsoft Office 365 (via Company Portal)\n- [ ] Microsoft Teams\n- [ ] Cisco AnyConnect (VPN)\n- [ ] Qualys Cloud Agent (segurança — instalado automaticamente pelo TI)\n\n**Configurar contas:**\n- [ ] Outlook: adicionar conta corporativa\n- [ ] Teams: fazer login\n- [ ] Configurar MFA (ver artigo específico)\n\n**Antes de usar em produção:**\n- [ ] Confirmar com TI que o dispositivo aparece no Intune\n- [ ] Testar VPN\n- [ ] Testar acesso aos sistemas internos\n\n## Dúvidas?\nAbra um chamado em Categoria: Hardware | Prioridade: Médio`,
    tags: ['macbook', 'configuração', 'intune', 'setup', 'onboarding'],
    autor: 'Gabriel Juarez',
    autorId: 'u001',
    visualizacoes: 56,
    util: 19,
    naoUtil: 0,
    publicado: true,
    criadoEm: new Date('2024-03-10'),
    atualizadoEm: new Date('2024-03-10')
  },
  {
    id: 'kb005',
    titulo: 'Política de instalação de softwares',
    categoria: 'Software',
    conteudo: `## Regra geral\nA instalação de softwares em equipamentos da Monte Bravo deve ser aprovada e realizada pela equipe de TI. Softwares não autorizados podem representar riscos de segurança e violar políticas da empresa.\n\n## O que pode ser instalado sem aprovação\n- Softwares já presentes no catálogo do Company Portal\n- Extensões de navegador de produtividade (aprovadas pelo TI)\n\n## Como solicitar um novo software\n\n**1. Abra um chamado**\nCategoria: Software | Título: "Solicitação de instalação: [nome do software]"\n\n**2. Inclua na descrição:**\n- Nome e versão do software\n- Finalidade e justificativa de uso\n- Link para download oficial\n- Quantos usuários precisarão usar\n\n**3. Aguarde aprovação**\nO TI avaliará compatibilidade, licenciamento e segurança. Prazo: até 3 dias úteis.\n\n**4. Instalação**\nApós aprovação, o TI realizará a instalação remotamente ou via Company Portal.\n\n## Softwares bloqueados\nSão bloqueados por política: torrents, softwares de acesso remoto não aprovados, clientes VPN alternativos, e qualquer software com licença crackeada.\n\n## Consequências\nInstalação não autorizada pode resultar em advertência e remoção imediata do equipamento para análise.`,
    tags: ['software', 'política', 'instalação', 'segurança', 'TI'],
    autor: 'Gabriel Juarez',
    autorId: 'u001',
    visualizacoes: 78,
    util: 22,
    naoUtil: 4,
    publicado: true,
    criadoEm: new Date('2024-02-15'),
    atualizadoEm: new Date('2024-02-15')
  }
];

interface KBContextType {
  artigos: Artigo[];
  criarArtigo: (dados: Partial<Artigo>) => Artigo;
  editarArtigo: (id: string, dados: Partial<Artigo>) => void;
  deletarArtigo: (id: string) => void;
  deletarArtigos: (ids: string[]) => void;
  registrarVisualizacao: (id: string) => void;
  votarArtigo: (id: string, util: boolean) => void;
  getArtigosFiltrados: (busca: string, categoria: string) => Artigo[];
}

const KBContext = React.createContext<KBContextType | undefined>(undefined);

export const useKB = () => {
  const context = React.useContext(KBContext);
  if (!context) throw new Error("useKB must be used within a KBProvider");
  return context;
};

export const KBProvider = ({ children }: { children: React.ReactNode }) => {
  const { usuarioLogado, registrarExclusao } = useAuth();
  const [artigos, setArtigos] = useState<Artigo[]>(() => {
    const saved = localStorage.getItem('mb_artigos');
    return saved ? JSON.parse(saved, (key, val) => 
      ['criadoEm','atualizadoEm'].includes(key) ? new Date(val) : val
    ) : ARTIGOS_INICIAIS;
  });

  useEffect(() => {
    localStorage.setItem('mb_artigos', JSON.stringify(artigos));
  }, [artigos]);

  const { showToast, criarNotificacao } = useAppContext();

  const deletarArtigo = (id: string) => {
    const artigo = artigos.find(a => a.id === id);
    setArtigos(prev => {
      const novo = prev.filter(a => a.id !== id);
      localStorage.setItem('mb_artigos', JSON.stringify(novo));
      return novo;
    });
    registrarExclusao('artigo', id, artigo?.titulo || id);
    showToast(`Artigo excluído com sucesso`, 'success');
  };

  const deletarArtigos = (ids: string[]) => {
    setArtigos(prev => {
      const novo = prev.filter(a => !ids.includes(a.id));
      localStorage.setItem('mb_artigos', JSON.stringify(novo));
      return novo;
    });
    const articlesToDelete = artigos.filter(a => ids.includes(a.id));
    articlesToDelete.forEach(a => registrarExclusao('artigo', a.id, a.titulo));
    showToast(`${ids.length} artigos excluídos`, 'success');
  };

  const criarArtigo = (dados: Partial<Artigo>) => {
    const novo: Artigo = {
      id: 'kb' + Date.now(),
      ...dados,
      autor: usuarioLogado?.nome || 'Usuário',
      autorId: usuarioLogado?.id || 'u000',
      visualizacoes: 0,
      util: 0,
      naoUtil: 0,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    } as Artigo;
    setArtigos(prev => [novo, ...prev]);

    criarNotificacao({
      tipo: 'kb_criado',
      titulo: 'Novo artigo na Base de Conhecimento',
      mensagem: `"${novo.titulo}" foi publicado por ${usuarioLogado?.nome}`,
      linkTipo: 'artigo',
      linkId: novo.id,
      destinatarios: ['todos']
    });

    return novo;
  };

  const editarArtigo = (id: string, dados: Partial<Artigo>) => {
    const artigo = artigos.find(a => a.id === id);
    if (!artigo) return;

    setArtigos(prev => prev.map(a => 
      a.id === id ? { ...a, ...dados, atualizadoEm: new Date() } : a
    ));

    criarNotificacao({
      tipo: 'kb_editado',
      titulo: 'Artigo atualizado',
      mensagem: `"${dados.titulo || artigo.titulo}" foi atualizado por ${usuarioLogado?.nome}`,
      linkTipo: 'artigo',
      linkId: id,
      destinatarios: ['admin']
    });
  };

  const registrarVisualizacao = (id: string) => {
    setArtigos(prev => prev.map(a =>
      a.id === id ? { ...a, visualizacoes: a.visualizacoes + 1 } : a
    ));
  };

  const votarArtigo = (id: string, util: boolean) => {
    setArtigos(prev => prev.map(a =>
      a.id === id
        ? { ...a, util: util ? a.util + 1 : a.util, naoUtil: !util ? a.naoUtil + 1 : a.naoUtil }
        : a
    ));
  };

  const getArtigosFiltrados = (busca: string, categoria: string) => {
    return artigos.filter(a => {
      const matchBusca = !busca || 
        (a.titulo || "").toLowerCase().includes((busca || "").toLowerCase()) ||
        a.tags.some(t => (t || "").toLowerCase().includes((busca || "").toLowerCase())) ||
        (a.conteudo || "").toLowerCase().includes((busca || "").toLowerCase());
      const matchCategoria = !categoria || categoria === 'todas' || a.categoria === categoria;
      return matchBusca && matchCategoria && (a.publicado || usuarioLogado?.perfil === 'admin');
    });
  };

  return (
    <KBContext.Provider value={{ artigos, criarArtigo, editarArtigo, deletarArtigo, deletarArtigos, registrarVisualizacao, votarArtigo, getArtigosFiltrados }}>
      {children}
    </KBContext.Provider>
  );
};

function formatarTempoRelativo(data: Date | string) {
  const agora = new Date();
  const diff = agora.getTime() - new Date(data).getTime();
  const seg = Math.floor(diff / 1000);
  const min = Math.floor(seg / 60);
  const hrs = Math.floor(min / 60);
  const dias = Math.floor(hrs / 24);

  if (seg < 60) return 'agora mesmo';
  if (min < 60) return `há ${min} minuto${min > 1 ? 's' : ''}`;
  if (hrs < 24) return `há ${hrs} hora${hrs > 1 ? 's' : ''}`;
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  return new Date(data).toLocaleDateString('pt-BR');
}

const ItemNotificacao: React.FC<{ notif: Notificacao, onLer: () => void, onDeletar: () => void }> = ({ notif, onLer, onDeletar }) => {
  const icones: Record<string, string> = {
    chamado_criado: '🎫',
    chamado_atualizado: '🔄',
    chamado_resolvido: '✅',
    comentario_adicionado: '💬',
    status_alterado: '🔄',
    prioridade_alterada: '⚡',
    kb_criado: '📚',
    kb_editado: '✏️',
    usuario_criado: '👤'
  };

  return (
    <div
      onClick={onLer}
      className={`p-3 border-b border-border-subtle cursor-pointer flex gap-3 items-start transition-colors group ${notif.lida ? 'bg-transparent hover:bg-white/5' : 'bg-accent-primary/10 hover:bg-accent-primary/20'}`}
    >
      <div className="w-9 h-9 rounded-full bg-bg-elevated flex items-center justify-center text-base shrink-0">
        {icones[notif.tipo] || '🔔'}
      </div>

      <div className="flex-1 min-w-0">
        <div className={`text-sm ${notif.lida ? 'font-normal' : 'font-semibold'} text-text-primary truncate`}>
          {notif.titulo}
        </div>
        <div className="text-xs text-text-secondary mt-0.5 leading-snug">
          {notif.mensagem}
        </div>
        <div className="text-[11px] text-text-muted mt-1">
          {formatarTempoRelativo(notif.timestamp)}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5 shrink-0">
        {!notif.lida && (
          <div className="w-2 h-2 rounded-full bg-accent-primary" />
        )}
        <button
          onClick={e => { e.stopPropagation(); onDeletar(); }}
          className="bg-transparent border-none cursor-pointer text-text-muted text-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-danger"
          title="Excluir notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SinoNotificacoes({ setCurrentView, setTicketAtivo }: { setCurrentView: (v: string) => void, setTicketAtivo: (ticket: any | null) => void }) {
  const { getNotificacoesDoUsuario, getNaoLidas, marcarComoLida,
          marcarTodasComoLidas, deletarNotificacao, limparTodasNotificacoes, navegarParaChamado, navegarParaArtigo } = useAppContext();
  const { usuarioLogado } = useAuth();
  const [aberto, setAberto] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const [posicao, setPosicao] = useState({ top: 56, right: 16 });

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (btnRef.current && btnRef.current.contains(e.target as Node)) return;
      if (painelRef.current && !painelRef.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!usuarioLogado) return null;

  const todas = getNotificacoesDoUsuario(usuarioLogado.id, usuarioLogado.perfil);
  const naoLidas = getNaoLidas(usuarioLogado.id, usuarioLogado.perfil);

  function abrirPainel() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPosicao({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setAberto(prev => !prev);
  }

  function handleClicarNotificacao(notif: Notificacao) {
    marcarComoLida(notif.id);
    setAberto(false);

    switch(notif.linkTipo) {
      case 'chamado':
        if (notif.linkId) navegarParaChamado(notif.linkId);
        break;
      case 'artigo':
        if (notif.linkId) navegarParaArtigo(notif.linkId);
        break;
      case 'usuario':
        setCurrentView('users');
        break;
      default:
        break;
    }
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={abrirPainel}
        className="relative bg-transparent border-none cursor-pointer p-2 text-text-muted hover:text-text-primary transition-colors rounded-full hover:bg-white/5"
      >
        <Bell className="w-5 h-5" />
        {naoLidas > 0 && (
          <span className="absolute top-1 right-1 bg-danger text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && ReactDOM.createPortal(
        <div 
          ref={painelRef}
          style={{
            position: 'fixed',
            top: posicao.top,
            right: posicao.right,
            zIndex: 2500,
          }}
          className="w-[380px] max-h-[520px] bg-bg-surface border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-elevated/50">
            <div>
              <span className="font-semibold text-text-primary">Notificações</span>
              {naoLidas > 0 && (
                <span className="ml-2 text-[11px] bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full">
                  {naoLidas} nova{naoLidas > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {naoLidas > 0 && (
                <button
                  onClick={() => marcarTodasComoLidas(usuarioLogado.id, usuarioLogado.perfil)}
                  className="text-xs text-accent-primary bg-transparent border-none cursor-pointer hover:underline"
                >
                  ✓ Marcar lidas
                </button>
              )}
              {todas.length > 0 && (
                <button
                  onClick={() => limparTodasNotificacoes(usuarioLogado.id, usuarioLogado.perfil)}
                  className="text-xs text-text-muted bg-transparent border-none cursor-pointer hover:text-danger transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 max-h-[400px]">
            {todas.length === 0 ? (
              <div className="p-10 text-center text-text-muted text-sm flex flex-col items-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                Nenhuma notificação
              </div>
            ) : (
              todas.map(notif => (
                <ItemNotificacao
                  key={notif.id}
                  notif={notif}
                  onLer={() => handleClicarNotificacao(notif)}
                  onDeletar={() => deletarNotificacao(notif.id)}
                />
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// --- MAIN APP COMPONENT ---
function MainApp() {
  const { usuarioLogado, fazerLogin, fazerLogout } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");
  const { pedirConfirmacao, fecharConfirm, showToast } = useAppContext();
  const {
    tickets,
    ticketAtivo,
    setTicketAtivo,
    atualizarStatus,
    atualizarPrioridade,
    atribuirResponsavel,
    adicionarComentario,
    adicionarAtividade,
    atividades,
    deletarChamado,
    deletarChamados,
  } = useTickets();
  const { artigos } = useKB();
  const { usuarios } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { tema, alternarTema } = useTheme();
  
  // Estado para seleção múltipla de tickets
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Limpar seleção ao mudar de view
  useEffect(() => {
    setSelectedTickets([]);
  }, [currentView]);

  // Redirecionar usuários padrão para "my-tickets" se estiverem em views restritas
  useEffect(() => {
    if (usuarioLogado?.perfil === 'usuario') {
      const viewsRestritasParaUsuario = ['dashboard', 'all-tickets', 'reports', 'users', 'settings'];
      if (viewsRestritasParaUsuario.includes(currentView)) {
        setCurrentView('my-tickets');
      }
    }
  }, [usuarioLogado, currentView]);

  // Estado de intenção de navegação
  const [intencaoNavegacao, setIntencaoNavegacao] = useState<{ tipo: string, id: string } | null>(null);

  // Observar intenção e executar
  useEffect(() => {
    if (!intencaoNavegacao) return;

    const { tipo, id } = intencaoNavegacao;

    if (tipo === 'abrir_chamado') {
      const ticket = tickets.find(t => t.id === id);
      if (!ticket) {
        showToast('Chamado não encontrado ou foi excluído', 'error');
        setIntencaoNavegacao(null);
        return;
      }
      // Navegar para a view correta primeiro
      if (usuarioLogado?.perfil === 'admin') {
        setCurrentView('all-tickets');
      } else {
        setCurrentView('my-tickets');
      }
      // Abrir o modal
      setTimeout(() => {
        setTicketAtivo(ticket);
      }, 50);
      setIntencaoNavegacao(null);
    }

    if (tipo === 'abrir_artigo') {
      const artigo = artigos.find(a => a.id === id);
      if (!artigo) {
        showToast('Artigo não encontrado', 'error');
        setIntencaoNavegacao(null);
        return;
      }
      setCurrentView('kb');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('abrir-artigo', { detail: id }));
      }, 50);
      setIntencaoNavegacao(null);
    }

    if (tipo === 'abrir_view') {
      setCurrentView(id);
      setIntencaoNavegacao(null);
    }

  }, [intencaoNavegacao, tickets, artigos, usuarioLogado, setCurrentView, setTicketAtivo, showToast]);

  function navegarPara(tipo: string, id: string) {
    setIntencaoNavegacao({ tipo, id });
  }

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Fechar modais com ESC
      if (e.key === 'Escape') {
        if (ticketAtivo) setTicketAtivo(null);
      }

      // Alternar tema: Ctrl + Shift + T
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        alternarTema();
      }

      // Novo chamado: Ctrl + N (se não estiver em um input)
      if (e.ctrlKey && e.key === 'n' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setCurrentView('new-ticket');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ticketAtivo, alternarTema]);

  useEffect(() => {
    const handleNavChamado = (e: CustomEvent) => {
      const id = e.detail;
      const ticket = tickets.find(t => t.id === id);
      if (!ticket) {
        showToast('Chamado não encontrado ou foi excluído', 'error');
        return;
      }
      
      if (usuarioLogado?.perfil === 'admin') {
        setCurrentView('all-tickets');
      } else {
        setCurrentView('my-tickets');
      }
      setTimeout(() => {
        setTicketAtivo(ticket);
      }, 50);
    };

    const handleNavArtigo = (e: CustomEvent) => {
      const id = e.detail;
      setCurrentView('kb');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('abrir-artigo', { detail: id }));
      }, 50);
    };

    window.addEventListener('navegar-chamado', handleNavChamado as EventListener);
    window.addEventListener('navegar-artigo', handleNavArtigo as EventListener);

    return () => {
      window.removeEventListener('navegar-chamado', handleNavChamado as EventListener);
      window.removeEventListener('navegar-artigo', handleNavArtigo as EventListener);
    };
  }, [usuarioLogado, setCurrentView, setTicketAtivo, tickets, showToast]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    setTimeout(() => {
      const result = fazerLogin(loginEmail, loginSenha);
      setLoginLoading(false);
      if (!result.success) {
        setLoginError(result.error || "Erro ao fazer login");
      } else {
        // Verificar o perfil do usuário que acabou de fazer login
        const usuario = usuarios.find(u => u.email === loginEmail);
        setCurrentView(
          usuario?.perfil === "usuario" ? "my-tickets" : "dashboard"
        );
      }
    }, 800);
  };

  const handleLogout = () => {
    fazerLogout();
  };

  if (!usuarioLogado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <motion.div
            animate={loginError ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-8 text-center border-t-4 border-t-accent-primary">
              <div className="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_var(--color-accent-glow)]">
                <SettingsIcon className="w-8 h-8 text-accent-primary" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Central de Atendimento TI
              </h1>
              <p className="text-text-secondary mb-8">
                Faça login para gerenciar seus chamados e acessar a base de
                conhecimento.
              </p>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                {loginError && (
                  <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm text-center">
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e: any) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@montebravo.com.br"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginSenha}
                      onChange={(e: any) => setLoginSenha(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full py-3 mt-2"
                  disabled={loginLoading}
                >
                  {loginLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Card>
          </motion.div>

          <div className="mt-6 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/5">
            <p className="text-xs text-text-muted font-medium mb-2 uppercase tracking-wider">
              Acesso rápido para demonstração
            </p>
            <div className="space-y-2 text-sm text-text-secondary">
              <div
                className="flex justify-between cursor-pointer hover:text-accent-primary transition-colors"
                onClick={() => {
                  setLoginEmail("gabriel.juarez@montebravo.com.br");
                  setLoginSenha("admin123");
                }}
              >
                <span>Admin: gabriel.juarez@...</span>
                <span className="font-mono text-xs">admin123</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:text-accent-primary transition-colors"
                onClick={() => {
                  setLoginEmail("ana.lima@montebravo.com.br");
                  setLoginSenha("user123");
                }}
              >
                <span>Usuário: ana.lima@...</span>
                <span className="font-mono text-xs">user123</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const navItems =
    usuarioLogado.perfil === "admin"
      ? [
          { id: "dashboard", label: "Painel", icon: Home },
          { id: "my-tickets", label: "Meus Chamados", icon: Ticket },
          { id: "new-ticket", label: "Novo Chamado", icon: PlusCircle },
          { id: "all-tickets", label: "Todos os Chamados", icon: List },
          { id: "kb", label: "Base de Conhecimento", icon: BookOpen },
          { id: "reports", label: "Relatórios", icon: BarChart2 },
          { id: "users", label: "Usuários", icon: User },
          { id: "settings", label: "Configurações", icon: SettingsIcon },
        ]
      : [
          { id: "my-tickets", label: "Meus Chamados", icon: Ticket },
          { id: "new-ticket", label: "Novo Chamado", icon: PlusCircle },
          { id: "kb", label: "Base de Conhecimento", icon: BookOpen },
        ];

  return (
    <div className="min-h-screen flex bg-transparent text-text-primary relative overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-bg-sidebar/80 backdrop-blur-xl border-r border-border-subtle flex flex-col z-[100] hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_var(--color-accent-glow)]">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Central TI</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-accent-primary/20 text-accent-primary border-l-2 border-accent-primary"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary border-l-2 border-transparent"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-accent-primary" : "text-text-muted"}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <div
              className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-medium"
              onClick={() => setCurrentView("settings")}
            >
              {usuarioLogado.avatar}
            </div>
            <div
              className="flex-1 min-w-0"
              onClick={() => setCurrentView("settings")}
            >
              <p className="text-sm font-medium truncate group-hover:text-accent-primary transition-colors">
                {usuarioLogado.nome}
              </p>
              <p className="text-xs text-text-muted truncate">
                {usuarioLogado.email}
              </p>
            </div>
            <button
              onClick={() => {
                pedirConfirmacao({
                  titulo: 'Sair do sistema?',
                  mensagem: 'Deseja realmente encerrar sua sessão?',
                  textoBotao: 'Sair',
                  tipo: 'perigo',
                  onConfirmar: handleLogout
                });
              }}
              className="p-1 text-text-muted hover:text-danger transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-[1] relative">
        {/* Topbar */}
        <header className="h-16 bg-bg-surface/50 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 md:hidden">
            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Pesquisar chamados, artigos..."
                className="pl-10 bg-black/20 border-transparent focus:bg-bg-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const term = e.currentTarget.value;
                    if (term) {
                      // Simple implementation: just navigate to KB and set the search term
                      // In a real app, this would be a global search that searches tickets and KB
                      setCurrentView('kb');
                      // We can dispatch an event to set the search term in KB view
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('set-kb-search', { detail: term }));
                      }, 100);
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={alternarTema}
              className="p-2 text-text-secondary hover:text-accent-primary transition-all duration-300 hover:rotate-[360deg]"
              title={`Alternar para tema ${tema === 'escuro' ? 'claro' : 'escuro'} (Ctrl+Shift+T)`}
            >
              {tema === 'escuro' ? <motion.span initial={{ rotate: -20 }} animate={{ rotate: 0 }}><Moon className="w-5 h-5" /></motion.span> : <motion.span initial={{ rotate: 20 }} animate={{ rotate: 0 }}><Sun className="w-5 h-5" /></motion.span>}
            </button>
            <SinoNotificacoes setCurrentView={setCurrentView} setTicketAtivo={setTicketAtivo} />
            <button className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-medium hover:bg-accent-primary/30 transition-colors sm:hidden">
              {usuarioLogado.avatar}
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {currentView === "dashboard" &&
              (usuarioLogado.perfil === "admin" ? (
                <DashboardView onOpenTicket={setTicketAtivo} setCurrentView={setCurrentView} />
              ) : (
                <AcessoNegado />
              ))}
            {currentView === "my-tickets" && (
              <AllTicketsView
                onOpenTicket={setTicketAtivo}
                isMyTickets={true}
                selectedTickets={selectedTickets}
                setSelectedTickets={setSelectedTickets}
              />
            )}
            {currentView === "all-tickets" &&
              (usuarioLogado.perfil === "admin" ? (
                <AllTicketsView 
                  onOpenTicket={setTicketAtivo} 
                  selectedTickets={selectedTickets}
                  setSelectedTickets={setSelectedTickets}
                />
              ) : (
                <AcessoNegado />
              ))}
            {currentView === "new-ticket" && (
              <NewTicketView
                onSubmit={() => {
                  showToast("Chamado criado com sucesso");
                  setCurrentView("my-tickets");
                }}
                onCancel={() => setCurrentView("dashboard")}
                onOpenArticle={(artigo) => {
                  setCurrentView("kb");
                  // We need a way to open a specific article in KnowledgeBaseView
                  // For now, we'll just navigate to the KB view. The user can search for it.
                  // A better implementation would pass the article ID to the KB view.
                  // To keep it simple and within the requested scope, we'll dispatch a custom event
                  // that the KnowledgeBaseView can listen to.
                  window.dispatchEvent(new CustomEvent('open-kb-article', { detail: artigo }));
                }}
              />
            )}
            {currentView === "kb" && <KnowledgeBaseView />}
            {currentView === "reports" &&
              (usuarioLogado.perfil === "admin" ? (
                <Reports />
              ) : (
                <AcessoNegado />
              ))}
            {currentView === "users" &&
              (usuarioLogado.perfil === "admin" ? (
                <UsuariosView />
              ) : (
                <AcessoNegado />
              ))}
            {currentView === "settings" && <SettingsView />}
          </div>
        </div>
      </main>

      {/* Barra de Ações em Lote - Fixa na tela */}
      <AnimatePresence>
        {selectedTickets.length > 0 && usuarioLogado?.perfil === 'admin' && (currentView === 'all-tickets' || currentView === 'my-tickets') && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-[2500] bg-bg-elevated border border-accent-primary/30 shadow-[0_20px_60px_rgba(0,0,0,0.7)] rounded-2xl px-8 py-5 backdrop-blur-xl max-w-7xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
              {/* Contador de selecionados */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                  <span className="text-accent-primary font-bold text-sm">{selectedTickets.length}</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary">
                    {selectedTickets.length} chamado{selectedTickets.length > 1 ? 's' : ''} selecionado{selectedTickets.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-text-muted">Escolha uma ação para aplicar em lote</p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Alterar Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-secondary">Status</label>
                  <Select
                    className="w-36 py-2 text-sm bg-bg-surface border-accent-primary/30"
                    onChange={(e: any) => {
                      if (e.target.value) {
                        const statusValue = e.target.value;
                        const ticketsToUpdate = [...selectedTickets];
                        pedirConfirmacao({
                          titulo: 'Alterar Status dos Chamados',
                          mensagem: `Alterar o status de ${ticketsToUpdate.length} chamados para "${statusValue}"?`,
                          textoBotao: 'Alterar Status',
                          tipo: 'aviso',
                          onConfirmar: () => {
                            ticketsToUpdate.forEach(id => {
                              atualizarStatus(id, statusValue as Status);
                            });
                            setSelectedTickets([]);
                            showToast(`Status de ${ticketsToUpdate.length} chamados alterado para ${statusValue}`, 'success');
                          }
                        });
                        e.target.value = ''; // Reset select
                      }
                    }}
                  >
                    <option value="">Alterar Status</option>
                    <option value="Aberto">Aberto</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Aguardando">Aguardando</option>
                    <option value="Resolvido">Resolvido</option>
                    <option value="Fechado">Fechado</option>
                  </Select>
                </div>

                {/* Alterar Prioridade */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-secondary">Prioridade</label>
                  <Select
                    className="w-36 py-2 text-sm bg-bg-surface border-accent-primary/30"
                    onChange={(e: any) => {
                      if (e.target.value) {
                        const prioridadeValue = e.target.value;
                        const ticketsToUpdate = [...selectedTickets];
                        pedirConfirmacao({
                          titulo: 'Alterar Prioridade dos Chamados',
                          mensagem: `Alterar a prioridade de ${ticketsToUpdate.length} chamados para "${prioridadeValue}"?`,
                          textoBotao: 'Alterar Prioridade',
                          tipo: 'aviso',
                          onConfirmar: () => {
                            ticketsToUpdate.forEach(id => atualizarPrioridade(id, prioridadeValue as Priority));
                            setSelectedTickets([]);
                            showToast(`Prioridade de ${ticketsToUpdate.length} chamados alterada para ${prioridadeValue}`, 'success');
                          }
                        });
                        e.target.value = ''; // Reset select
                      }
                    }}
                  >
                    <option value="">Alterar Prioridade</option>
                    <option value="Crítico">Crítico</option>
                    <option value="Alto">Alto</option>
                    <option value="Médio">Médio</option>
                    <option value="Baixo">Baixo</option>
                  </Select>
                </div>

                {/* Atribuir Responsável */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-secondary">Responsável</label>
                  <Select
                    className="w-44 py-2 text-sm bg-bg-surface border-accent-primary/30"
                    onChange={(e: any) => {
                      if (e.target.value) {
                        const responsavelValue = e.target.value;
                        const ticketsToUpdate = [...selectedTickets];
                        pedirConfirmacao({
                          titulo: 'Atribuir Responsável',
                          mensagem: `Atribuir ${ticketsToUpdate.length} chamados para "${responsavelValue}"?`,
                          textoBotao: 'Atribuir',
                          tipo: 'aviso',
                          onConfirmar: () => {
                            ticketsToUpdate.forEach(id => atribuirResponsavel(id, responsavelValue));
                            setSelectedTickets([]);
                            showToast(`${ticketsToUpdate.length} chamados atribuídos para ${responsavelValue}`, 'success');
                          }
                        });
                        e.target.value = ''; // Reset select
                      }
                    }}
                  >
                    <option value="">Atribuir Responsável</option>
                    <option value="Não atribuído">Não atribuído</option>
                    {usuarios
                      .filter((u) => u.ativo)
                      .map((u) => (
                        <option key={u.id} value={u.nome}>
                          {u.nome}
                        </option>
                      ))}
                  </Select>
                </div>

                <div className="h-12 w-px bg-border-subtle mx-2"></div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const ticketsToDelete = [...selectedTickets];
                      pedirConfirmacao({
                        titulo: 'Excluir Chamados Selecionados',
                        mensagem: `Tem certeza que deseja excluir os ${ticketsToDelete.length} chamados selecionados?`,
                        mensagemExtra: 'Esta ação não pode ser desfeita.',
                        textoBotao: 'Excluir Chamados',
                        tipo: 'perigo',
                        onConfirmar: () => {
                          deletarChamados(ticketsToDelete);
                          setSelectedTickets([]);
                        }
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-danger hover:bg-danger/10 transition-colors border border-danger/30 bg-danger/5"
                  >
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>

                  <button 
                    onClick={() => setSelectedTickets([])}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors border border-border-subtle"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {ticketAtivo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
              onClick={() => setTicketAtivo(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-bg-surface border-l border-border-subtle shadow-2xl z-[2000] flex flex-col"
            >
              {ticketAtivo.status === 'Contestado' && usuarioLogado.perfil === 'admin' && (
                <div className="bg-orange-500/20 border-b border-orange-500/30 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-bold text-orange-500">Chamado Contestado</p>
                      <p className="text-xs text-orange-500/80">O usuário contestou a resolução deste chamado.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      atualizarStatus(ticketAtivo.id, 'Em Andamento');
                      setTicketAtivo({ ...ticketAtivo, status: 'Em Andamento' });
                      adicionarAtividade(ticketAtivo.id, "Chamado reanalisado pelo administrador", "reanalise");
                      showToast("Status alterado para Em Andamento");
                    }}
                    className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Reanalisar
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold font-mono text-text-secondary">
                    {ticketAtivo.id}
                  </h2>
                  {usuarioLogado.perfil === "admin" ? (
                    <Select
                      className="w-40 py-1 text-sm"
                      value={ticketAtivo.status}
                      onChange={(e: any) => {
                        atualizarStatus(ticketAtivo.id, e.target.value);
                        setTicketAtivo({
                          ...ticketAtivo,
                          status: e.target.value,
                        });
                        showToast("Status atualizado");
                      }}
                    >
                      <option value="Aberto">Aberto</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Aguardando">Aguardando</option>
                      <option value="Resolvido">Resolvido</option>
                      <option value="Contestado">Contestado</option>
                      <option value="Fechado">Fechado</option>
                    </Select>
                  ) : (
                    <Badge className={getStatusColor(ticketAtivo.status)}>
                      {ticketAtivo.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {usuarioLogado.perfil === 'admin' && (
                    <button
                      onClick={() => {
                        pedirConfirmacao({
                          titulo: 'Excluir chamado?',
                          mensagem: `O chamado [${ticketAtivo.id}] — ${ticketAtivo.title} será excluído permanentemente junto com todo o seu histórico e comentários.`,
                          mensagemExtra: 'Esta ação não pode ser desfeita.',
                          textoBotao: 'Excluir Permanentemente',
                          tipo: 'perigo',
                          onConfirmar: () => {
                            deletarChamado(ticketAtivo.id);
                            setTicketAtivo(null);
                          }
                        });
                      }}
                      className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-danger/20"
                      title="Excluir Chamado"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Excluir</span>
                    </button>
                  )}
                  <button
                    onClick={() => setTicketAtivo(null)}
                    className="p-2 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-4">
                    {ticketAtivo.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-text-secondary items-center">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" /> {ticketAtivo.requester}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {ticketAtivo.created}
                    </span>
                    {usuarioLogado.perfil === "admin" ? (
                      <>
                        <Select
                          className="w-32 py-1 text-xs"
                          value={ticketAtivo.priority}
                          onChange={(e: any) => {
                            atualizarPrioridade(ticketAtivo.id, e.target.value);
                            setTicketAtivo({
                              ...ticketAtivo,
                              priority: e.target.value,
                            });
                            showToast("Prioridade atualizada");
                          }}
                        >
                          <option value="Crítico">Crítico</option>
                          <option value="Alto">Alto</option>
                          <option value="Médio">Médio</option>
                          <option value="Baixo">Baixo</option>
                        </Select>
                        <Select
                          className="w-48 py-1 text-xs"
                          value={ticketAtivo.assignee}
                          onChange={(e: any) => {
                            atribuirResponsavel(ticketAtivo.id, e.target.value);
                            setTicketAtivo({
                              ...ticketAtivo,
                              assignee: e.target.value,
                            });
                            showToast("Responsável atualizado");
                          }}
                        >
                          <option value="Não atribuído">Não atribuído</option>
                          {usuarios
                            .filter((u) => u.ativo)
                            .map((u) => (
                              <option key={u.id} value={u.nome}>
                                {u.nome}
                              </option>
                            ))}
                        </Select>
                      </>
                    ) : (
                      <>
                        <Badge
                          className={getPriorityColor(ticketAtivo.priority)}
                        >
                          {ticketAtivo.priority}
                        </Badge>
                        <span className="flex items-center gap-1.5 text-text-secondary">
                          <User className="w-4 h-4" /> Responsável:{" "}
                          {ticketAtivo.assignee}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-text-secondary leading-relaxed">
                    {ticketAtivo.description}
                  </p>
                </div>

                {ticketAtivo.attachments && ticketAtivo.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border-subtle">
                    <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-accent-primary" /> Anexos ({ticketAtivo.attachments.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ticketAtivo.attachments.map((anexo: any, i: number) => (
                        <div key={i}>
                          <AttachmentViewer
                            attachment={anexo}
                            onDownload={() => downloadFile(anexo)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Articles */}
                {usuarioLogado.perfil === 'admin' && (
                  <div className="border border-border-subtle rounded-xl p-5 bg-bg-surface/50">
                    <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent-primary" /> Artigos Relacionados
                    </h3>
                    <div className="space-y-2">
                      {(() => {
                        const relacionados = artigos
                          .filter(a => a.categoria === ticketAtivo.category || a.tags.some(t => (ticketAtivo.title || "").toLowerCase().includes((t || "").toLowerCase())))
                          .slice(0, 3);
                        
                        if (relacionados.length === 0) {
                          return <p className="text-sm text-text-muted">Nenhum artigo relacionado encontrado.</p>;
                        }
                        
                        return relacionados.map(artigo => (
                          <div key={artigo.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-border-subtle group" onClick={() => {
                            setCurrentView('kb');
                            setTicketAtivo(null);
                          }}>
                            <div className="flex items-center gap-3 min-w-0">
                              <Badge className="bg-white/5 text-text-secondary text-[10px] px-1.5 py-0 shrink-0">{artigo.categoria}</Badge>
                              <span className="text-sm text-text-primary truncate group-hover:text-accent-primary transition-colors">{artigo.titulo}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                <div className="border-t border-border-subtle pt-8">
                  <h3 className="text-lg font-medium text-text-primary mb-6">
                    Atividade
                  </h3>
                  <div className="space-y-6">
                    <Timeline 
                      historico={(atividades[ticketAtivo.id] || []).filter(
                        (ativ: any) =>
                          usuarioLogado.perfil === "admin" ||
                          ativ.type !== "internal_comment",
                      )} 
                      ticketAtivo={ticketAtivo} 
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border-subtle bg-black/20">
                {ticketAtivo.status === 'Resolvido' && usuarioLogado.perfil === 'usuario' && (
                  <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning">Atenção: Chamado Resolvido</p>
                      <p className="text-xs text-warning/80 mt-1">
                        Este chamado está marcado como resolvido. Adicionar um novo comentário irá reabri-lo e alterar o status para "Contestado".
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-medium shrink-0">
                    {usuarioLogado.avatar}
                  </div>
                  <form
                    className="flex-1 space-y-3"
                    onSubmit={(e: any) => {
                      e.preventDefault();
                      const text = e.target.elements[0].value;
                      const isInterno = e.target.elements[1]?.checked || false;
                      if (!text.trim()) return;
                      adicionarComentario(ticketAtivo.id, text, isInterno);
                      e.target.reset();
                      showToast("Comentário adicionado");
                    }}
                  >
                    <textarea
                      placeholder="Adicionar um comentário..."
                      className="w-full bg-bg-surface border border-border-subtle rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary resize-none min-h-[100px]"
                    ></textarea>
                    <div className="flex justify-between items-center">
                      {usuarioLogado.perfil === "admin" ? (
                        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-border-subtle bg-bg-surface text-accent-primary focus:ring-accent-primary"
                          />
                          Nota interna (visível apenas para equipe)
                        </label>
                      ) : (
                        <div></div>
                      )}
                      <Button type="submit">Enviar Comentário</Button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
    </div>
  );
}

export default function App() {
  // Inicializar Three.js background
  useEffect(() => {
    const initBackground = () => {
      const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
      if (!canvas) {
        // Canvas ainda não existe, tentar de novo em 100ms
        setTimeout(initBackground, 100);
        return;
      }

      const AMOUNTX = 50;
      const AMOUNTY = 50;
      const SEPARATION = 120;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      // Initial color based on localStorage or default to dark
      const initialTheme = localStorage.getItem('mb_tema') || 'escuro';
      renderer.setClearColor(initialTheme === 'claro' ? 0xf5f3ff : 0x0d0b14, 1);

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.set(0, 300, 1000);

      // Criar geometria
      const totalParticles = AMOUNTX * AMOUNTY;
      const positions = new Float32Array(totalParticles * 3);

      let idx = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[idx * 3 + 0] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
          positions[idx * 3 + 1] = 0;
          positions[idx * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
          idx++;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: initialTheme === 'claro' ? 0x7C3AED : 0xb48cff,
        size: 6,
        transparent: true,
        opacity: initialTheme === 'claro' ? 0.3 : 0.6,
        sizeAttenuation: true
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // Variável de contagem FORA do loop de animação
      let count = 0;
      let rafId: number | null = null;

      function animate() {
        rafId = requestAnimationFrame(animate);

        // Atualizar posições Y
        const pos = geometry.attributes.position.array as Float32Array;
        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
          for (let iy = 0; iy < AMOUNTY; iy++) {
            pos[i * 3 + 1] =
              Math.sin((ix + count) * 0.3) * 100 +
              Math.sin((iy + count) * 0.5) * 100;
            i++;
          }
        }

        // CRÍTICO: marcar como atualizado a cada frame
        geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        count += 0.08;
      }

      // Iniciar animação
      animate();

      // Resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);

      // Expor para troca de tema
      // @ts-ignore
      window.__bgMaterial = material;
      // @ts-ignore
      window.__bgRenderer = renderer;

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      };
    };

    const cleanup = initBackground();
    return cleanup;
  }, []);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    aberto: boolean;
    titulo: string;
    mensagem: string;
    mensagemExtra?: string;
    textoBotao?: string;
    tipo?: 'perigo' | 'aviso';
    onConfirmar: () => void;
  }>({
    aberto: false,
    titulo: '',
    mensagem: '',
    onConfirmar: () => {}
  });

  const fecharConfirm = () => setConfirmDialog(prev => ({ ...prev, aberto: false }));

  const pedirConfirmacao = (options: ConfirmDialogOptions) => {
    setConfirmDialog({
      aberto: true,
      ...options
    });
  };

  const showToast = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(() => {
    const saved = localStorage.getItem('mb_notificacoes');
    return saved ? JSON.parse(saved, (k, v) =>
      k === 'timestamp' ? new Date(v) : v
    ) : [];
  });

  useEffect(() => {
    localStorage.setItem('mb_notificacoes', JSON.stringify(notificacoes));
  }, [notificacoes]);

  const criarNotificacao = (notif: Omit<Notificacao, 'id' | 'lida' | 'timestamp'>) => {
    const nova: Notificacao = {
      id: 'notif_' + Date.now() + Math.random(),
      ...notif,
      destinatarios: notif.destinatarios || ['admin'],
      lida: false,
      timestamp: new Date()
    };
    setNotificacoes(prev => [nova, ...prev].slice(0, 200));
  };

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev =>
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
  };

  const marcarTodasComoLidas = (usuarioId: string, perfil: string) => {
    setNotificacoes(prev =>
      prev.map(n => {
        const destinado = n.destinatarios.includes('todos') ||
          (perfil === 'admin' && n.destinatarios.includes('admin')) ||
          n.destinatarios.includes(usuarioId);
        return destinado ? { ...n, lida: true } : n;
      })
    );
  };

  const deletarNotificacao = (id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  const limparTodasNotificacoes = (usuarioId: string, perfil: string) => {
    setNotificacoes(prev =>
      prev.filter(n => {
        const destinado = n.destinatarios.includes('todos') ||
          (perfil === 'admin' && n.destinatarios.includes('admin')) ||
          n.destinatarios.includes(usuarioId);
        return !destinado;
      })
    );
  };

  const getNotificacoesDoUsuario = (usuarioId: string, perfil: string) => {
    return notificacoes.filter(n =>
      n.destinatarios.includes('todos') ||
      (perfil === 'admin' && n.destinatarios.includes('admin')) ||
      n.destinatarios.includes(usuarioId)
    );
  };

  const getNaoLidas = (usuarioId: string, perfil: string) => {
    return getNotificacoesDoUsuario(usuarioId, perfil).filter(n => !n.lida).length;
  };

  const navegarParaChamado = (id: string) => {
    window.dispatchEvent(new CustomEvent('navegar-chamado', { detail: id }));
  };

  const navegarParaArtigo = (id: string) => {
    window.dispatchEvent(new CustomEvent('navegar-artigo', { detail: id }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmDialog.aberto) {
        fecharConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog.aberto]);

  return (
    <AppContext.Provider value={{
      pedirConfirmacao,
      fecharConfirm,
      showToast,
      confirmDialog,
      notificacoes,
      criarNotificacao,
      marcarComoLida,
      marcarTodasComoLidas,
      deletarNotificacao,
      limparTodasNotificacoes,
      getNotificacoesDoUsuario,
      getNaoLidas,
      navegarParaChamado,
      navegarParaArtigo
    }}>
      <ThemeProvider>
        <AuthProvider>
          <TicketProvider>
            <KBProvider>
              <MainApp />
            </KBProvider>
          </TicketProvider>
        </AuthProvider>
      </ThemeProvider>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[4000]"
          >
            <div className="bg-bg-surface border border-border-subtle shadow-2xl rounded-lg p-4 flex items-center gap-3 overflow-hidden relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === "success" ? "bg-success/20 text-success" : "bg-info/20 text-info"}`}
              >
                {toast.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <p className="text-sm font-medium text-text-primary pr-4">
                {toast.message}
              </p>
              <button
                onClick={() => setToast(null)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: 0 }}
                transition={{ duration: 3, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 ${toast.type === "success" ? "bg-success" : "bg-info"}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog />
    </AppContext.Provider>
  );
}
