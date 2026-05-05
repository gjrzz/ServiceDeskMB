/**
 * Serviço de Base de Conhecimento (KB)
 * Gerencia artigos da base de conhecimento
 */

import { API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '../config/api';

export interface Article {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
  autorId: string;
  autor?: {
    id: string;
    nome: string;
    email: string;
  };
  editorId?: string;
  editor?: {
    id: string;
    nome: string;
    email: string;
  };
  visualizacoes: number;
  util: number;
  naoUtil: number;
  publicado: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateArticleData {
  titulo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
  publicado?: boolean;
}

export interface UpdateArticleData {
  titulo?: string;
  conteudo?: string;
  categoria?: string;
  tags?: string[];
  publicado?: boolean;
}

/**
 * Lista todos os artigos
 */
export const listArticles = async (publicadosApenas: boolean = false): Promise<Article[]> => {
  try {
    let url = API_ENDPOINTS.kb.list;
    if (publicadosApenas) {
      url += '?publicado=true';
    }
    
    const response = await apiGet(url);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Erro ao listar artigos:', error);
    throw error;
  }
};

/**
 * Obtém um artigo por ID
 */
export const getArticle = async (id: string): Promise<Article | null> => {
  try {
    const response = await apiGet(API_ENDPOINTS.kb.get(id));
    return response;
  } catch (error) {
    console.error('Erro ao obter artigo:', error);
    return null;
  }
};

/**
 * Cria um novo artigo
 */
export const createArticle = async (data: CreateArticleData): Promise<Article> => {
  try {
    const response = await apiPost(API_ENDPOINTS.kb.create, data);
    return response;
  } catch (error) {
    console.error('Erro ao criar artigo:', error);
    throw error;
  }
};

/**
 * Atualiza um artigo
 */
export const updateArticle = async (id: string, data: UpdateArticleData): Promise<Article> => {
  try {
    const response = await apiPut(API_ENDPOINTS.kb.update(id), data);
    return response;
  } catch (error) {
    console.error('Erro ao atualizar artigo:', error);
    throw error;
  }
};

/**
 * Deleta um artigo
 */
export const deleteArticle = async (id: string): Promise<void> => {
  try {
    await apiDelete(API_ENDPOINTS.kb.delete(id));
  } catch (error) {
    console.error('Erro ao deletar artigo:', error);
    throw error;
  }
};

/**
 * Publica ou despublica um artigo
 */
export const togglePublishArticle = async (id: string): Promise<Article> => {
  try {
    const response = await apiPost(API_ENDPOINTS.kb.publish(id), {});
    return response;
  } catch (error) {
    console.error('Erro ao publicar/despublicar artigo:', error);
    throw error;
  }
};

/**
 * Registra uma visualização no artigo
 */
export const viewArticle = async (id: string): Promise<void> => {
  try {
    await apiPost(API_ENDPOINTS.kb.view(id), {});
  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
    // Não lançar erro, pois é uma operação secundária
  }
};

/**
 * Vota em um artigo (útil ou não útil)
 */
export const voteArticle = async (id: string, util: boolean): Promise<Article> => {
  try {
    const response = await apiPost(API_ENDPOINTS.kb.vote(id), { util });
    return response;
  } catch (error) {
    console.error('Erro ao votar no artigo:', error);
    throw error;
  }
};

/**
 * Busca artigos por termo
 */
export const searchArticles = async (termo: string): Promise<Article[]> => {
  try {
    // A rota de busca pode não existir, usar listagem e filtrar localmente
    const response = await apiGet(API_ENDPOINTS.kb.list);
    const articles = Array.isArray(response) ? response : [];
    
    // Filtrar localmente
    return articles.filter((article: Article) => 
      article.titulo.toLowerCase().includes(termo.toLowerCase()) ||
      article.conteudo.toLowerCase().includes(termo.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(termo.toLowerCase()))
    );
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    throw error;
  }
};
