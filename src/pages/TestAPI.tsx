/**
 * Página de Teste da API
 * Use esta página para testar todos os serviços antes de integrar no código principal
 */

import React, { useState } from 'react';
import { AuthService, UserService, TicketService, KBService, NotificationService } from '../services';
import type { Usuario } from '../services';
import { API_URL } from '../config/api';

export const TestAPI = () => {
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  const log = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
    setOutput(prev => prev + '\n' + logMessage);
    console.log(message, data);
  };

  const logError = (message: string, error: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.error('Erro detalhado:', error);
    
    let errorDetails = '';
    if (error.response) {
      errorDetails = `Status: ${error.response.status}\nData: ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      errorDetails = error.message;
    } else {
      errorDetails = String(error);
    }
    
    const logMessage = `[${timestamp}] ❌ ${message}\n${errorDetails}`;
    setOutput(prev => prev + '\n' + logMessage);
  };

  const clearOutput = () => setOutput('');

  // ==================== TESTE DE CONEXÃO ====================

  const testConnection = async () => {
    setLoading(true);
    try {
      log('🔌 Testando conexão com o backend...');
      log('📍 URL: ' + API_URL + '/api/health');
      
      const response = await fetch(API_URL + '/api/health');
      const data = await response.json();
      
      log('✅ Backend está online!', data);
    } catch (error: any) {
      logError('Erro na conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== AUTENTICAÇÃO ====================

  const testLogin = async () => {
    setLoading(true);
    try {
      log('🔐 Testando login...');
      log('📍 URL da API: ' + API_URL);
      
      const result = await AuthService.login({
        email: 'gabriel@montebravo.com.br',
        senha: '123456'
      });

      if (result.success && result.user) {
        setCurrentUser(result.user);
        log('✅ Login bem-sucedido!', result.user);
      } else {
        logError('Erro no login:', result.message || 'Erro desconhecido');
      }
    } catch (error: any) {
      logError('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGetCurrentUser = async () => {
    setLoading(true);
    try {
      log('👤 Buscando usuário atual...');
      const user = await AuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        log('✅ Usuário encontrado:', user);
      } else {
        log('❌ Nenhum usuário logado');
      }
    } catch (error: any) {
      logError('Erro ao buscar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    try {
      log('🚪 Fazendo logout...');
      await AuthService.logout();
      setCurrentUser(null);
      log('✅ Logout bem-sucedido!');
    } catch (error: any) {
      logError('Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== USUÁRIOS ====================

  const testListUsers = async () => {
    setLoading(true);
    try {
      log('👥 Listando usuários...');
      const users = await UserService.listUsers();
      log(`✅ ${users.length} usuários encontrados:`, users);
    } catch (error: any) {
      logError('Erro ao listar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCreateUser = async () => {
    setLoading(true);
    try {
      log('➕ Criando novo usuário...');
      const newUser = await UserService.createUser({
        nome: 'Teste Usuario',
        email: `teste${Date.now()}@montebravo.com.br`,
        senha: '123456',
        departamento: 'Teste',
        perfil: 'USUARIO'
      });
      log('✅ Usuário criado:', newUser);
    } catch (error: any) {
      logError('Erro ao criar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== TICKETS ====================

  const testListTickets = async () => {
    setLoading(true);
    try {
      log('🎫 Listando tickets...');
      const tickets = await TicketService.listTickets();
      log(`✅ ${tickets.length} tickets encontrados:`, tickets);
    } catch (error: any) {
      logError('Erro ao listar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCreateTicket = async () => {
    setLoading(true);
    try {
      log('➕ Criando novo ticket...');
      const newTicket = await TicketService.createTicket({
        titulo: 'Teste de Ticket via API',
        descricao: 'Este é um ticket de teste criado pela página de testes',
        prioridade: 'MEDIO',
        categoria: 'SOFTWARE'
      });
      log('✅ Ticket criado:', newTicket);
    } catch (error: any) {
      logError('Erro ao criar ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const testMyTickets = async () => {
    setLoading(true);
    try {
      log('📋 Listando meus tickets...');
      const tickets = await TicketService.listMyTickets();
      log(`✅ ${tickets.length} tickets encontrados:`, tickets);
    } catch (error: any) {
      logError('Erro ao listar meus tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== BASE DE CONHECIMENTO ====================

  const testListArticles = async () => {
    setLoading(true);
    try {
      log('📚 Listando artigos...');
      const articles = await KBService.listArticles();
      log(`✅ ${articles.length} artigos encontrados:`, articles);
    } catch (error: any) {
      logError('Erro ao listar artigos:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSearchArticles = async () => {
    setLoading(true);
    try {
      log('🔍 Buscando artigos com "senha"...');
      const articles = await KBService.searchArticles('senha');
      log(`✅ ${articles.length} artigos encontrados:`, articles);
    } catch (error: any) {
      logError('Erro ao buscar artigos:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== NOTIFICAÇÕES ====================

  const testListNotifications = async () => {
    setLoading(true);
    try {
      log('🔔 Listando notificações...');
      const notifications = await NotificationService.listNotifications();
      log(`✅ ${notifications.length} notificações encontradas:`, notifications);
    } catch (error: any) {
      logError('Erro ao listar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const testUnreadCount = async () => {
    setLoading(true);
    try {
      log('📊 Contando notificações não lidas...');
      const count = await NotificationService.getUnreadCount();
      log(`✅ ${count} notificações não lidas`);
    } catch (error: any) {
      logError('Erro ao contar não lidas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🧪 Teste da API</h1>
        <p className="text-gray-400 mb-8">
          Use esta página para testar todos os serviços da API
        </p>

        {/* Status do Usuário */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">👤 Status do Usuário</h2>
          {currentUser ? (
            <div className="bg-green-900/20 border border-green-700 rounded p-4">
              <p className="text-green-400 font-semibold">✅ Logado como:</p>
              <p className="text-white mt-2">{currentUser.nome}</p>
              <p className="text-gray-400 text-sm">{currentUser.email}</p>
              <p className="text-gray-400 text-sm">Perfil: {currentUser.perfil}</p>
            </div>
          ) : (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded p-4">
              <p className="text-yellow-400">⚠️ Nenhum usuário logado</p>
            </div>
          )}
        </div>

        {/* Credenciais de Teste */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🔑 Credenciais de Teste</h2>
          <div className="space-y-2 text-sm font-mono">
            <p>Admin: <span className="text-blue-400">gabriel@montebravo.com.br</span> / <span className="text-blue-400">123456</span></p>
            <p>Usuário 1: <span className="text-blue-400">ana.lima@montebravo.com.br</span> / <span className="text-blue-400">123456</span></p>
            <p>Usuário 2: <span className="text-blue-400">joao.silva@montebravo.com.br</span> / <span className="text-blue-400">123456</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Testes */}
          <div className="space-y-6">
            {/* Teste de Conexão */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">🔌 Teste de Conexão</h2>
              <div className="space-y-2">
                <button onClick={testConnection} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Testar Conexão com Backend
                </button>
                <p className="text-xs text-gray-400 mt-2">URL: {API_URL}</p>
              </div>
            </div>

            {/* Autenticação */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">🔐 Autenticação</h2>
              <div className="space-y-2">
                <button onClick={testLogin} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Login (Admin)
                </button>
                <button onClick={testGetCurrentUser} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Obter Usuário Atual
                </button>
                <button onClick={testLogout} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Logout
                </button>
              </div>
            </div>

            {/* Usuários */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">👥 Usuários</h2>
              <div className="space-y-2">
                <button onClick={testListUsers} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Listar Usuários
                </button>
                <button onClick={testCreateUser} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Criar Usuário
                </button>
              </div>
            </div>

            {/* Tickets */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">🎫 Tickets</h2>
              <div className="space-y-2">
                <button onClick={testListTickets} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Listar Todos os Tickets
                </button>
                <button onClick={testMyTickets} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Meus Tickets
                </button>
                <button onClick={testCreateTicket} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Criar Ticket
                </button>
              </div>
            </div>

            {/* Base de Conhecimento */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">📚 Base de Conhecimento</h2>
              <div className="space-y-2">
                <button onClick={testListArticles} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Listar Artigos
                </button>
                <button onClick={testSearchArticles} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Buscar "senha"
                </button>
              </div>
            </div>

            {/* Notificações */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">🔔 Notificações</h2>
              <div className="space-y-2">
                <button onClick={testListNotifications} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Listar Notificações
                </button>
                <button onClick={testUnreadCount} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded transition">
                  Contar Não Lidas
                </button>
              </div>
            </div>
          </div>

          {/* Console de Output */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">📟 Console</h2>
              <button onClick={clearOutput} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition">
                Limpar
              </button>
            </div>
            <div className="bg-black rounded p-4 h-[800px] overflow-y-auto font-mono text-sm">
              {loading && <p className="text-yellow-400 animate-pulse">⏳ Carregando...</p>}
              <pre className="whitespace-pre-wrap text-green-400">{output || '// Clique em um botão para testar...'}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
