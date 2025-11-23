/**
 * Environment configuration
 * Centralized access to environment variables with fallbacks
 */

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
} as const;
