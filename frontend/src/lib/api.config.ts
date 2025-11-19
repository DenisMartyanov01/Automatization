// API Configuration
// Change this URL to your FastAPI backend URL
export const API_BASE_URL = 'http://localhost:8000';

export const ENDPOINTS = {
  INCIDENTS: '/api/incidents',
  PERSONS: '/api/persons', 
  STATISTICS: '/api/statistics',
} as const;

export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  VERIFY: '/api/auth/verify',
} as const;