// API Configuration
// Change this URL to your FastAPI backend URL
export const API_BASE_URL = 'http://localhost:8000/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VERIFY: '/auth/verify',
};

// Resource endpoints
export const ENDPOINTS = {
  INCIDENTS: '/incidents',
  PERSONS: '/persons',
  STATISTICS: '/statistics',
};