import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import App from '../App';

const mockUseAuth = vi.fn();

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../api/client', () => ({
  apiClient: { get: vi.fn().mockResolvedValue({ data: { entries: [] } }), post: vi.fn() },
}));

describe('App', () => {
  it('shows Home page when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false, login: vi.fn(), logout: vi.fn() });
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('me-feels')).toBeInTheDocument();
  });

  it('shows Dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { sub: 'dev-local-bob', email: 'bob@local.dev', name: 'bob' },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'How are you feeling?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your recent emotions' })).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });
});
