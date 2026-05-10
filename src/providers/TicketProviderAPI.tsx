/**
 * TicketProviderAPI - Versão com API
 * Gerencia chamados usando o backend Railway
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { API_ENDPOINTS } from '../config/api';

// Tipos do frontend
type Priority = "Baixo" | "Médio" | "Alto" | "Crítico";
type Status = "Aberto" | "Em Andamento" | "Aguardando Aprovação" | "Aguardando" | "Resolvido" | "Fechado" | "Contestado";
type Category = "Hardware" | "Software" | "Rede" | "Acesso" | "Outros";

interface Avaliacao {
  nota: number;
  resolvido: boolean;
  comentario?: string;
  dataAvaliacao: Date;
  ignorado?: boolean;
}

interface Attachment {
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface TicketData {
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
  avaliacao?: Avaliacao;
  atualizadoEm?: Date;
  _count?: {
    atividades: number;
    anexos: number;
  };
}

interface LogExclusao {
  id: number;
  tipo: 'chamado' | 'artigo' | 'usuario';
  itemId: string;
  nome: string;
  excluidoPor: string;
  timestamp: string;
}

interface SLAConfig {
  critico: { horas: number; tempoMedio: number };
  alto: { horas: number; tempoMedio: number };
  medio: { horas: number; tempoMedio: number };
  baixo: { horas: number; tempoMedio: number };
}

interface TicketContextType {
  tickets: TicketData[];
  filtros: { status: string; prioridade: string; categoria: string; busca: string; };
  setFiltros: React.Dispatch<React.SetStateAction<{ status: string; prioridade: string; categoria: string; busca: string; }>>;
  ticketAtivo: TicketData | null;
  setTicketAtivo: React.Dispatch<React.SetStateAction<TicketData | null>>;
  criarChamado: (dados: Partial<TicketData> & { solicitanteId?: string; solicitanteNome?: string; solicitanteEmail?: string }) => TicketData;
  atualizarStatus: (id: string, novoStatus: Status) => Promise<void>;
  atualizarPrioridade: (id: string, novaPrioridade: Priority) => Promise<void>;
  atribuirResponsavel: (id: string, responsavel: string) => Promise<void>;
  adicionarComentario: (id: string, texto: string, isInterno: boolean) => Promise<void>;
  adicionarAtividade: (id: string, text: string, type?: string) => void;
  deletarChamado: (id: string) => void;
  deletarChamados: (ids: string[]) => void;
  atividades: Record<string, any[]>;
  avaliarChamado: (id: string, nota: number, resolvido: boolean, comentario?: string) => void;
  ignorarAvaliacao: (id: string) => void;
  slaConfig: SLAConfig;
  setSlaConfig: React.Dispatch<React.SetStateAction<SLAConfig>>;
  calcularTempoMedio: (prioridade: Priority) => number;
  handleSaveSLA: () => void;
  carregando: boolean;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error("useTickets must be used within TicketProviderAPI");
  return context;
};

// Mapeamento de prioridade frontend -> API
const mapPriorityToAPI = (p: Priority): string => {
  const map: Record<string, string> = {
    'Crítico': 'CRITICO',
    'Alto': 'ALTO',
    'Médio': 'MEDIO',
    'Baixo': 'BAIXO',
  };
  return map[p] || 'MEDIO';
};

const mapPriorityFromAPI = (p: string): Priority => {
  const map: Record<string, Priority> = {
    'CRITICO': 'Crítico',
    'ALTO': 'Alto',
    'MEDIO': 'Médio',
    'BAIXO': 'Baixo',
  };
  return map[p] || 'Médio';
};

const mapCategoryToAPI = (c: string): string => {
  const map: Record<string, string> = {
    'Hardware': 'HARDWARE',
    'Software': 'SOFTWARE',
    'Rede': 'REDE',
    'Acesso': 'ACESSO',
    'Outros': 'OUTROS',
  };
  return map[c] || 'OUTROS';
};

const mapCategoryFromAPI = (c: string): string => {
  const map: Record<string, string> = {
    'HARDWARE': 'Hardware',
    'SOFTWARE': 'Software',
    'REDE': 'Rede',
    'ACESSO': 'Acesso',
    'OUTROS': 'Outros',
  };
  return map[c] || 'Outros';
};

const mapStatusToAPI = (s: Status): string => {
  const map: Record<string, string> = {
    'Aberto': 'ABERTO',
    'Em Andamento': 'EM_ANDAMENTO',
    'Aguardando Aprovação': 'AGUARDANDO_APROVACAO',
    'Aguardando': 'AGUARDANDO',
    'Resolvido': 'RESOLVIDO',
    'Fechado': 'FECHADO',
    'Contestado': 'CONTESTADO',
  };
  return map[s] || 'ABERTO';
};

const mapStatusFromAPI = (s: string): Status => {
  const map: Record<string, Status> = {
    'ABERTO': 'Aberto',
    'EM_ANDAMENTO': 'Em Andamento',
    'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
    'AGUARDANDO': 'Aguardando',
    'RESOLVIDO': 'Resolvido',
    'FECHADO': 'Fechado',
    'CONTESTADO': 'Contestado',
  };
  return map[s] || 'Aberto';
};

const API_URL = (() => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const RAILWAY_API_URL = 'https://servicedeskmb-production-97fa.up.railway.app';
  const LOCAL_API_URL = 'http://localhost:3001';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  return isLocalhost ? LOCAL_API_URL : RAILWAY_API_URL;
})();

const apiGet = async (url: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const apiPost = async (url: string, data: any) => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const apiPatch = async (url: string, data: any) => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const apiDelete = async (url: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const convertChamadoToTicketData = (chamado: any): TicketData => {
  return {
    id: chamado.id,
    title: chamado.titulo,
    requester: chamado.solicitante?.nome || 'Desconhecido',
    solicitanteId: chamado.solicitanteId,
    email: chamado.solicitante?.email,
    priority: mapPriorityFromAPI(chamado.prioridade),
    status: mapStatusFromAPI(chamado.status),
    category: mapCategoryFromAPI(chamado.categoria) as Category,
    assignee: chamado.responsavel?.nome || 'Não atribuído',
    created: formatarDataRelativa(chamado.criadoEm),
    sla: chamado.slaVencimento ? `Vence ${new Date(chamado.slaVencimento).toLocaleDateString()}` : '-',
    description: chamado.descricao,
    attachments: chamado.anexos?.map((a: any) => ({
      name: a.nomeOriginal,
      size: a.tamanho,
      type: a.mimeType,
      url: a.url,
    })),
    avaliacao: chamado.avaliacaoNota ? {
      nota: chamado.avaliacaoNota,
      resolvido: chamado.avaliacaoResolvido ?? false,
      comentario: chamado.avaliacaoComentario,
      dataAvaliacao: chamado.avaliacaoData ? new Date(chamado.avaliacaoData) : new Date(),
      ignorado: chamado.avaliacaoIgnorada,
    } : undefined,
    _count: chamado._count,
  };
};

function formatarDataRelativa(data: string | Date): string {
  const agora = new Date();
  const diff = agora.getTime() - new Date(data).getTime();
  const min = Math.floor(diff / 60000);
  const hrs = Math.floor(min / 60);
  const dias = Math.floor(hrs / 24);

  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} minuto${min > 1 ? 's' : ''}`;
  if (hrs < 24) return `há ${hrs} hora${hrs > 1 ? 's' : ''}`;
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  return new Date(data).toLocaleDateString('pt-BR');
}

const MOCK_TICKETS: TicketData[] = [];

export const TicketProviderAPI = ({ children }: { children: React.ReactNode }) => {
  const { usuarioLogado } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({
    status: "todos",
    prioridade: "todas",
    categoria: "todas",
    busca: "",
  });
  const [ticketAtivo, setTicketAtivo] = useState<TicketData | null>(null);
  const [atividades, setAtividades] = useState<Record<string, any[]>>({});
  const [slaConfig, setSlaConfig] = useState({
    critico: { horas: 4, tempoMedio: 2.5 },
    alto: { horas: 8, tempoMedio: 6.2 },
    medio: { horas: 24, tempoMedio: 18.5 },
    baixo: { horas: 72, tempoMedio: 45.8 }
  });
  const [logExclusoes, setLogExclusoes] = useState<LogExclusao[]>(() => {
    const saved = localStorage.getItem('mb_log');
    return saved ? JSON.parse(saved) : [];
  });

  // Carregar tickets da API
  const carregarTickets = useCallback(async () => {
    if (!usuarioLogado) {
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      const isAdmin = usuarioLogado.perfil === 'admin';
      
      // Tentar carregar do localStorage como fallback
      const saved = localStorage.getItem('mb_tickets');
      if (saved) {
        const localTickets = JSON.parse(saved);
        if (localTickets.length > 0) {
          setTickets(localTickets);
          setCarregando(false);
          
          // Tentar carregar da API em background
          try {
            const chamados = await apiGet(API_ENDPOINTS.tickets.list);
            if (Array.isArray(chamados) && chamados.length > 0) {
              setTickets(chamados.map(convertChamadoToTicketData));
              // Limpar localStorage após migrar
              localStorage.removeItem('mb_tickets');
            }
          } catch (e) {
            // Fallback mantém dados do localStorage
          }
          
          return;
        }
      }

      // Carregar da API
      const chamados = await apiGet(API_ENDPOINTS.tickets.list);
      if (Array.isArray(chamados)) {
        setTickets(chamados.map(convertChamadoToTicketData));
      }
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      // Fallback para localStorage
      const saved = localStorage.getItem('mb_tickets');
      if (saved) {
        setTickets(JSON.parse(saved));
      }
    } finally {
      setCarregando(false);
    }
  }, [usuarioLogado]);

  // Carregar tickets quando o usuário logar
  useEffect(() => {
    carregarTickets();
  }, [carregarTickets]);

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

  const calcularTempoMedio = (prioridade: Priority) => {
    const ticketsResolvidos = tickets.filter(t => 
      t.priority === prioridade && (t.status === 'Resolvido' || t.status === 'Fechado')
    );
    
    if (ticketsResolvidos.length === 0) {
      const defaults = { 'Crítico': 2.5, 'Alto': 6.2, 'Médio': 18.5, 'Baixo': 45.8 };
      return defaults[prioridade] || 24;
    }

    const tempoTotal = ticketsResolvidos.reduce((acc, ticket) => {
      let tempoBase = 0;
      switch (ticket.priority) {
        case 'Crítico': tempoBase = 1 + Math.random() * 4; break;
        case 'Alto': tempoBase = 3 + Math.random() * 8; break;
        case 'Médio': tempoBase = 8 + Math.random() * 20; break;
        case 'Baixo': tempoBase = 24 + Math.random() * 48; break;
        default: tempoBase = 12; break;
      }
      return acc + tempoBase;
    }, 0);

    return Math.round((tempoTotal / ticketsResolvidos.length) * 10) / 10;
  };

  const handleSaveSLA = () => {
    const novoConfig = {
      critico: { ...slaConfig.critico, tempoMedio: calcularTempoMedio('Crítico') },
      alto: { ...slaConfig.alto, tempoMedio: calcularTempoMedio('Alto') },
      medio: { ...slaConfig.medio, tempoMedio: calcularTempoMedio('Médio') },
      baixo: { ...slaConfig.baixo, tempoMedio: calcularTempoMedio('Baixo') }
    };
    setSlaConfig(novoConfig);
  };

  const adicionarAtividade = (id: string, text: string, type: string = "system") => {
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

  const criarChamado = (dados: Partial<TicketData> & { solicitanteId?: string; solicitanteNome?: string; solicitanteEmail?: string }) => {
    const maxId = tickets.reduce((max, t) => {
      const num = parseInt(t.id.replace('TKT-', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const newId = `TKT-${String(maxId + 1).padStart(4, "0")}`;
    
    const solicitanteId = dados.solicitanteId || usuarioLogado?.id;
    const solicitanteNome = dados.solicitanteNome || usuarioLogado?.nome || "Usuário";
    const solicitanteEmail = dados.solicitanteEmail || usuarioLogado?.email;
    
    const newTicket: TicketData = {
      id: newId,
      title: dados.title || "Novo Chamado",
      requester: solicitanteNome,
      solicitanteId: solicitanteId,
      email: solicitanteEmail,
      priority: dados.priority || "Médio",
      status: dados.status || "Aberto",
      category: dados.category || "Outros",
      assignee: "Não atribuído",
      created: "Agora mesmo",
      sla: "24h restantes",
      description: dados.description || "",
      attachments: dados.attachments || [],
    };

    // Salvar no backend
    apiPost(API_ENDPOINTS.tickets.create, {
      titulo: newTicket.title,
      descricao: newTicket.description,
      prioridade: mapPriorityToAPI(newTicket.priority),
      categoria: mapCategoryToAPI(newTicket.category),
      attachments: newTicket.attachments,
    }).then(response => {
      if (response && response.id) {
        setTickets(prev => prev.map(t => 
          t.id === newId ? convertChamadoToTicketData(response) : t
        ));
      }
    }).catch(error => {
      console.error('Erro ao criar chamado no backend:', error);
      // Manter local como fallback
    });

    setTickets([newTicket, ...tickets]);
    adicionarAtividade(newId, `${newTicket.requester} criou o chamado`);

    return newTicket;
  };

  const atualizarStatus = async (id: string, novoStatus: Status) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    const statusAnterior = ticket.status;

    setTickets(prevTickets =>
      prevTickets.map((t) => (t.id === id ? { ...t, status: novoStatus, atualizadoEm: new Date() } : t))
    );
    adicionarAtividade(id, `Status alterado para ${novoStatus}`);

    // Atualizar no backend
    try {
      await apiPatch(API_ENDPOINTS.tickets.updateStatus(id), { status: mapStatusToAPI(novoStatus) });
    } catch (error) {
      console.error('Erro ao atualizar status no backend:', error);
    }
  };

  const atualizarPrioridade = async (id: string, novaPrioridade: Priority) => {
    setTickets(prevTickets =>
      prevTickets.map((t) => t.id === id ? { ...t, priority: novaPrioridade } : t)
    );
    adicionarAtividade(id, `Prioridade alterada para ${novaPrioridade}`);

    try {
      await apiPatch(API_ENDPOINTS.tickets.updatePriority(id), { prioridade: mapPriorityToAPI(novaPrioridade) });
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
    }
  };

  const atribuirResponsavel = async (id: string, responsavel: string) => {
    setTickets(prevTickets =>
      prevTickets.map((t) => (t.id === id ? { ...t, assignee: responsavel } : t))
    );
    adicionarAtividade(id, `Atribuído a ${responsavel}`);
  };

  const adicionarComentario = async (id: string, texto: string, isInterno: boolean) => {
    adicionarAtividade(id, texto, isInterno ? "internal_comment" : "comment");

    try {
      await apiPost(API_ENDPOINTS.tickets.addComment(id), { texto, interno: isInterno });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  const avaliarChamado = (id: string, nota: number, resolvido: boolean, comentario?: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    const avaliacao: Avaliacao = {
      nota,
      resolvido,
      comentario,
      dataAvaliacao: new Date(),
      ignorado: false
    };

    setTickets(prevTickets =>
      prevTickets.map((t) => (t.id === id ? { ...t, avaliacao } : t))
    );

    adicionarAtividade(id, `Chamado avaliado: ${nota} estrelas`, "comment");

    try {
      apiPost(API_ENDPOINTS.tickets.rate(id), { nota, resolvido, comentario });
    } catch (error) {
      console.error('Erro ao avaliar chamado:', error);
    }
  };

  const ignorarAvaliacao = (id: string) => {
    setTickets(prevTickets =>
      prevTickets.map((t) => (t.id === id ? { ...t, avaliacao: { nota: 0, resolvido: false, dataAvaliacao: new Date(), ignorado: true } } : t))
    );
  };

  const deletarChamado = (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    setTickets(prev => prev.filter(t => t.id !== id));
    registrarExclusao('chamado', id, ticket?.title || id);

    try {
      apiDelete(API_ENDPOINTS.tickets.delete(id));
    } catch (error) {
      console.error('Erro ao deletar chamado:', error);
    }
  };

  const deletarChamados = (ids: string[]) => {
    const ticketsToDelete = tickets.filter(t => ids.includes(t.id));
    setTickets(prev => prev.filter(t => !ids.includes(t.id)));
    ticketsToDelete.forEach(t => registrarExclusao('chamado', t.id, t.title));

    ids.forEach(id => {
      try { apiDelete(API_ENDPOINTS.tickets.delete(id)); } catch (e) {}
    });
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
        avaliarChamado,
        ignorarAvaliacao,
        slaConfig,
        setSlaConfig,
        calcularTempoMedio,
        handleSaveSLA,
        carregando,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export default TicketProviderAPI;