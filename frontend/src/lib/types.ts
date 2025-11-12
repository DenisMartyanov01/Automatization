// TypeScript types for API data structures

export interface Person {
  id: string;
  registrationNumber: string;
  name: string;
  address: string;
  role: 'suspect' | 'witness' | 'victim';
  phone: string;
  email: string;
}

export interface Incident {
  id: string;
  registrationNumber: string;
  type: string;
  description: string;
  location: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
  involvedPersons: string[];
}

export interface Statistics {
  totalIncidents: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byMonth: Array<{ month: string; count: number }>;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface PublicIncident {
  registrationNumber: string;
  location: string;
}

// Request types
export interface CreateIncidentRequest {
  type: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  involvedPersons: string[];
}

export interface UpdateIncidentRequest extends Partial<CreateIncidentRequest> {
  id: string;
}

export interface CreatePersonRequest {
  name: string;
  address: string;
  role: 'suspect' | 'witness' | 'victim';
  phone: string;
  email: string;
}

export interface UpdatePersonRequest extends Partial<CreatePersonRequest> {
  id: string;
}

export interface StatisticsRequest {
  startDate: string;
  endDate: string;
}
