/**
 * AuthProvider - Versão com API
 * Gerencia autenticação e usuários usando o backend
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, UserService } from '../services';
import type { Usuario as ApiUsuario } from '../services';

// Tipos do frontend (compatibilidade)
type Perfil = 'admin' | 'usuario' | 'manager';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: Perfil;
  departamento: string;
  avatar: string;
  avatarUrl?: string;
  ativo: boolean;
  criadoEm: string;
}

interface LogExclusao {
  id: number;
  tipo: 'chamado' | 'artigo' | 'usuario';
  itemId: string;
  nome: string;
  excluidoPor: string;
  timestamp: string;
}

interface AuthContextType {
  usuarios: Usuario[];
  usuarioLogado: Usuario | null;
  fazerLogin: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  fazerLogout: () => void;
  criarUsuario: (dados: Omit<Usuario, 'id' | 'criadoEm' | 'avatar' | 'ativo'>) => Promise<void>;
  editarUsuario: (id: string, dados: Partial<Usuario>) => Promise<void>;
  alterarStatusUsuario: (id: string, ativo: boolean) => Promise<void>;
  redefinirSenha: (id: string, novaSenha: string) => Promise<void>;
  excluirUsuario: (id: string) => Promise<boolean>;
  logExclusoes: LogExclusao[];
  registrarExclusao: (tipo: 'chamado' | 'artigo' | 'usuario', id: string, nome: string) => void;
  limparLog: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Função para converter perfil da API para o frontend
const convertPerfil = (perfil: string): Perfil => {
  const map: Record<string, Perfil> = {
    'ADMIN': 'admin',
    'USUARIO': 'usuario',
    'MANAGER': 'manager',
  };
  return map[perfil] || 'usuario';
};

// Função para converter perfil do frontend para a API
const convertPerfilToApi = (perfil: Perfil): 'ADMIN' | 'USUARIO' | 'MANAGER' => {
  const map: Record<Perfil, 'ADMIN' | 'USUARIO' | 'MANAGER'> = {
    'admin': 'ADMIN',
    'usuario': 'USUARIO',
    'manager': 'MANAGER',
  };
  return map[perfil];
};

// Função para converter usuário da API para o frontend
const convertUsuario = (apiUser: ApiUsuario): Usuario => {
  return {
    id: apiUser.id,
    nome: apiUser.nome,
    email: apiUser.email,
    perfil: convertPerfil(apiUser.perfil),
    departamento: apiUser.departamento,
    avatar: apiUser.avatar,
    avatarUrl: apiUser.avatarUrl,
    ativo: apiUser.ativo,
    criadoEm: apiUser.criadoEm,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [logExclusoes, setLogExclusoes] = useState<LogExclusao[]>(() => {
    const saved = localStorage.getItem('mb_log');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);

  // Carregar usuário logado ao iniciar
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const user = await AuthService.getCurrentUser();
          if (user) {
            setUsuarioLogado(convertUsuario(user));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  // Carregar lista de usuários (apenas para admins)
  useEffect(() => {
    const loadUsers = async () => {
      if (usuarioLogado && usuarioLogado.perfil === 'admin') {
        try {
          const apiUsers = await UserService.listUsers();
          setUsuarios(apiUsers.map(convertUsuario));
        } catch (error) {
          console.error('Erro ao carregar usuários:', error);
        }
      }
    };

    loadUsers();
  }, [usuarioLogado]);

  const registrarExclusao = (tipo: 'chamado' | 'artigo' | 'usuario', id: string, nome: string) => {
    const entrada: LogExclusao = {
      id: Date.now(),
      tipo,
      itemId: id,
      nome,
      excluidoPor: usuarioLogado?.nome || 'Sistema',
      timestamp: new Date().toISOString()
    };
    setLogExclusoes(prev => {
      const novo = [entrada, ...prev].slice(0, 100);
      localStorage.setItem('mb_log', JSON.stringify(novo));
      return novo;
    });
  };

  const limparLog = () => {
    setLogExclusoes([]);
    localStorage.removeItem('mb_log');
  };

  const fazerLogin = async (email: string, senha: string) => {
    try {
      const result = await AuthService.login({ email, senha });
      
      if (result.success && result.user) {
        setUsuarioLogado(convertUsuario(result.user));
        return { success: true };
      }
      
      return { 
        success: false, 
        error: result.message || 'E-mail ou senha inválidos' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Erro ao fazer login' 
      };
    }
  };

  const fazerLogout = () => {
    AuthService.logout();
    setUsuarioLogado(null);
    setUsuarios([]);
  };

  const criarUsuario = async (dados: Omit<Usuario, 'id' | 'criadoEm' | 'avatar' | 'ativo'>) => {
    try {
      const apiUser = await UserService.createUser({
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha || '123456', // Senha padrão se não fornecida
        departamento: dados.departamento,
        perfil: convertPerfilToApi(dados.perfil),
      });

      const novoUsuario = convertUsuario(apiUser);
      setUsuarios(prev => [...prev, novoUsuario]);

      // TODO: Criar notificação via API
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  };

  const editarUsuario = async (id: string, dados: Partial<Usuario>) => {
    try {
      console.log('📝 Editando usuário:', id, dados);
      
      const updateData: any = {};
      
      if (dados.nome) updateData.nome = dados.nome;
      if (dados.email) updateData.email = dados.email;
      if (dados.departamento) updateData.departamento = dados.departamento;
      if (dados.perfil) updateData.perfil = convertPerfilToApi(dados.perfil);
      if (dados.avatarUrl !== undefined) updateData.avatarUrl = dados.avatarUrl;
      if (dados.ativo !== undefined) updateData.ativo = dados.ativo;

      console.log('📤 Enviando para API:', updateData);

      const apiUser = await UserService.updateUser(id, updateData);
      const usuarioAtualizado = convertUsuario(apiUser);

      console.log('✅ Usuário atualizado:', usuarioAtualizado);

      setUsuarios(prev => prev.map(u => u.id === id ? usuarioAtualizado : u));

      // Atualizar usuário logado se for ele mesmo
      if (usuarioLogado?.id === id) {
        setUsuarioLogado(usuarioAtualizado);
        console.log('✅ Usuário logado atualizado também');
      }
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
      throw error;
    }
  };

  const alterarStatusUsuario = async (id: string, ativo: boolean) => {
    try {
      await UserService.toggleUserStatus(id);
      
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo } : u));

      if (!ativo && usuarioLogado?.id === id) {
        fazerLogout();
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      throw error;
    }
  };

  const redefinirSenha = async (id: string, novaSenha: string) => {
    try {
      await UserService.resetUserPassword(id, novaSenha);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  };

  const excluirUsuario = async (id: string): Promise<boolean> => {
    try {
      const usuario = usuarios.find(u => u.id === id);
      if (!usuario) return false;

      if (id === usuarioLogado?.id) {
        // TODO: Mostrar toast
        console.error('Você não pode excluir sua própria conta');
        return false;
      }

      if (usuario.perfil === 'admin') {
        const admins = usuarios.filter(u => u.perfil === 'admin' && u.ativo && u.id !== id);
        if (admins.length === 0) {
          // TODO: Mostrar toast
          console.error('Não é possível excluir o único administrador');
          return false;
        }
      }

      await UserService.deleteUser(id);
      
      setUsuarios(prev => prev.filter(u => u.id !== id));
      registrarExclusao('usuario', id, usuario.nome);

      // TODO: Mostrar toast
      console.log(`Usuário ${usuario.nome} excluído permanentemente`);

      return true;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return false;
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        usuarios,
        usuarioLogado,
        fazerLogin,
        fazerLogout,
        criarUsuario,
        editarUsuario,
        alterarStatusUsuario,
        redefinirSenha,
        excluirUsuario,
        logExclusoes,
        registrarExclusao,
        limparLog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
