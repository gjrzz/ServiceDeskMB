/**
 * KBProviderAPI - Versão com API
 * Gerencia artigos da base de conhecimento usando o backend
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { KBService, Article, CreateArticleData, UpdateArticleData } from '../services';

interface KBContextType {
  artigos: Article[];
  carregando: boolean;
  criarArtigo: (dados: CreateArticleData) => Promise<Article>;
  editarArtigo: (id: string, dados: UpdateArticleData) => Promise<Article>;
  deletarArtigo: (id: string) => Promise<void>;
  deletarArtigos: (ids: string[]) => Promise<void>;
  registrarVisualizacao: (id: string) => Promise<void>;
  votarArtigo: (id: string, util: boolean) => Promise<void>;
  publicarArtigo: (id: string) => Promise<void>;
  getArtigosFiltrados: (busca: string, categoria: string) => Article[];
}

const KBContext = createContext<KBContextType | undefined>(undefined);

export const useKB = () => {
  const context = useContext(KBContext);
  if (!context) throw new Error("useKB must be used within KBProviderAPI");
  return context;
};

export const KBProviderAPI = ({ children }: { children: React.ReactNode }) => {
  const { usuarioLogado } = useAuth();
  const [artigos, setArtigos] = useState<Article[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Carregar artigos da API
  const carregarArtigos = useCallback(async () => {
    if (!usuarioLogado) {
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);

      // Tentar carregar do localStorage como fallback durante migração
      const saved = localStorage.getItem('mb_artigos');
      if (saved) {
        const localArtigos = JSON.parse(saved, (key, val) =>
          ['criadoEm','atualizadoEm'].includes(key) ? new Date(val) : val
        );
        if (localArtigos.length > 0) {
          setArtigos(localArtigos);
          setCarregando(false);

          // Tentar carregar da API em background
          try {
            const artigosAPI = await KBService.listArticles();
            if (Array.isArray(artigosAPI) && artigosAPI.length > 0) {
              setArtigos(artigosAPI);
              // Limpar localStorage após migrar
              localStorage.removeItem('mb_artigos');
            }
          } catch (e) {
            // Fallback mantém dados do localStorage
            console.warn('Erro ao carregar artigos da API, mantendo localStorage:', e);
          }

          return;
        }
      }

      // Carregar da API
      const artigosAPI = await KBService.listArticles();
      if (Array.isArray(artigosAPI)) {
        setArtigos(artigosAPI);
      }
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
      // Fallback para array vazio se não conseguir carregar
      setArtigos([]);
    } finally {
      setCarregando(false);
    }
  }, [usuarioLogado]);

  // Carregar artigos quando o usuário logar
  useEffect(() => {
    carregarArtigos();
  }, [carregarArtigos]);

  const criarArtigo = async (dados: CreateArticleData): Promise<Article> => {
    try {
      const novoArtigo = await KBService.createArticle(dados);
      setArtigos(prev => [novoArtigo, ...prev]);
      return novoArtigo;
    } catch (error) {
      console.error('Erro ao criar artigo:', error);
      throw error;
    }
  };

  const editarArtigo = async (id: string, dados: UpdateArticleData): Promise<Article> => {
    try {
      const artigoAtualizado = await KBService.updateArticle(id, dados);
      setArtigos(prev => prev.map(a => a.id === id ? artigoAtualizado : a));
      return artigoAtualizado;
    } catch (error) {
      console.error('Erro ao editar artigo:', error);
      throw error;
    }
  };

  const deletarArtigo = async (id: string): Promise<void> => {
    try {
      await KBService.deleteArticle(id);
      setArtigos(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Erro ao deletar artigo:', error);
      throw error;
    }
  };

  const deletarArtigos = async (ids: string[]): Promise<void> => {
    try {
      // Deletar um por um da API
      await Promise.all(ids.map(id => KBService.deleteArticle(id)));
      setArtigos(prev => prev.filter(a => !ids.includes(a.id)));
    } catch (error) {
      console.error('Erro ao deletar artigos:', error);
      throw error;
    }
  };

  const registrarVisualizacao = async (id: string): Promise<void> => {
    try {
      await KBService.viewArticle(id);
      setArtigos(prev => prev.map(a =>
        a.id === id ? { ...a, visualizacoes: a.visualizacoes + 1 } : a
      ));
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
      // Fallback: incrementar localmente
      setArtigos(prev => prev.map(a =>
        a.id === id ? { ...a, visualizacoes: a.visualizacoes + 1 } : a
      ));
    }
  };

  const votarArtigo = async (id: string, util: boolean): Promise<void> => {
    try {
      await KBService.voteArticle(id, util);
      setArtigos(prev => prev.map(a =>
        a.id === id
          ? {
              ...a,
              util: util ? a.util + 1 : a.util,
              naoUtil: !util ? a.naoUtil + 1 : a.naoUtil
            }
          : a
      ));
    } catch (error) {
      console.error('Erro ao votar no artigo:', error);
      // Fallback: votar localmente
      setArtigos(prev => prev.map(a =>
        a.id === id
          ? {
              ...a,
              util: util ? a.util + 1 : a.util,
              naoUtil: !util ? a.naoUtil + 1 : a.naoUtil
            }
          : a
      ));
    }
  };

  const publicarArtigo = async (id: string): Promise<void> => {
    try {
      await KBService.publishArticle(id);
      setArtigos(prev => prev.map(a =>
        a.id === id ? { ...a, publicado: true } : a
      ));
    } catch (error) {
      console.error('Erro ao publicar artigo:', error);
      throw error;
    }
  };

  const getArtigosFiltrados = (busca: string, categoria: string): Article[] => {
    return artigos.filter(a => {
      const matchBusca = !busca ||
        (a.titulo || "").toLowerCase().includes((busca || "").toLowerCase()) ||
        a.tags.some(t => (t || "").toLowerCase().includes((busca || "").toLowerCase())) ||
        (a.conteudo || "").toLowerCase().includes((busca || "").toLowerCase());
      const matchCategoria = !categoria || categoria === 'todas' || a.categoria === categoria;
      return matchBusca && matchCategoria && (a.publicado || usuarioLogado?.perfil === 'admin');
    });
  };

  return (
    <KBContext.Provider value={{
      artigos,
      carregando,
      criarArtigo,
      editarArtigo,
      deletarArtigo,
      deletarArtigos,
      registrarVisualizacao,
      votarArtigo,
      publicarArtigo,
      getArtigosFiltrados
    }}>
      {children}
    </KBContext.Provider>
  );
};