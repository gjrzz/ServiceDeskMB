import React from 'react';

const KBArticle: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Artigo da Base de Conhecimento</h1>
        <p className="text-text-muted mt-1">Solução detalhada para um problema específico</p>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">📄</div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Em desenvolvimento</h2>
        <p className="text-text-muted">Esta funcionalidade estará disponível em breve.</p>
      </div>
    </div>
  );
};

export default KBArticle;