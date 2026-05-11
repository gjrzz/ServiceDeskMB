import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MessageSquare,
  Paperclip,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  MoreHorizontal
} from 'lucide-react';

// Tipos
type Priority = "Baixo" | "Médio" | "Alto" | "Crítico";
type Status = "Aberto" | "Em Andamento" | "Aguardando Aprovação" | "Aguardando" | "Resolvido" | "Fechado" | "Contestado";

interface Comment {
  id: string;
  autor: {
    nome: string;
    avatar: string;
    tipo: 'solicitante' | 'tecnico' | 'admin';
  };
  conteudo: string;
  criadoEm: string;
  anexos?: Array<{
    nome: string;
    url: string;
    tamanho: string;
  }>;
}

interface Ticket {
  id: string;
  titulo: string;
  status: Status;
  prioridade: Priority;
  categoria: string;
  descricao: string;
  solicitante: {
    nome: string;
    email: string;
    avatar: string;
    departamento: string;
  };
  responsavel?: {
    nome: string;
    email: string;
  };
  criadoEm: string;
  atualizadoEm: string;
  slaVencimento?: string;
  comentarios: Comment[];
  anexos: Array<{
    nome: string;
    url: string;
    tamanho: string;
    tipo: string;
  }>;
}

// Dados mockados
const mockTicket: Ticket = {
  id: "TKT-0001",
  titulo: "Problema com impressora não conecta",
  status: "Em Andamento",
  prioridade: "Médio",
  categoria: "Hardware",
  descricao: "A impressora HP LaserJet no departamento de vendas não está conectando à rede. Já tentei reiniciar o dispositivo e verificar os cabos, mas o problema persiste. Os colegas estão sem conseguir imprimir documentos importantes.",
  solicitante: {
    nome: "João Silva",
    email: "joao.silva@empresa.com",
    avatar: "JS",
    departamento: "Vendas"
  },
  responsavel: {
    nome: "Carlos Admin",
    email: "carlos.admin@empresa.com"
  },
  criadoEm: "2024-01-15T10:30:00Z",
  atualizadoEm: "2024-01-15T14:45:00Z",
  slaVencimento: "2024-01-16T10:30:00Z",
  comentarios: [
    {
      id: "1",
      autor: { nome: "João Silva", avatar: "JS", tipo: "solicitante" },
      conteudo: "O problema começou hoje de manhã. Já verifiquei se há papel suficiente e toner.",
      criadoEm: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      autor: { nome: "Carlos Admin", avatar: "CA", tipo: "tecnico" },
      conteudo: "Vou verificar a conectividade de rede da impressora. Pode ser um problema de IP ou configuração.",
      criadoEm: "2024-01-15T11:15:00Z"
    },
    {
      id: "3",
      autor: { nome: "Carlos Admin", avatar: "CA", tipo: "tecnico" },
      conteudo: "Identifiquei que a impressora perdeu a configuração de rede. Estou reconfigurando o IP estático.",
      criadoEm: "2024-01-15T14:45:00Z"
    }
  ],
  anexos: [
    {
      nome: "erro_impressora.png",
      url: "#",
      tamanho: "2.3 MB",
      tipo: "image/png"
    }
  ]
};

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTicket(mockTicket);
      setLoading(false);
    };

    loadTicket();
  }, [id]);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Aberto': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Aguardando': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Resolvido': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Fechado': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Crítico': return 'text-red-600';
      case 'Alto': return 'text-orange-600';
      case 'Médio': return 'text-yellow-600';
      case 'Baixo': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'Aberto': return <AlertCircle className="w-4 h-4" />;
      case 'Em Andamento': return <Clock className="w-4 h-4" />;
      case 'Resolvido': return <CheckCircle className="w-4 h-4" />;
      case 'Fechado': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      // Simular envio do comentário
      await new Promise(resolve => setTimeout(resolve, 1000));

      const comment: Comment = {
        id: Date.now().toString(),
        autor: { nome: "Você", avatar: "VC", tipo: "tecnico" },
        conteudo: newComment,
        criadoEm: new Date().toISOString()
      };

      setTicket(prev => prev ? {
        ...prev,
        comentarios: [...prev.comentarios, comment],
        atualizadoEm: new Date().toISOString()
      } : null);

      setNewComment('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-8 rounded"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-48 rounded"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Chamado não encontrado</h2>
        <p className="text-text-muted mb-6">O chamado que você está procurando não existe ou foi removido.</p>
        <button
          onClick={() => navigate('/tickets')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Voltar para Chamados
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tickets')}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{ticket.titulo}</h1>
            <p className="text-text-muted">Chamado #{ticket.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
            {getStatusIcon(ticket.status)}
            <span className="ml-2">{ticket.status}</span>
          </span>
          <button className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descrição */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-surface border border-border-subtle rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Descrição</h2>
            <p className="text-text-primary whitespace-pre-wrap">{ticket.descricao}</p>

            {/* Anexos */}
            {ticket.anexos.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-text-primary mb-3">Anexos</h3>
                <div className="space-y-2">
                  {ticket.anexos.map((anexo, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                      <Paperclip className="w-4 h-4 text-text-muted" />
                      <div className="flex-1">
                        <a
                          href={anexo.url}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          {anexo.nome}
                        </a>
                        <p className="text-xs text-text-muted">{anexo.tamanho}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Comentários */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bg-surface border border-border-subtle rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">
                Comentários ({ticket.comentarios.length})
              </h2>
            </div>

            <div className="space-y-6">
              {ticket.comentarios.map((comentario) => (
                <div key={comentario.id} className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">
                      {comentario.autor.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-text-primary">
                        {comentario.autor.nome}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        comentario.autor.tipo === 'tecnico'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {comentario.autor.tipo === 'tecnico' ? 'Técnico' : 'Solicitante'}
                      </span>
                      <span className="text-xs text-text-muted">
                        {new Date(comentario.criadoEm).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-text-primary whitespace-pre-wrap">
                      {comentario.conteudo}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Novo comentário */}
            <form onSubmit={handleCommentSubmit} className="mt-6 pt-6 border-t border-border-subtle">
              <div className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {submittingComment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Comentar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do chamado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-bg-surface border border-border-subtle rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Informações</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-muted">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1">{ticket.status}</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted">Prioridade</label>
                <p className={`mt-1 font-medium ${getPriorityColor(ticket.prioridade)}`}>
                  {ticket.prioridade}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted">Categoria</label>
                <p className="mt-1 text-text-primary">{ticket.categoria}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted">Criado em</label>
                <p className="mt-1 text-text-primary">
                  {new Date(ticket.criadoEm).toLocaleString('pt-BR')}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted">Última atualização</label>
                <p className="mt-1 text-text-primary">
                  {new Date(ticket.atualizadoEm).toLocaleString('pt-BR')}
                </p>
              </div>

              {ticket.slaVencimento && (
                <div>
                  <label className="text-sm font-medium text-text-muted">SLA</label>
                  <p className="mt-1 text-text-primary">
                    Vence em {new Date(ticket.slaVencimento).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Solicitante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-bg-surface border border-border-subtle rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Solicitante</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary">
                  {ticket.solicitante.avatar}
                </span>
              </div>
              <div>
                <p className="font-medium text-text-primary">{ticket.solicitante.nome}</p>
                <p className="text-sm text-text-muted">{ticket.solicitante.email}</p>
              </div>
            </div>
            <div className="text-sm text-text-muted">
              <p>Departamento: {ticket.solicitante.departamento}</p>
            </div>
          </motion.div>

          {/* Responsável */}
          {ticket.responsavel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-bg-surface border border-border-subtle rounded-lg p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-4">Responsável</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{ticket.responsavel.nome}</p>
                  <p className="text-sm text-text-muted">{ticket.responsavel.email}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;