/**
 * 📚 EXEMPLOS DE USO DA API
 * 
 * Este arquivo mostra como usar o api.ts no seu código
 */

import { API_ENDPOINTS, apiPost, apiGet, apiPut, apiDelete, apiUpload } from './api';

// ========================================
// 🔐 AUTENTICAÇÃO
// ========================================

// Login
export const login = async (email: string, senha: string) => {
  try {
    const response = await apiPost(API_ENDPOINTS.auth.login, { email, senha }, false);
    
    // Salvar token
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await apiPost(API_ENDPOINTS.auth.logout, {});
    
    // Limpar tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Erro no logout:', error);
  }
};

// Obter usuário atual
export const getCurrentUser = async () => {
  try {
    return await apiGet(API_ENDPOINTS.auth.me);
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    throw error;
  }
};

// ========================================
// 🎫 CHAMADOS (TICKETS)
// ========================================

// Listar todos os chamados
export const listTickets = async () => {
  try {
    return await apiGet(API_ENDPOINTS.tickets.list);
  } catch (error) {
    console.error('Erro ao listar chamados:', error);
    throw error;
  }
};

// Criar chamado
export const createTicket = async (data: {
  title: string;
  description: string;
  priority: string;
  category: string;
}) => {
  try {
    return await apiPost(API_ENDPOINTS.tickets.create, data);
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    throw error;
  }
};

// Obter chamado específico
export const getTicket = async (id: string) => {
  try {
    return await apiGet(API_ENDPOINTS.tickets.get(id));
  } catch (error) {
    console.error('Erro ao obter chamado:', error);
    throw error;
  }
};

// Atualizar status do chamado
export const updateTicketStatus = async (id: string, status: string) => {
  try {
    return await apiPut(API_ENDPOINTS.tickets.updateStatus(id), { status });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
};

// Adicionar comentário
export const addComment = async (id: string, texto: string, interno: boolean = false) => {
  try {
    return await apiPost(API_ENDPOINTS.tickets.addComment(id), { texto, interno });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw error;
  }
};

// Avaliar chamado
export const rateTicket = async (id: string, nota: number, resolvido: boolean, comentario?: string) => {
  try {
    return await apiPost(API_ENDPOINTS.tickets.rate(id), { nota, resolvido, comentario });
  } catch (error) {
    console.error('Erro ao avaliar chamado:', error);
    throw error;
  }
};

// ========================================
// 👥 USUÁRIOS
// ========================================

// Listar usuários
export const listUsers = async () => {
  try {
    return await apiGet(API_ENDPOINTS.users.list);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
};

// Criar usuário
export const createUser = async (data: {
  nome: string;
  email: string;
  senha: string;
  perfil: string;
  departamento: string;
}) => {
  try {
    return await apiPost(API_ENDPOINTS.users.create, data);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

// Atualizar usuário
export const updateUser = async (id: string, data: any) => {
  try {
    return await apiPut(API_ENDPOINTS.users.update(id), data);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

// Deletar usuário
export const deleteUser = async (id: string) => {
  try {
    return await apiDelete(API_ENDPOINTS.users.delete(id));
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
};

// ========================================
// 📚 BASE DE CONHECIMENTO
// ========================================

// Listar artigos
export const listArticles = async () => {
  try {
    return await apiGet(API_ENDPOINTS.kb.list);
  } catch (error) {
    console.error('Erro ao listar artigos:', error);
    throw error;
  }
};

// Criar artigo
export const createArticle = async (data: {
  titulo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
}) => {
  try {
    return await apiPost(API_ENDPOINTS.kb.create, data);
  } catch (error) {
    console.error('Erro ao criar artigo:', error);
    throw error;
  }
};

// Buscar artigos
export const searchArticles = async (query: string) => {
  try {
    return await apiGet(`${API_ENDPOINTS.kb.search}?q=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    throw error;
  }
};

// Votar em artigo
export const voteArticle = async (id: string, util: boolean) => {
  try {
    return await apiPost(API_ENDPOINTS.kb.vote(id), { util });
  } catch (error) {
    console.error('Erro ao votar em artigo:', error);
    throw error;
  }
};

// ========================================
// 🔔 NOTIFICAÇÕES
// ========================================

// Listar notificações
export const listNotifications = async () => {
  try {
    return await apiGet(API_ENDPOINTS.notifications.list);
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    throw error;
  }
};

// Marcar como lida
export const markNotificationAsRead = async (id: string) => {
  try {
    return await apiPut(API_ENDPOINTS.notifications.markAsRead(id), {});
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    throw error;
  }
};

// Marcar todas como lidas
export const markAllNotificationsAsRead = async () => {
  try {
    return await apiPut(API_ENDPOINTS.notifications.markAllAsRead, {});
  } catch (error) {
    console.error('Erro ao marcar todas notificações:', error);
    throw error;
  }
};

// ========================================
// 📎 UPLOAD DE ARQUIVOS
// ========================================

// Upload de arquivo
export const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiUpload(API_ENDPOINTS.upload.file, formData);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
};

// Upload de imagem
export const uploadImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    return await apiUpload(API_ENDPOINTS.upload.image, formData);
  } catch (error) {
    console.error('Erro ao fazer upload de imagem:', error);
    throw error;
  }
};

// Upload de avatar
export const uploadAvatar = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return await apiUpload(API_ENDPOINTS.upload.avatar, formData);
  } catch (error) {
    console.error('Erro ao fazer upload de avatar:', error);
    throw error;
  }
};

// ========================================
// 🔍 HEALTH CHECK
// ========================================

// Verificar se API está online
export const checkApiStatus = async () => {
  try {
    const response = await apiGet(API_ENDPOINTS.health, false);
    return response.status === 'ok';
  } catch (error) {
    console.error('API está offline:', error);
    return false;
  }
};
