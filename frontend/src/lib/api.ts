import { API_BASE_URL, AUTH_ENDPOINTS, ENDPOINTS } from './api.config';
import type {
  Person,
  Incident,
  Statistics,
  LoginCredentials,
  AuthResponse,
  PublicIncident,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  CreatePersonRequest,
  UpdatePersonRequest,
  StatisticsRequest,
} from './types';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to create headers with auth token
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(includeAuth),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authAPI = {
  /**
   * Login with username and password
   * Returns auth token on success
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>(
      AUTH_ENDPOINTS.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      false // Don't include auth token for login
    );

    // Store token in localStorage
    if (response.success && response.token) {
      localStorage.setItem('auth_token', response.token);
    }

    return response;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await apiRequest(AUTH_ENDPOINTS.LOGOUT, { method: 'POST' });
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  /**
   * Verify if current token is valid
   */
  verify: async (): Promise<boolean> => {
    try {
      await apiRequest(AUTH_ENDPOINTS.VERIFY, { method: 'GET' });
      return true;
    } catch {
      localStorage.removeItem('auth_token');
      return false;
    }
  },
};

// ============================================================================
// INCIDENTS API
// ============================================================================

export const incidentsAPI = {
  /**
   * Get all incidents (requires authentication)
   */
  getAll: async (): Promise<Incident[]> => {
    return apiRequest<Incident[]>(ENDPOINTS.INCIDENTS, { method: 'GET' });
  },

  /**
   * Get public incident information (no authentication required)
   * Returns only registration numbers and addresses
   */
  getPublic: async (): Promise<PublicIncident[]> => {
    return apiRequest<PublicIncident[]>(
      `${ENDPOINTS.INCIDENTS}/public`,
      { method: 'GET' },
      false // No auth required
    );
  },

  /**
   * Get single incident by ID (requires authentication)
   */
  getById: async (id: string): Promise<Incident> => {
    return apiRequest<Incident>(`${ENDPOINTS.INCIDENTS}/${id}`, { method: 'GET' });
  },

  /**
   * Create new incident (requires authentication)
   */
  create: async (data: CreateIncidentRequest): Promise<Incident> => {
    return apiRequest<Incident>(ENDPOINTS.INCIDENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update existing incident (requires authentication)
   */
  update: async (id: string, data: Partial<CreateIncidentRequest>): Promise<Incident> => {
    return apiRequest<Incident>(`${ENDPOINTS.INCIDENTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete incident (requires authentication)
   */
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`${ENDPOINTS.INCIDENTS}/${id}`, { method: 'DELETE' });
  },

  /**
   * Get incidents by person ID (requires authentication)
   */
  getByPersonId: async (personId: string): Promise<Incident[]> => {
    return apiRequest<Incident[]>(`${ENDPOINTS.INCIDENTS}/by-person/${personId}`, {
      method: 'GET',
    });
  },
};

// ============================================================================
// PERSONS API
// ============================================================================

export const personsAPI = {
  /**
   * Get all persons (requires authentication)
   */
  getAll: async (): Promise<Person[]> => {
    return apiRequest<Person[]>(ENDPOINTS.PERSONS, { method: 'GET' });
  },

  /**
   * Get single person by ID (requires authentication)
   */
  getById: async (id: string): Promise<Person> => {
    return apiRequest<Person>(`${ENDPOINTS.PERSONS}/${id}`, { method: 'GET' });
  },

  /**
   * Create new person (requires authentication)
   */
  create: async (data: CreatePersonRequest): Promise<Person> => {
    return apiRequest<Person>(ENDPOINTS.PERSONS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update existing person (requires authentication)
   */
  update: async (id: string, data: Partial<CreatePersonRequest>): Promise<Person> => {
    return apiRequest<Person>(`${ENDPOINTS.PERSONS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete person (requires authentication)
   */
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`${ENDPOINTS.PERSONS}/${id}`, { method: 'DELETE' });
  },
};

// ============================================================================
// STATISTICS API
// ============================================================================

export const statisticsAPI = {
  /**
   * Get statistics for specified time period (requires authentication)
   */
  getByPeriod: async (request: StatisticsRequest): Promise<Statistics> => {
    const params = new URLSearchParams({
      start_date: request.startDate,
      end_date: request.endDate,
    });
    
    return apiRequest<Statistics>(`${ENDPOINTS.STATISTICS}?${params}`, {
      method: 'GET',
    });
  },

  /**
   * Get overall statistics (requires authentication)
   */
  getOverall: async (): Promise<Statistics> => {
    return apiRequest<Statistics>(ENDPOINTS.STATISTICS, { method: 'GET' });
  },
};

// ============================================================================
// EXPORT ALL APIs
// ============================================================================

export const api = {
  auth: authAPI,
  incidents: incidentsAPI,
  persons: personsAPI,
  statistics: statisticsAPI,
};

export default api;
