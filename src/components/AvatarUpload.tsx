/**
 * Componente de Upload de Avatar
 * Permite selecionar e fazer upload de foto de perfil
 */

import React, { useState, useRef } from 'react';
import { uploadAvatarWithResize } from '../services/upload.service';
import { API_URL } from '../config/api';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  currentAvatar: string; // Iniciais
  onUploadSuccess: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  currentAvatar,
  onUploadSuccess,
  onUploadError,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Por favor, selecione uma imagem');
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError?.('Imagem muito grande (máximo 10MB)');
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    setUploading(true);
    try {
      const avatarUrl = await uploadAvatarWithResize(file);
      onUploadSuccess(avatarUrl);
      setPreview(null);
    } catch (error: any) {
      onUploadError?.(error.message || 'Erro ao fazer upload');
      setPreview(null);
    } finally {
      setUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getAvatarDisplay = () => {
    if (preview) {
      return <img src={preview} alt="Preview" className="w-full h-full object-cover" />;
    }
    
    if (currentAvatarUrl) {
      const fullUrl = currentAvatarUrl.startsWith('http') 
        ? currentAvatarUrl 
        : `${API_URL}${currentAvatarUrl}`;
      
      // Adicionar timestamp para evitar cache do navegador
      const urlWithCacheBuster = `${fullUrl}?t=${Date.now()}`;
      
      console.log('🖼️ Carregando avatar:', urlWithCacheBuster);
      
      return (
        <img
          src={urlWithCacheBuster}
          alt="Avatar"
          className="w-full h-full object-cover"
          onLoad={() => console.log('✅ Avatar carregado com sucesso')}
          onError={(e) => {
            console.error('❌ Erro ao carregar avatar:', fullUrl);
            // Fallback para iniciais se a imagem não carregar
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `
              <div class="w-full h-full flex items-center justify-center bg-accent-primary/20 text-accent-primary font-semibold text-2xl">
                ${currentAvatar}
              </div>
            `;
          }}
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-accent-primary/20 text-accent-primary font-semibold text-2xl">
        {currentAvatar}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-border-subtle">
          {getAvatarDisplay()}
        </div>

        {/* Overlay de hover */}
        <div
          onClick={handleClick}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
        >
          <span className="text-white text-sm font-medium">
            {uploading ? 'Enviando...' : 'Alterar foto'}
          </span>
        </div>

        {/* Loading spinner */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Botão de upload */}
      <button
        onClick={handleClick}
        disabled={uploading}
        className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 disabled:bg-gray-600 text-white rounded transition-colors text-sm"
      >
        {uploading ? 'Enviando...' : 'Escolher foto'}
      </button>

      {/* Informações */}
      <p className="text-xs text-text-muted text-center max-w-xs">
        Formatos aceitos: JPG, PNG, GIF<br />
        Tamanho máximo: 10MB<br />
        A imagem será redimensionada automaticamente
      </p>
    </div>
  );
};
