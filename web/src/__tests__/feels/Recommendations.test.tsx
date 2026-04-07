import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Recommendations, type Recommendation } from '../../feels/Recommendations';

const RECS: Recommendation[] = [
  { description: 'Go for a walk', rationale: 'Physical movement helps regulate emotion.' },
  { description: 'Call a friend', rationale: 'Social connection can lift mood.' },
];

function buildProps(overrides: Partial<React.ComponentProps<typeof Recommendations>> = {}) {
  return {
    feelId: 'feel-1',
    recs: [],
    loaded: false,
    loading: false,
    error: null,
    onFetch: vi.fn(),
    onSelect: vi.fn(),
    ...overrides,
  };
}

describe('Recommendations', () => {
  describe('unloaded state', () => {
    it('shows "Suggest follow-ups with AI" button', () => {
      render(<Recommendations {...buildProps()} />);
      expect(screen.getByRole('button', { name: /suggest follow-ups with ai/i })).toBeInTheDocument();
    });

    it('calls onFetch when the button is clicked', async () => {
      const onFetch = vi.fn();
      render(<Recommendations {...buildProps({ onFetch })} />);
      await userEvent.click(screen.getByRole('button', { name: /suggest follow-ups with ai/i }));
      expect(onFetch).toHaveBeenCalledOnce();
    });

    it('disables the button while loading', () => {
      render(<Recommendations {...buildProps({ loading: true })} />);
      expect(screen.getByRole('button', { name: /getting recommendations/i })).toBeDisabled();
    });
  });

  describe('error state', () => {
    it('shows error message', () => {
      render(<Recommendations {...buildProps({ loaded: true, error: 'Could not load recommendations. Try again.' })} />);
      expect(screen.getByText(/could not load recommendations/i)).toBeInTheDocument();
    });

    it('calls onFetch when Retry is clicked', async () => {
      const onFetch = vi.fn();
      render(<Recommendations {...buildProps({ loaded: true, error: 'Could not load recommendations. Try again.', onFetch })} />);
      await userEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onFetch).toHaveBeenCalledOnce();
    });
  });

  describe('loaded state', () => {
    it('renders all recommendations', () => {
      render(<Recommendations {...buildProps({ recs: RECS, loaded: true })} />);
      expect(screen.getByText('Go for a walk')).toBeInTheDocument();
      expect(screen.getByText('Call a friend')).toBeInTheDocument();
    });

    it('renders rationale for each recommendation', () => {
      render(<Recommendations {...buildProps({ recs: RECS, loaded: true })} />);
      expect(screen.getByText('Physical movement helps regulate emotion.')).toBeInTheDocument();
      expect(screen.getByText('Social connection can lift mood.')).toBeInTheDocument();
    });

    it('"I did this!" calls onSelect with attachFeel=true', async () => {
      const onSelect = vi.fn();
      render(<Recommendations {...buildProps({ recs: RECS, loaded: true, onSelect })} />);
      const buttons = screen.getAllByRole('button', { name: /i did this/i });
      await userEvent.click(buttons[0]);
      expect(onSelect).toHaveBeenCalledWith('Go for a walk', true);
    });

    it('"log as follow-up" calls onSelect with attachFeel=false', async () => {
      const onSelect = vi.fn();
      render(<Recommendations {...buildProps({ recs: RECS, loaded: true, onSelect })} />);
      const buttons = screen.getAllByRole('button', { name: /log as follow-up/i });
      await userEvent.click(buttons[1]);
      expect(onSelect).toHaveBeenCalledWith('Call a friend', false);
    });

    it('shows refresh button and calls onFetch', async () => {
      const onFetch = vi.fn();
      render(<Recommendations {...buildProps({ recs: RECS, loaded: true, onFetch })} />);
      await userEvent.click(screen.getByTitle('Refresh recommendations'));
      expect(onFetch).toHaveBeenCalledOnce();
    });

    it('disables refresh button while loading', () => {
      render(<Recommendations {...buildProps({ recs: RECS, loaded: true, loading: true })} />);
      expect(screen.getByTitle('Refresh recommendations')).toBeDisabled();
    });

    it('renders the "AI suggestions" heading', () => {
      render(<Recommendations {...buildProps({ recs: RECS, loaded: true })} />);
      expect(screen.getByText(/ai suggestions/i)).toBeInTheDocument();
    });
  });
});
