import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// Tipos
type Priority = "Baixo" | "Médio" | "Alto" | "Crítico";
type Status = "Aberto" | "Em Andamento" | "Aguardando Aprovação" | "Aguardando" | "Resolvido" | "Fechado" | "Contestado";

interface Ticket {
  id: string;
  titulo: string;
  status: Status;
  prioridade: Priority;
  categoria: string;
  solicitante: {
    nome: string;
    avatar: string;
  };
  responsavel?: {
    nome: string;
  };
  criadoEm: string;
  slaVencimento?: string;
}

// Dados mockados
const mockTickets: Ticket[] = [
  {
    id: "TKT-0001",
    titulo: "Problema com impressora não conecta",
    status: "Aberto",
    prioridade: "Médio",
    categoria: "Hardware",
    solicitante: { nome: "João Silva", avatar: "JS" },
    criadoEm: "2024-01-15T10:30:00Z",
    slaVencimento: "2024-01-16T10:30:00Z"
  },
  {
    id: "TKT-0002",
    titulo: "Sistema lento no departamento financeiro",
    status: "Em Andamento",
    prioridade: "Alto",
    categoria: "Software",
    solicitante: { nome: "Maria Santos", avatar: "MS" },
    responsavel: { nome: "Carlos Admin" },
    criadoEm: "2024-01-14T14:20:00Z",
    slaVencimento: "2024-01-15T14:20:00Z"
  },
  {
    id: "TKT-0003",
    titulo: "Solicitação de acesso ao SharePoint",
    status: "Resolvido",
    prioridade: "Baixo",
    categoria: "Acesso",
    solicitante: { nome: "Pedro Costa", avatar: "PC" },
    responsavel: { nome: "Ana Manager" },
    criadoEm: "2024-01-13T09:15:00Z"
  }
];

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');

  useEffect(() => {
    // Simular carregamento
    const loadTickets = async () => {
      setLoading(true);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTickets(mockTickets);
      setLoading(false);
    };

    loadTickets();
  }, []);

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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.solicitante.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'todos' || ticket.prioridade === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Chamados</h1>
            <p className="text-text-muted mt-1">Gerencie todos os chamados do sistema</p>
          </div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-32 rounded"></div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg">
          <div className="p-6 border-b border-border-subtle">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="flex space-x-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border-subtle">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Chamados</h1>
          <p className="text-text-muted mt-1">Gerencie todos os chamados do sistema</p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Novo Chamado
        </Link>
      </div>

      {/* Filtros e busca */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar chamados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border-subtle rounded-lg bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todos">Todos os status</option>
              <option value="Aberto">Aberto</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Resolvido">Resolvido</option>
              <option value="Fechado">Fechado</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-border-subtle rounded-lg bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todos">Todas as prioridades</option>
              <option value="Crítico">Crítico</option>
              <option value="Alto">Alto</option>
              <option value="Médio">Médio</option>
              <option value="Baixo">Baixo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de chamados */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="divide-y divide-border-subtle">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Nenhum chamado encontrado
              </h3>
              <p className="text-text-muted">
                {searchTerm || statusFilter !== 'todos' || priorityFilter !== 'todos'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro chamado'
                }
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-lg font-semibold text-text-primary hover:text-primary transition-colors"
                      >
                        {ticket.titulo}
                      </Link>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                          {ticket.solicitante.avatar}
                        </div>
                        <span>{ticket.solicitante.nome}</span>
                      </div>

                      {ticket.responsavel && (
                        <div className="flex items-center gap-2">
                          <span>→</span>
                          <span>{ticket.responsavel.nome}</span>
                        </div>
                      )}

                      <span>{ticket.categoria}</span>

                      <span className={`font-medium ${getPriorityColor(ticket.prioridade)}`}>
                        {ticket.prioridade}
                      </span>

                      <span>
                        {new Date(ticket.criadoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
                      title="Mais ações"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Paginação */}
      {filteredTickets.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Mostrando {filteredTickets.length} de {tickets.length} chamados
          </p>
          <div className="flex gap-2">
            <button
              disabled
              className="px-3 py-1 text-sm border border-border-subtle rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded">
              1
            </button>
            <button
              disabled
              className="px-3 py-1 text-sm border border-border-subtle rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;