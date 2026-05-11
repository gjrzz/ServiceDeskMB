import React from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

// Dados mockados para o dashboard
const ticketData = [
  { name: 'Jan', abertos: 12, resolvidos: 8, novos: 15 },
  { name: 'Fev', abertos: 15, resolvidos: 12, novos: 18 },
  { name: 'Mar', abertos: 8, resolvidos: 15, novos: 12 },
  { name: 'Abr', abertos: 20, resolvidos: 18, novos: 22 },
  { name: 'Mai', abertos: 18, resolvidos: 20, novos: 19 },
];

const priorityData = [
  { name: 'Crítico', value: 5, color: '#EF4444' },
  { name: 'Alto', value: 12, color: '#F97316' },
  { name: 'Médio', value: 25, color: '#EAB308' },
  { name: 'Baixo', value: 18, color: '#22C55E' },
];

const slaData = [
  { name: 'Dentro SLA', value: 85, color: '#22C55E' },
  { name: 'Fora SLA', value: 15, color: '#EF4444' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted mt-1">Visão geral do Service Desk</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-muted">Última atualização</p>
          <p className="text-lg font-semibold text-text-primary">
            {new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-surface border border-border-subtle rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Chamados Abertos</p>
              <p className="text-3xl font-bold text-text-primary">24</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-surface border border-border-subtle rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Resolvidos Hoje</p>
              <p className="text-3xl font-bold text-green-600">8</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-surface border border-border-subtle rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">SLA Compliance</p>
              <p className="text-3xl font-bold text-blue-600">85%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg-surface border border-border-subtle rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Tempo Médio</p>
              <p className="text-3xl font-bold text-purple-600">2.4h</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de chamados por mês */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-surface border border-border-subtle rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Chamados por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ticketData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="novos"
                stackId="1"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
                name="Novos"
              />
              <Area
                type="monotone"
                dataKey="resolvidos"
                stackId="2"
                stroke="#22C55E"
                fill="#22C55E"
                fillOpacity={0.6}
                name="Resolvidos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico de prioridade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-bg-surface border border-border-subtle rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Distribuição por Prioridade
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* SLA Compliance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-bg-surface border border-border-subtle rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          SLA Compliance
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={slaData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {slaData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default Dashboard;