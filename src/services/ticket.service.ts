/**
 * Serviço de Tickets (Chamados)
 * Gerencia operações CRUD de chamados
 */

import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '../config/api';

export type Priority = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
export type Status = 'ABERTO' | 'EM_ANDAMENTO' | 'AGUARDANDO_APROVACAO' | 'AGUARDANDO' | 'RESOLVIDO' | 'FECHADO' | 'CONTESTADO';
export type Category = 'HARDWARE' | 'SOFTWARE' | 'REDE' | 'ACESSO' | 'OUTROS';

export interface Ticket {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: Priority;
  status: Status;
  categoria: Category;
  solicitanteId: string;
  solicitante?: {
    id: string;
    nome: string;
    email: string;
  };
  responsavelId?: string;
  responsavel?: {
    id: string;
    nome: string;
    email: string;
  };
  slaHoras: number;
  slaVencimento?: string;
  slaCumprido?: boolean;
  avaliacaoNota?: number;
  avaliacaoResolvido?: boolean;
  avaliacaoComentario?: string;
  avaliacaoData?: string;
  avaliacaoIgnorada: boolean;
  criadoEm: string;
  atualizadoEm: string;
  resolvidoEm?: string;
  fechadoEm?: string;
  atividades?: any[];
  anexos?: any[];
}

export interface CreateTicketData {
  titulo: string;
  descricao: string;
  prioridade: Priority;
  categoria: Category;
  responsavelId?: string;
}

export interface UpdateTicketData {
  titulo?: string;
  descricao?: string;
  prioridade?: Priority;
  status?: Status;
  categoria?: Category;
  responsavelId?: string;
}

export interface TicketFilters {
  status?: Status;
  prioridade?: Priority;
  categoria?: Category;
  solicitanteId?: string;
  responsavelId?: string;
}

/**
 * Lista todos os chamados
 */
export const listTickets = async (filters?: TicketFilters): Promise<Ticket[]> => {
  try {
    let url = API_ENDPOINTS.tickets.list;
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await apiGet(url);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    throw error;
  }
};

/**
 * Lista os chamados do usuário logado
 */
export const listMyTickets = async (): Promise<Ticket[]> => {
  try {
    // A rota /my-tickets não existe, usar a rota principal que já filtra por usuário
    const response = await apiGet(API_ENDPOINTS.tickets.list);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Erro ao listar meus tickets:', error);
    throw error;
  }
};

/**
 * Obtém um chamado por ID
 */
export const getTicket = async (id: string): Promise<Ticket | null> => {
  try {
    const response = await apiGet(API_ENDPOINTS.tickets.get(id));
    return response;
  } catch (error) {
    console.error('Erro ao obter ticket:', error);
    return null;
  }
};

/**
 * Cria um novo chamado
 */
export const createTicket = async (data: CreateTicketData): Promise<Ticket> => {
  try {
    const response = await apiPost(API_ENDPOINTS.tickets.create, data);
    return response;
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    throw error;
  }
};

/**
 * Atualiza um chamado
 */
export const updateTicket = async (id: string, data: UpdateTicketData): Promise<Ticket> => {
  try {
    const response = await apiPut(API_ENDPOINTS.tickets.update(id), data);
    return response;
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    throw error;
  }
};

/**
 * Deleta um chamado
 */
export const deleteTicket = async (id: string): Promise<void> => {
  try {
    await apiDelete(API_ENDPOINTS.tickets.delete(id));
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    throw error;
  }
};

/**
 * Atualiza o status de um chamado
 */
export const updateTicketStatus = async (id: string, status: Status): Promise<Ticket> => {
  try {
    const response = await apiPut(API_ENDPOINTS.tickets.updateStatus(id), { status });
    return response;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
};

/**
 * Atualiza a prioridade de um chamado
 */
export const updateTicketPriority = async (id: string, prioridade: Priority): Promise<Ticket> => {
  try {
    const response = await apiPut(API_ENDPOINTS.tickets.updatePriority(id), { prioridade });
    return response;
  } catch (error) {
    console.error('Erro ao atualizar prioridade:', error);
    throw error;
  }
};

/**
 * Atribui um chamado a um responsável
 */
export const assignTicket = async (id: string, responsavelId: string): Promise<Ticket> => {
  try {
    const response = await apiPost(API_ENDPOINTS.tickets.assign(id), { responsavelId });
    return response;
  } catch (error) {
    console.error('Erro ao atribuir ticket:', error);
    throw error;
  }
};

/**
 * Adiciona um comentário ao chamado
 */
export const addComment = async (id: string, texto: string, interno: boolean = false): Promise<any> => {
  try {
    const response = await apiPost(API_ENDPOINTS.tickets.addComment(id), { texto, interno });
    return response;
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw error;
  }
};

/**
 * Adiciona uma atividade ao chamado
 */
export const addActivity = async (id: string, tipo: string, texto: string, valorAnterior?: string, valorNovo?: string): Promise<any> => {
  try {
    const response = await apiPost(API_ENDPOINTS.tickets.addActivity(id), {
      tipo,
      texto,
      valorAnterior,
      valorNovo,
    });
    return response;
  } catch (error) {
    console.error('Erro ao adicionar atividade:', error);
    throw error;
  }
};

/**
 * Avalia um chamado
 */
export const rateTicket = async (
  id: string,
  nota: number,
  resolvido: boolean,
  comentario?: string
): Promise<Ticket> => {
  try {
    const response = await apiPost(API_ENDPOINTS.tickets.rate(id), {
      nota,
      resolvido,
      comentario,
    });
    return response;
  } catch (error) {
    console.error('Erro ao avaliar ticket:', error);
    throw error;
  }
};
