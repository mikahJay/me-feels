import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../auth/AuthContext';

vi.mock('../../api/client', () => ({
  apiClient: {
    get: vi.fn().mockRejectedValue(new Error('not authenticated')),
    post: vi.fn().mockResolvedValue({}),
  },
}));

function TestConsumer() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>loading</div>;
  return <div>{user ? `logged in as ${user.email}` : 'not logged in'}</div>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows not logged in when API returns 401', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    expect(screen.getByText('not logged in')).toBeInTheDocument();
  });

  it('stores token from URL params', async () => {
    const { apiClient } = await import('../../api/client');
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { user: { sub: '1', email: 'u@test.com', name: 'User' } },
    });

    // Simulate token in URL
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?access_token=mytoken', pathname: '/' },
      writable: true,
    });
    window.history.replaceState = vi.fn();

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });
    expect(localStorage.getItem('access_token')).toBe('mytoken');
  });
});
