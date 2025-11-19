import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PersonsTab } from '../PersonsTab';
import { api } from '../../lib/api';

const mockPersons = [
  {
    id: '1',
    registration_number: 'PR123',
    name: 'John Doe',
    address: '123 Main St, City',
    role: 'suspect' as const,
    phone: '1234567890',
    email: 'john@example.com'
  },
  {
    id: '2',
    registration_number: 'PR456',
    name: 'Jane Smith',
    address: '456 Oak St, Town',
    role: 'witness' as const,
    phone: '0987654321',
    email: 'jane@example.com'
  }
];

describe('PersonsTab', () => {
  beforeEach(() => {
    (api.persons.getAll as jest.Mock).mockResolvedValue(mockPersons);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders persons list correctly', async () => {
    render(<PersonsTab />);

    await waitFor(() => {
      expect(screen.getByText('Person Management')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Suspect')).toBeInTheDocument();
    expect(screen.getByText('Witness')).toBeInTheDocument();
  });

  it('opens create person form when add button is clicked', async () => {
    render(<PersonsTab />);

    await waitFor(() => {
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add'));

    expect(screen.getByText('Add New Person')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  it('handles person creation', async () => {
    const mockNewPerson = {
      id: '3',
      registration_number: 'PR789',
      name: 'Bob Wilson',
      address: '789 Pine St, Village',
      role: 'victim' as const,
      phone: '5555555555',
      email: 'bob@example.com'
    };

    (api.persons.create as jest.Mock).mockResolvedValue(mockNewPerson);

    render(<PersonsTab />);

    await waitFor(() => {
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    // Открываем форму
    fireEvent.click(screen.getByText('Add'));

    // Заполняем форму
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Bob Wilson' }
    });
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: '789 Pine St, Village' }
    });
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '5555555555' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'bob@example.com' }
    });

    // Выбираем роль
    fireEvent.click(screen.getByText('Suspect')); // Открываем селект
    fireEvent.click(screen.getByText('Victim')); // Выбираем значение

    // Отправляем форму
    fireEvent.click(screen.getByText('Add Person'));

    await waitFor(() => {
      expect(api.persons.create).toHaveBeenCalledWith({
        name: 'Bob Wilson',
        address: '789 Pine St, Village',
        role: 'victim',
        phone: '5555555555',
        email: 'bob@example.com'
      });
    });
  });
});