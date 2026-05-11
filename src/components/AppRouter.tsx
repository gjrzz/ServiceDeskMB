import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Lazy load das páginas principais
const Dashboard = lazy(() => import('../pages/Dashboard'));
const TicketList = lazy(() => import('../pages/TicketList'));
const NewTicket = lazy(() => import('../pages/NewTicket'));
const TicketDetail = lazy(() => import('../pages/TicketDetail'));
const KBList = lazy(() => import('../pages/KBList'));
const KBArticle = lazy(() => import('../pages/KBArticle'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const Reports = lazy(() => import('../pages/Reports'));
const Settings = lazy(() => import('../pages/Settings'));
const Profile = lazy(() => import('../pages/Profile'));

// Componente de loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Componente de roteamento principal
export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Redirecionamento padrão */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Chamados */}
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/new" element={<NewTicket />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />

          {/* Base de Conhecimento */}
          <Route path="/kb" element={<KBList />} />
          <Route path="/kb/:id" element={<KBArticle />} />

          {/* Gestão de Usuários (Admin) */}
          <Route path="/users" element={<UserManagement />} />

          {/* Relatórios */}
          <Route path="/reports" element={<Reports />} />

          {/* Configurações */}
          <Route path="/settings" element={<Settings />} />

          {/* Perfil */}
          <Route path="/profile" element={<Profile />} />

          {/* Fallback para 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};