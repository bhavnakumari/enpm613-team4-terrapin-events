/**
 * Authentication Types
 * Matches backend schemas exactly
 */

export type UserRole = 'participant' | 'organizer' | 'admin';

export interface User {
  directory_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  major?: string;
  year?: string;
  pronouns?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

export interface LoginRequest {
  directory_id: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
