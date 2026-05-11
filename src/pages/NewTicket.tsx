import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';

const NewTicket: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    prioridade: 'Médio',
    descricao: '',
    anexos: [] as File[]
  });

  const categorias = [
    'Hardware',
    'Software',
    'Rede',
    'Acesso',
    'Impressora',
    'Email',
    'Telefone',
    'Outros'
  ];

  const prioridades = [
    { value: 'Baixo', label: 'Baixo', color: 'text-green-600' },
    { value: 'Médio', label: 'Médio', color: 'text-yellow-600' },
    { value: 'Alto', label: 'Alto', color: 'text-orange-600' },
    { value: 'Crítico', label: 'Crítico', color: 'text-red-600' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      anexos: [...prev.anexos, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      anexos: prev.anexos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular criação do ticket
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular sucesso
      navigate('/tickets', {
        state: {
          message: 'Chamado criado com sucesso!',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tickets')}
          className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Novo Chamado</h1>
          <p className="text-text-muted mt-1">Crie um novo chamado para suporte</p>
        </div>
      </div>

      {/* Formulário */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-bg-surface border border-border-subtle rounded-lg p-6 space-y-6"
      >
        {/* Título */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-text-primary mb-2">
            Título do Chamado *
          </label>
          <input
            type="text"
            id="titulo"
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            placeholder="Descreva brevemente o problema..."
            className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* Categoria e Prioridade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-text-primary mb-2">
              Categoria *
            </label>
            <select
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleInputChange('categoria', e.target.value)}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="prioridade" className="block text-sm font-medium text-text-primary mb-2">
              Prioridade
            </label>
            <select
              id="prioridade"
              value={formData.prioridade}
              onChange={(e) => handleInputChange('prioridade', e.target.value)}
              className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {prioridades.map(prioridade => (
                <option key={prioridade.value} value={prioridade.value}>
                  {prioridade.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-text-primary mb-2">
            Descrição Detalhada *
          </label>
          <textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            placeholder="Descreva o problema em detalhes, incluindo passos para reproduzir, impacto no trabalho, etc."
            rows={6}
            className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary resize-vertical"
            required
          />
        </div>

        {/* Anexos */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Anexos (opcional)
          </label>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border-subtle rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-text-muted" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-primary hover:text-primary/80">
                      Clique para fazer upload
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-text-muted">
                    ou arraste e solte arquivos aqui
                  </p>
                  <p className="text-xs text-text-muted">
                    PNG, JPG, PDF até 10MB cada
                  </p>
                </div>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Lista de anexos */}
            {formData.anexos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text-primary">Arquivos anexados:</h4>
                {formData.anexos.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-bg-hover rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {file.name.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{file.name}</p>
                        <p className="text-xs text-text-muted">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="px-4 py-2 text-text-muted hover:text-text-primary border border-border-subtle rounded-lg hover:bg-bg-hover transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !formData.titulo || !formData.categoria || !formData.descricao}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                Criando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Criar Chamado
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default NewTicket;