/**
 * Serviço de Autenticação
 * Gerencia login, logout, registro e sessão do usuário
 */

import { API_ENDPOINTS, apiPost, apiGet } from '../config/api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'USUARIO' | 'MANAGER';
  departamento: string;
  avatar: string;
  avatarUrl?: string;
  ativo: boolean;
  criadoEm: string;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  departamento: string;
  perfil?: 'ADMIN' | 'USUARIO' | 'MANAGER';
}

export interface AuthResponse {
  success: boolean;
  user?: Usuario;
  token?: string;
  refreshToken?: string;
  message?: string;
}

/**
 * Faz login do usuário
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('🔐 Tentando login com:', credentials.email);
    console.log('📍 Endpoint:', API_ENDPOINTS.auth.login);
    
    const response = await apiPost(API_ENDPOINTS.auth.login, credentials, false);
    
    console.log('✅ Resposta do servidor:', response);
    
    // Backend retorna: usuario, accessToken, refreshToken
    if (response.accessToken) {
      // Salvar token no localStorage
      localStorage.setItem('token', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      // Salvar usuário no localStorage (para compatibilidade)
      localStorage.setItem('mb_sessao', JSON.stringify(response.usuario));
    }
    
    return {
      success: true,
      user: response.usuario,
      token: response.accessToken,
      refreshToken: response.refreshToken,
    };
  } catch (error: any) {
    console.error('❌ Erro detalhado no login:', error);
    console.error('❌ Stack:', error.stack);
    return {
      success: false,
      message: error.message || 'Erro ao fazer login',
    };
  }
};

/**
 * Faz logout do usuário
 */
export const logout = async (): Promise<void> => {
  try {
    // Tentar fazer logout no backend
    await apiPost(API_ENDPOINTS.auth.logout, {});
  } catch (error) {
    console.error('Erro ao fazer logout no backend:', error);
  } finally {
    // Limpar dados locais independente do resultado
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('mb_sessao');
  }
};

/**
 * Registra um novo usuário
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiPost(API_ENDPOINTS.auth.register, data, false);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      localStorage.setItem('mb_sessao', JSON.stringify(response.user));
    }
    
    return {
      success: true,
      user: response.user,
      token: response.token,
      refreshToken: response.refreshToken,
    };
  } catch (error: any) {
    console.error('Erro no registro:', error);
    return {
      success: false,
      message: error.message || 'Erro ao registrar usuário',
    };
  }
};

/**
 * Obtém dados do usuário logado
 */
export const getCurrentUser = async (): Promise<Usuario | null> => {
  try {
    const response = await apiGet(API_ENDPOINTS.auth.me);
    return response; // Backend retorna o usuário diretamente
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

/**
 * Verifica se há um usuário logado (verifica token)
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Obtém o token de autenticação
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Obtém o usuário da sessão local (fallback)
 */
export const getLocalUser = (): Usuario | null => {
  try {
    const sessao = localStorage.getItem('mb_sessao');
    if (sessao) {
      return JSON.parse(sessao);
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter usuário local:', error);
    return null;
  }
};

/**
 * Atualiza o refresh token
 */
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }
    
    const response = await apiPost(API_ENDPOINTS.auth.refresh, { refreshToken }, false);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return false;
  }
};
