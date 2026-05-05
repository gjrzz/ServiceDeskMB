/**
 * Serviço de Notificações
 * Gerencia notificações do usuário
 */

import { API_ENDPOINTS, apiGet, apiPost, apiDelete } from '../config/api';

export type NotificationType = 
  | 'CHAMADO_CRIADO'
  | 'CHAMADO_ATUALIZADO'
  | 'CHAMADO_RESOLVIDO'
  | 'COMENTARIO_ADICIONADO'
  | 'STATUS_ALTERADO'
  | 'PRIORIDADE_ALTERADA'
  | 'KB_CRIADO'
  | 'KB_EDITADO'
  | 'USUARIO_CRIADO'
  | 'SOLICITAR_AVALIACAO';

export interface Notification {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensagem: string;
  linkTipo?: string;
  linkId?: string;
  destinatarioId: string;
  lida: boolean;
  criadoEm: string;
}

/**
 * Lista todas as notificações do usuário logado
 */
export const listNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiGet(API_ENDPOINTS.notifications.list);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    throw error;
  }
};

/**
 * Obtém a contagem de notificações não lidas
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await apiGet(API_ENDPOINTS.notifications.unreadCount);
    return response.count || 0;
  } catch (error) {
    console.error('Erro ao obter contagem de não lidas:', error);
    return 0;
  }
};

/**
 * Marca uma notificação como lida
 */
export const markAsRead = async (id: string): Promise<void> => {
  try {
    await apiPost(API_ENDPOINTS.notifications.markAsRead(id), {});
  } catch (error) {
    console.error('Erro ao marcar como lida:', error);
    throw error;
  }
};

/**
 * Marca todas as notificações como lidas
 */
export const markAllAsRead = async (): Promise<void> => {
  try {
    await apiPost(API_ENDPOINTS.notifications.markAllAsRead, {});
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    throw error;
  }
};

/**
 * Deleta uma notificação
 */
export const deleteNotification = async (id: string): Promise<void> => {
  try {
    await apiDelete(API_ENDPOINTS.notifications.delete(id));
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    throw error;
  }
};

/**
 * Deleta todas as notificações
 */
export const deleteAllNotifications = async (): Promise<void> => {
  try {
    await apiDelete(API_ENDPOINTS.notifications.deleteAll);
  } catch (error) {
    console.error('Erro ao deletar todas as notificações:', error);
    throw error;
  }
};
