/**
 * Serviço de Upload
 * Gerencia upload de arquivos e imagens
 */

import { API_ENDPOINTS, apiUpload } from '../config/api';

export interface UploadResponse {
  nomeOriginal: string;
  nomeArquivo: string;
  tamanho: number;
  mimeType: string;
  url: string;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
}

/**
 * Faz upload de um arquivo
 */
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiUpload(API_ENDPOINTS.upload.file, formData);
    return response;
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
};

/**
 * Faz upload de avatar (base64)
 */
export const uploadAvatar = async (base64: string): Promise<AvatarUploadResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS.upload.avatar, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ base64 }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Erro ao fazer upload de avatar:', error);
    throw error;
  }
};

/**
 * Converte File para base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Redimensiona imagem mantendo proporção
 */
export const resizeImage = (
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular novas dimensões mantendo proporção
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL(file.type));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * Valida se o arquivo é uma imagem
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Valida tamanho do arquivo
 */
export const validateFileSize = (file: File, maxSizeMB: number = 2): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Upload de avatar com redimensionamento automático
 */
export const uploadAvatarWithResize = async (file: File): Promise<string> => {
  try {
    // Validar se é imagem
    if (!isImageFile(file)) {
      throw new Error('O arquivo deve ser uma imagem');
    }

    // Validar tamanho (antes do redimensionamento)
    if (!validateFileSize(file, 10)) {
      throw new Error('Imagem muito grande (máximo 10MB)');
    }

    // Redimensionar imagem
    const resizedBase64 = await resizeImage(file, 400, 400);

    // Fazer upload
    const response = await uploadAvatar(resizedBase64);

    // Retornar URL completa
    return response.avatarUrl;
  } catch (error) {
    console.error('Erro ao fazer upload de avatar:', error);
    throw error;
  }
};
