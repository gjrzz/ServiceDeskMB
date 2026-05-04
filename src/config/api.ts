/**
 * Configuração da API
 * 
 * Atualize a URL do Railway após fazer o deploy:
 * 1. Faça deploy no Railway
 * 2. Vá em Settings > Networking > Generate Domain
 * 3. Copie a URL gerada (ex: https://servicedesk-backend-production-xxxx.up.railway.app)
 * 4. Cole abaixo em RAILWAY_API_URL
 */

// ========================================
// 🔧 CONFIGURAÇÃO - ATUALIZE AQUI!
// ========================================

// URL do backend no Railway
const RAILWAY_API_URL = 'https://servicedeskmb-production-97fa.up.railway.app';

// URL local para desenvolvimento
const LOCAL_API_URL = 'http://localhost:3001';

// ========================================
// 🌐 URL BASE DA API
// ========================================

// Detecta automaticamente se está em produção ou desenvolvimento
export const API_URL = (import.meta as any).env?.PROD 
  ? RAILWAY_API_URL  // Produção (GitHub Pages)
  : LOCAL_API_URL;   // Desenvolvimento (localhost)

// ========================================
// 📍 ENDPOINTS DA API
// ========================================

export const API_ENDPOINTS = {
  // Autenticação
  auth: {
    login: `${API_URL}/api/auth/login`,
    register: `${API_URL}/api/auth/register`,
    refresh: `${API_URL}/api/auth/refresh`,
    logout: `${API_URL}/api/auth/logout`,
    me: `${API_URL}/api/auth/me`,
  },

  // Usuários
  users: {
    list: `${API_URL}/api/users`,
    create: `${API_URL}/api/users`,
    get: (id: string) => `${API_URL}/api/users/${id}`,
    update: (id: string) => `${API_URL}/api/users/${id}`,
    delete: (id: string) => `${API_URL}/api/users/${id}`,
    toggleStatus: (id: string) => `${API_URL}/api/users/${id}/toggle-status`,
    resetPassword: (id: string) => `${API_URL}/api/users/${id}/reset-password`,
  },

  // Chamados (Tickets)
  tickets: {
    list: `${API_URL}/api/tickets`,
    create: `${API_URL}/api/tickets`,
    get: (id: string) => `${API_URL}/api/tickets/${id}`,
    update: (id: string) => `${API_URL}/api/tickets/${id}`,
    delete: (id: string) => `${API_URL}/api/tickets/${id}`,
    updateStatus: (id: string) => `${API_URL}/api/tickets/${id}/status`,
    updatePriority: (id: string) => `${API_URL}/api/tickets/${id}/priority`,
    assign: (id: string) => `${API_URL}/api/tickets/${id}/assign`,
    addComment: (id: string) => `${API_URL}/api/tickets/${id}/comments`,
    addActivity: (id: string) => `${API_URL}/api/tickets/${id}/activities`,
    rate: (id: string) => `${API_URL}/api/tickets/${id}/rate`,
    myTickets: `${API_URL}/api/tickets/my-tickets`,
  },

  // Base de Conhecimento (KB)
  kb: {
    list: `${API_URL}/api/kb`,
    create: `${API_URL}/api/kb`,
    get: (id: string) => `${API_URL}/api/kb/${id}`,
    update: (id: string) => `${API_URL}/api/kb/${id}`,
    delete: (id: string) => `${API_URL}/api/kb/${id}`,
    publish: (id: string) => `${API_URL}/api/kb/${id}/publish`,
    view: (id: string) => `${API_URL}/api/kb/${id}/view`,
    vote: (id: string) => `${API_URL}/api/kb/${id}/vote`,
    search: `${API_URL}/api/kb/search`,
  },

  // Notificações
  notifications: {
    list: `${API_URL}/api/notifications`,
    markAsRead: (id: string) => `${API_URL}/api/notifications/${id}/read`,
    markAllAsRead: `${API_URL}/api/notifications/read-all`,
    delete: (id: string) => `${API_URL}/api/notifications/${id}`,
    deleteAll: `${API_URL}/api/notifications/delete-all`,
    unreadCount: `${API_URL}/api/notifications/unread-count`,
  },

  // Upload de arquivos
  upload: {
    file: `${API_URL}/api/upload`,
    image: `${API_URL}/api/upload/image`,
    avatar: `${API_URL}/api/upload/avatar`,
  },

  // Health check
  health: `${API_URL}/api/health`,
};

// ========================================
// 🔑 CONFIGURAÇÃO DE HEADERS
// ========================================

/**
 * Retorna os headers padrão para requisições
 * Inclui token de autenticação se disponível
 */
export const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Headers para upload de arquivos (multipart/form-data)
 */
export const getUploadHeaders = (): HeadersInit => {
  const headers: HeadersInit = {};
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Não definir Content-Type para multipart/form-data
  // O browser define automaticamente com o boundary correto
  return headers;
};

// ========================================
// 🛠️ FUNÇÕES AUXILIARES
// ========================================

/**
 * Verifica se a API está acessível
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.health);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Trata erros de requisição
 */
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Erro ao comunicar com o servidor';
};

/**
 * Faz requisição GET
 */
export const apiGet = async (url: string, includeAuth = true) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(includeAuth),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Faz requisição POST
 */
export const apiPost = async (url: string, data: any, includeAuth = true) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(includeAuth),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Faz requisição PUT
 */
export const apiPut = async (url: string, data: any, includeAuth = true) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(includeAuth),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Faz requisição DELETE
 */
export const apiDelete = async (url: string, includeAuth = true) => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(includeAuth),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Faz upload de arquivo
 */
export const apiUpload = async (url: string, formData: FormData) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: getUploadHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ========================================
// 📊 INFORMAÇÕES DE DEBUG
// ========================================

// Log da configuração (apenas em desenvolvimento)
if ((import.meta as any).env?.DEV) {
  console.log('🔧 API Configuration:');
  console.log('  Environment:', (import.meta as any).env?.MODE);
  console.log('  API URL:', API_URL);
  console.log('  Production:', (import.meta as any).env?.PROD);
}

// ========================================
// 📝 INSTRUÇÕES DE USO
// ========================================

/**
 * COMO USAR:
 * 
 * 1. Importe onde precisar:
 *    import { API_ENDPOINTS, apiPost, apiGet } from '@/config/api';
 * 
 * 2. Faça requisições:
 *    const response = await apiPost(API_ENDPOINTS.auth.login, { email, senha });
 * 
 * 3. Use os endpoints:
 *    const ticket = await apiGet(API_ENDPOINTS.tickets.get('TKT-001'));
 * 
 * 4. Upload de arquivos:
 *    const formData = new FormData();
 *    formData.append('file', file);
 *    const result = await apiUpload(API_ENDPOINTS.upload.file, formData);
 */

export default {
  API_URL,
  API_ENDPOINTS,
  getHeaders,
  getUploadHeaders,
  checkApiHealth,
  handleApiError,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiUpload,
};
