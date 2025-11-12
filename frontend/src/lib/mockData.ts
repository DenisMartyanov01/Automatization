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

export const mockPersons: Person[] = [
  {
    id: 'person-1',
    registrationNumber: 'PR001234',
    name: 'John Anderson',
    address: '123 Main Street, Downtown, City Center',
    role: 'suspect',
    phone: '+1 (555) 123-4567',
    email: 'j.anderson@email.com'
  },
  {
    id: 'person-2',
    registrationNumber: 'PR001235',
    name: 'Sarah Mitchell',
    address: '456 Oak Avenue, Westside District',
    role: 'witness',
    phone: '+1 (555) 234-5678',
    email: 's.mitchell@email.com'
  },
  {
    id: 'person-3',
    registrationNumber: 'PR001236',
    name: 'Michael Chen',
    address: '789 Elm Street, Eastside Neighborhood',
    role: 'victim',
    phone: '+1 (555) 345-6789',
    email: 'm.chen@email.com'
  },
  {
    id: 'person-4',
    registrationNumber: 'PR001237',
    name: 'Emily Rodriguez',
    address: '321 Pine Road, Northside Area',
    role: 'witness',
    phone: '+1 (555) 456-7890',
    email: 'e.rodriguez@email.com'
  },
  {
    id: 'person-5',
    registrationNumber: 'PR001238',
    name: 'David Thompson',
    address: '654 Maple Drive, Southside Quarter',
    role: 'suspect',
    phone: '+1 (555) 567-8901',
    email: 'd.thompson@email.com'
  }
];

export const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    registrationNumber: 'RN789456',
    type: 'Theft',
    description: 'Reported theft of personal belongings from a vehicle parked in a public parking lot. The suspect allegedly broke the rear window to gain access.',
    location: '123 Main Street, Downtown, City Center',
    date: '2025-10-06T14:30:00Z',
    severity: 'medium',
    involvedPersons: ['person-1', 'person-2']
  },
  {
    id: 'inc-2',
    registrationNumber: 'RN789457',
    type: 'Vandalism',
    description: 'Public property damage reported at the city park. Graffiti was found on multiple benches and playground equipment.',
    location: '789 Elm Street, Eastside Neighborhood',
    date: '2025-10-05T09:15:00Z',
    severity: 'low',
    involvedPersons: ['person-5']
  },
  {
    id: 'inc-3',
    registrationNumber: 'RN789458',
    type: 'Assault',
    description: 'Physical altercation between two individuals resulting in minor injuries. Medical assistance was provided at the scene.',
    location: '456 Oak Avenue, Westside District',
    date: '2025-10-04T22:45:00Z',
    severity: 'high',
    involvedPersons: ['person-3', 'person-4', 'person-5']
  },
  {
    id: 'inc-4',
    registrationNumber: 'RN789459',
    type: 'Burglary',
    description: 'Residential break-in reported during daytime hours. Entry was gained through a rear window. Several electronic devices were reported missing.',
    location: '321 Pine Road, Northside Area',
    date: '2025-10-03T11:20:00Z',
    severity: 'high',
    involvedPersons: ['person-1', 'person-4']
  },
  {
    id: 'inc-5',
    registrationNumber: 'RN789460',
    type: 'Disturbance',
    description: 'Noise complaint and public disturbance reported in residential area. Officers responded and situation was resolved peacefully.',
    location: '654 Maple Drive, Southside Quarter',
    date: '2025-10-02T20:00:00Z',
    severity: 'low',
    involvedPersons: ['person-2']
  }
];
