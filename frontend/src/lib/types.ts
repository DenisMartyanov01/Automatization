// ЗАМЕНИТЕ ВЕСЬ СОДЕРЖИМОЕ ФАЙЛА НА:

// TypeScript types for API data structures

export interface Person {
  id: string;
  registration_number: string;
  name: string;
  address: string;
  role: string;
  phone: string;
  email: string;
}

export interface Incident {
  id: string;
  registration_number: string;
  type: string;
  description: string;
  location: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
  involvedPersons: string[]; // Измените с Person[] на string[]
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
  user?: {
    id: string;
    username: string;
  };
  message?: string;
  token?: string;  // Убедитесь, что это поле есть
}

// УДАЛИТЕ PublicIncident - он не используется и не соответствует бэкенду
// export interface PublicIncident {
//   registrationNumber: string;
//   location: string;
// }

// Request types
export interface CreateIncidentRequest {
  type: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  involvedPersons: string[]; // ID персон, а не полные объекты
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