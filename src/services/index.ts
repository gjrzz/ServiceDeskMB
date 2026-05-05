/**
 * Exportação centralizada de todos os serviços
 */

// Serviços
export * as AuthService from './auth.service';
export * as UserService from './user.service';
export * as TicketService from './ticket.service';
export * as KBService from './kb.service';
export * as NotificationService from './notification.service';
export * as UploadService from './upload.service';

// Types
export type { Usuario, LoginCredentials, RegisterData, AuthResponse } from './auth.service';
export type { CreateUserData, UpdateUserData } from './user.service';
export type { 
  Ticket, 
  CreateTicketData, 
  UpdateTicketData, 
  TicketFilters,
  Priority,
  Status,
  Category 
} from './ticket.service';
export type { 
  Article, 
  CreateArticleData, 
  UpdateArticleData 
} from './kb.service';
export type { 
  Notification, 
  NotificationType 
} from './notification.service';
export type {
  UploadResponse,
  AvatarUploadResponse
} from './upload.service';
