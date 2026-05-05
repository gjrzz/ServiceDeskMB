/**
 * ConfigProvider - Gerencia configurações do sistema
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getConfiguracoes, svgToDataUrl, type ConfiguracoesSistema } from '../services/config.service';

interface ConfigContextType {
  configuracoes: ConfiguracoesSistema;
  logoUrl: string;
  nomeEmpresa: string;
  tituloSistema: string;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within ConfigProvider');
  return context;
};

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesSistema>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfiguracoes = async () => {
      try {
        const configs = await getConfiguracoes();
        setConfiguracoes(configs);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        // Usar valores padrão em caso de erro
        setConfiguracoes({});
      } finally {
        setLoading(false);
      }
    };

    loadConfiguracoes();
  }, []);

  // Valores derivados com fallbacks
  const logoUrl = configuracoes.logo_empresa?.valor 
    ? svgToDataUrl(configuracoes.logo_empresa.valor)
    : '/logo-mb.svg'; // Fallback para o arquivo local

  const nomeEmpresa = configuracoes.nome_empresa?.valor || 'Monte Bravo';
  const tituloSistema = configuracoes.titulo_sistema?.valor || 'Central de Atendimento Monte Bravo';

  return (
    <ConfigContext.Provider
      value={{
        configuracoes,
        logoUrl,
        nomeEmpresa,
        tituloSistema,
        loading,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
