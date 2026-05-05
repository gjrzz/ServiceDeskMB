/**
 * Serviço de Usuários
 * Gerencia operações CRUD de usuários
 */

import { API_ENDPOINTS, apiGet, apiPost, apiPatch, apiDelete } from '../config/api';
import { Usuario } from './auth.service';

export interface CreateUserData {
  nome: string;
  email: string;
  senha: string;
  departamento: string;
  perfil: 'ADMIN' | 'USUARIO' | 'MANAGER';
}

export interface UpdateUserData {
  nome?: string;
  email?: string;
  departamento?: string;
  perfil?: 'ADMIN' | 'USUARIO' | 'MANAGER';
  ativo?: boolean;
  avatarUrl?: string;
}

/**
 * Lista todos os usuários
 */
export const listUsers = async (): Promise<Usuario[]> => {
  try {
    const response = await apiGet(API_ENDPOINTS.users.list);
    // Backend retorna array diretamente
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
};

/**
 * Obtém um usuário por ID
 */
export const getUser = async (id: string): Promise<Usuario | null> => {
  try {
    const response = await apiGet(API_ENDPOINTS.users.get(id));
    return response; // Backend retorna usuário diretamente
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
};

/**
 * Cria um novo usuário
 */
export const createUser = async (data: CreateUserData): Promise<Usuario> => {
  try {
    const response = await apiPost(API_ENDPOINTS.users.create, data);
    return response; // Backend retorna usuário diretamente
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

/**
 * Atualiza um usuário
 */
export const updateUser = async (id: string, data: UpdateUserData): Promise<Usuario> => {
  try {
    const response = await apiPatch(API_ENDPOINTS.users.update(id), data);
    return response; // Backend retorna usuário diretamente
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

/**
 * Deleta um usuário
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await apiDelete(API_ENDPOINTS.users.delete(id));
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
};

/**
 * Alterna o status ativo/inativo de um usuário
 */
export const toggleUserStatus = async (id: string): Promise<Usuario> => {
  try {
    const response = await apiPost(API_ENDPOINTS.users.toggleStatus(id), {});
    return response; // Backend retorna usuário diretamente
  } catch (error) {
    console.error('Erro ao alternar status do usuário:', error);
    throw error;
  }
};

/**
 * Reseta a senha de um usuário
 */
export const resetUserPassword = async (id: string, novaSenha: string): Promise<void> => {
  try {
    await apiPost(API_ENDPOINTS.users.resetPassword(id), { novaSenha });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    throw error;
  }
};
