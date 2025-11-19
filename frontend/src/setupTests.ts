import '@testing-library/jest-dom';

// Мокаем API модуль
jest.mock('./lib/api', () => ({
  api: {
    auth: {
      login: jest.fn(),
      logout: jest.fn(),
      verify: jest.fn(),
    },
    incidents: {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      getByPersonId: jest.fn(),
    },
    persons: {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    statistics: {
      getOverall: jest.fn(),
      getByPeriod: jest.fn(),
    },
  },
}));

// Мокаем sonner для уведомлений
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));