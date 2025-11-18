import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { IncidentsTab } from '../IncidentsTab';
import { api } from '../../lib/api';

const mockIncidents = [
  {
    id: '1',
    registration_number: 'RN123',
    type: 'Theft',
    description: 'Stolen laptop',
    location: 'Office building',
    date: '2023-10-01T10:00:00',
    severity: 'medium' as const,
    involvedPersons: ['person1']
  }
];

const mockPersons = [
  {
    id: 'person1',
    registration_number: 'PR123',
    name: 'John Doe',
    address: '123 Main St',
    role: 'suspect' as const,
    phone: '1234567890',
    email: 'john@example.com'
  }
];

describe('IncidentsTab', () => {
  beforeEach(() => {
    (api.incidents.getAll as jest.Mock).mockResolvedValue(mockIncidents);
    (api.persons.getAll as jest.Mock).mockResolvedValue(mockPersons);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders incidents list correctly', async () => {
    render(<IncidentsTab />);

    // Проверяем загрузку
    await waitFor(() => {
      expect(screen.getByText('Incident Management')).toBeInTheDocument();
    });

    // Проверяем отображение инцидентов
    expect(screen.getByText('Theft')).toBeInTheDocument();
    expect(screen.getByText('RN123')).toBeInTheDocument();
    expect(screen.getByText('Office building')).toBeInTheDocument();
  });

  it('opens create incident form when add button is clicked', async () => {
    render(<IncidentsTab />);

    await waitFor(() => {
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add'));

    expect(screen.getByText('Add New Incident')).toBeInTheDocument();
    expect(screen.getByLabelText('Incident Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
  });

  it('handles incident creation', async () => {
    const mockNewIncident = {
      id: '2',
      registration_number: 'RN456',
      type: 'Assault',
      description: 'Physical assault',
      location: 'Park',
      date: '2023-10-02T10:00:00',
      severity: 'high' as const,
      involvedPersons: []
    };

    (api.incidents.create as jest.Mock).mockResolvedValue(mockNewIncident);

    render(<IncidentsTab />);

    await waitFor(() => {
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    // Открываем форму
    fireEvent.click(screen.getByText('Add'));

    // Заполняем форму
    fireEvent.change(screen.getByLabelText('Incident Type'), {
      target: { value: 'Assault' }
    });
    fireEvent.change(screen.getByLabelText('Location'), {
      target: { value: 'Park area' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Physical assault case' }
    });

    // Отправляем форму
    fireEvent.click(screen.getByText('Create Incident'));

    await waitFor(() => {
      expect(api.incidents.create).toHaveBeenCalledWith({
        type: 'Assault',
        description: 'Physical assault case',
        location: 'Park area',
        severity: 'medium', // default value
        involvedPersons: []
      });
    });
  });

  it('expands and collapses incident details', async () => {
    render(<IncidentsTab />);

    await waitFor(() => {
      expect(screen.getByText('Theft')).toBeInTheDocument();
    });

    // Проверяем, что детали сначала скрыты
    expect(screen.queryByText('Stolen laptop')).not.toBeInTheDocument();

    // Кликаем для раскрытия
    fireEvent.click(screen.getByText('Theft'));

    // Проверяем, что детали отобразились
    await waitFor(() => {
      expect(screen.getByText('Stolen laptop')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});