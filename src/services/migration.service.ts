/**
 * Serviço de Migração
 * Migra dados do localStorage para o backend
 */

import { API_ENDPOINTS, apiPost } from '../config/api';

interface MigrationResult {
  success: boolean;
  tickets: number;
  artigos: number;
  erros: string[];
}

/**
 * Migra dados do localStorage para o backend
 */
export const migrarDadosLocalStorage = async (token: string): Promise<MigrationResult> => {
  const resultado: MigrationResult = {
    success: true,
    tickets: 0,
    artigos: 0,
    erros: [],
  };

  // 1. Migrar Tickets
  try {
    const ticketsSalvos = localStorage.getItem('mb_tickets');
    if (ticketsSalvos) {
      const tickets = JSON.parse(ticketsSalvos);
      for (const ticket of tickets) {
        try {
          await apiPost(API_ENDPOINTS.tickets.create, {
            titulo: ticket.title || ticket.titulo,
            descricao: ticket.description || '',
            prioridade: mapearPrioridade(ticket.priority),
            categoria: mapearCategoria(ticket.category),
            status: mapearStatus(ticket.status),
          });
          resultado.tickets++;
        } catch (error: any) {
          // Ignorar erros de ticket duplicado
          if (!error.message?.includes('Duplicate') && !error.message?.includes('duplicate')) {
            resultado.erros.push(`Ticket ${ticket.id}: ${error.message}`);
          }
        }
      }
    }
  } catch (error: any) {
    resultado.erros.push(`Erro ao migrar tickets: ${error.message}`);
  }

  // 2. Migrar Artigos KB
  try {
    const artigosSalvos = localStorage.getItem('mb_artigos');
    if (artigosSalvos) {
      const artigos = JSON.parse(artigosSalvos);
      for (const artigo of artigos) {
        try {
          await apiPost(API_ENDPOINTS.kb.create, {
            titulo: artigo.titulo,
            conteudo: artigo.conteudo,
            categoria: artigo.categoria,
            tags: artigo.tags || [],
            publicado: artigo.publicado ?? true,
          });
          resultado.artigos++;
        } catch (error: any) {
          if (!error.message?.includes('Duplicate') && !error.message?.includes('duplicate')) {
            resultado.erros.push(`Artigo ${artigo.id}: ${error.message}`);
          }
        }
      }
    }
  } catch (error: any) {
    resultado.erros.push(`Erro ao migrar artigos: ${error.message}`);
  }

  if (resultado.erros.length > 0) {
    resultado.success = false;
  }

  return resultado;
};

function mapearPrioridade(prioridade: string): string {
  const mapa: Record<string, string> = {
    'Crítico': 'CRITICO',
    'Alto': 'ALTO',
    'Médio': 'MEDIO',
    'Baixo': 'BAIXO',
  };
  return mapa[prioridade] || 'MEDIO';
}

function mapearCategoria(categoria: string): string {
  const mapa: Record<string, string> = {
    'Hardware': 'HARDWARE',
    'Software': 'SOFTWARE',
    'Rede': 'REDE',
    'Acesso': 'ACESSO',
    'Outros': 'OUTROS',
  };
  return mapa[categoria] || 'OUTROS';
}

function mapearStatus(status: string): string {
  const mapa: Record<string, string> = {
    'Aberto': 'ABERTO',
    'Em Andamento': 'EM_ANDAMENTO',
    'Aguardando Aprovação': 'AGUARDANDO_APROVACAO',
    'Aguardando': 'AGUARDANDO',
    'Resolvido': 'RESOLVIDO',
    'Fechado': 'FECHADO',
    'Contestado': 'CONTESTADO',
  };
  return mapa[status] || 'ABERTO';
}

export default {
  migrarDadosLocalStorage,
};