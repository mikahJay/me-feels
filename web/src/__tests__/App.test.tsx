import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import App from '../App';

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null, isLoading: false, login: vi.fn(), logout: vi.fn() })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

describe('App', () => {
  it('shows Home page when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('me-feels')).toBeInTheDocument();
  });
});
