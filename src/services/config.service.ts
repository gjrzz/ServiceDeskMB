/**
 * Serviço de Configurações do Sistema
 */

import { API_ENDPOINTS, apiGet } from '../config/api';

export interface Configuracao {
  valor: string;
  tipo: 'texto' | 'svg' | 'json' | 'numero' | 'booleano';
}

export interface ConfiguracoesSistema {
  logo_empresa?: Configuracao;
  nome_empresa?: Configuracao;
  titulo_sistema?: Configuracao;
  [key: string]: Configuracao | undefined;
}

/**
 * Buscar todas as configurações do sistema
 */
export const getConfiguracoes = async (): Promise<ConfiguracoesSistema> => {
  try {
    const response = await apiGet(`${API_ENDPOINTS.health.replace('/health', '')}/config`, false);
    return response;
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    throw error;
  }
};

/**
 * Buscar uma configuração específica
 */
export const getConfiguracao = async (chave: string): Promise<Configuracao> => {
  try {
    const response = await apiGet(`${API_ENDPOINTS.health.replace('/health', '')}/config/${chave}`, false);
    return response;
  } catch (error) {
    console.error(`Erro ao buscar configuração ${chave}:`, error);
    throw error;
  }
};

/**
 * Converter SVG para Data URL
 */
export const svgToDataUrl = (svg: string): string => {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
