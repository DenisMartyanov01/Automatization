import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { StatisticsTab } from '../StatisticsTab';
import { api } from '../../lib/api';

const mockIncidents = [
  {
    id: '1',
    registration_number: 'RN123',
    type: 'Theft',
    description: 'Stolen item',
    location: 'Mall',
    date: '2023-10-01T10:00:00',
    severity: 'medium' as const,
    involvedPersons: ['1']
  }
];

const mockPersons = [
  {
    id: '1',
    registration_number: 'PR123',
    name: 'John Doe',
    address: '123 Main St',
    role: 'suspect' as const,
    phone: '1234567890',
    email: 'john@example.com'
  }
];

const mockStatistics = {
  totalIncidents: 5,
  byType: { 'Theft': 3, 'Assault': 2 },
  bySeverity: { low: 1, medium: 3, high: 1 },
  byMonth: []
};

describe('StatisticsTab', () => {
  beforeEach(() => {
    (api.incidents.getAll as jest.Mock).mockResolvedValue(mockIncidents);
    (api.persons.getAll as jest.Mock).mockResolvedValue(mockPersons);
    (api.statistics.getOverall as jest.Mock).mockResolvedValue(mockStatistics);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders statistics overview correctly', async () => {
    render(<StatisticsTab />);

    await waitFor(() => {
      expect(screen.getByText('Statistics & Reports')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
    expect(screen.getByText('Total Persons')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // total incidents
    expect(screen.getByText('1')).toBeInTheDocument(); // total persons
  });

  it('handles date range search', async () => {
    const mockDateRangeStats = {
      totalIncidents: 2,
      byType: { 'Theft': 2 },
      bySeverity: { low: 0, medium: 2, high: 0 },
      byMonth: []
    };

    (api.statistics.getByPeriod as jest.Mock).mockResolvedValue(mockDateRangeStats);

    render(<StatisticsTab />);

    await waitFor(() => {
      expect(screen.getByText('Search by Date Range')).toBeInTheDocument();
    });

    // Заполняем даты
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2023-10-01' }
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2023-10-31' }
    });

    // Выполняем поиск
    fireEvent.click(screen.getByText('Search by Date'));

    await waitFor(() => {
      expect(api.statistics.getByPeriod).toHaveBeenCalledWith({
        startDate: '2023-10-01',
        endDate: '2023-10-31'
      });
    });

    // Проверяем отображение результатов
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // found incidents
    });
  });

  it('handles person search', async () => {
    const mockPersonIncidents = [mockIncidents[0]];

    (api.incidents.getByPersonId as jest.Mock).mockResolvedValue(mockPersonIncidents);

    render(<StatisticsTab />);

    await waitFor(() => {
      expect(screen.getByText('Search by Person')).toBeInTheDocument();
    });

    // Выбираем персону из выпадающего списка
    const select = screen.getByLabelText('Select Person');
    fireEvent.change(select, { target: { value: '1' } });

    // Выполняем поиск
    fireEvent.click(screen.getByText('Search by Person'));

    await waitFor(() => {
      expect(api.incidents.getByPersonId).toHaveBeenCalledWith('1');
    });

    // Проверяем отображение результатов
    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // found incidents
      expect(screen.getByText('Theft')).toBeInTheDocument();
    });
  });
});