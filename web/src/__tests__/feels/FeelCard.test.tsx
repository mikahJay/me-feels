import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeelList, type Feel } from '../../feels/FeelList';

// FollowUpTree has its own tests; stub it to keep these focused
vi.mock('../../feels/FollowUpTree', () => ({
  FollowUpTree: () => <div data-testid="follow-up-tree" />,
}));

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock('../../api/client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

const FEEL: Feel = {
  id: 'feel-abc',
  emotion: 'anxious',
  intensity: 7,
  notes: 'big presentation tomorrow',
  createdAt: '2026-04-06T14:00:00.000Z',
};

const RECS = [
  { description: 'Go for a walk', rationale: 'Movement helps.' },
  { description: 'Deep breathing', rationale: 'Calms the nervous system.' },
];

beforeEach(() => {
  vi.clearAllMocks();
  // Default: feels list returns one feel; follow-ups and recs return empty
  mockGet.mockImplementation((url: string) => {
    if (url.includes('/emotions')) return Promise.resolve({ data: { entries: [FEEL] } });
    if (url.includes('/follow-ups')) return Promise.resolve({ data: { followUps: [] } });
    if (url.includes('/recommendations')) return Promise.resolve({ data: { recommendations: RECS } });
    return Promise.resolve({ data: {} });
  });
  mockPost.mockResolvedValue({
    data: {
      followUp: {
        id: 'fu-1',
        rootFeelId: FEEL.id,
        parentFollowUpId: null,
        description: 'Go for a walk',
        attachedFeelId: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        children: [],
      },
    },
  });
});

async function expandCard() {
  const btn = await screen.findByRole('button', { name: /follow-ups/i });
  await userEvent.click(btn);
}

describe('FeelCard — recommendations and "I did this!" flow', () => {
  it('shows the feel emotion and intensity', async () => {
    render(<FeelList refreshKey={0} />);
    expect(await screen.findByText('anxious')).toBeInTheDocument();
    expect(screen.getByText(/intensity 7\/10/i)).toBeInTheDocument();
  });

  it('shows "Suggest follow-ups with AI" button after expanding', async () => {
    render(<FeelList refreshKey={0} />);
    await expandCard();
    expect(await screen.findByRole('button', { name: /suggest follow-ups with ai/i })).toBeInTheDocument();
  });

  it('fetches and displays recommendations when the AI button is clicked', async () => {
    render(<FeelList refreshKey={0} />);
    await expandCard();
    await userEvent.click(await screen.findByRole('button', { name: /suggest follow-ups with ai/i }));
    await waitFor(() => {
      expect(screen.getByText('Go for a walk')).toBeInTheDocument();
      expect(screen.getByText('Deep breathing')).toBeInTheDocument();
    });
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining(`/recommendations?feelId=${FEEL.id}`));
  });

  it('shows rationale for each recommendation', async () => {
    render(<FeelList refreshKey={0} />);
    await expandCard();
    await userEvent.click(await screen.findByRole('button', { name: /suggest follow-ups with ai/i }));
    expect(await screen.findByText('Movement helps.')).toBeInTheDocument();
    expect(await screen.findByText('Calms the nervous system.')).toBeInTheDocument();
  });

  it('"I did this!" opens the follow-up form pre-filled with the recommendation', async () => {
    render(<FeelList refreshKey={0} />);
    await expandCard();
    await userEvent.click(await screen.findByRole('button', { name: /suggest follow-ups with ai/i }));
    const didThisButtons = await screen.findAllByRole('button', { name: /i did this/i });
    await userEvent.click(didThisButtons[0]);
    // Form should appear with description pre-filled
    const textarea = await screen.findByPlaceholderText(/went for a walk/i);
    expect(textarea).toHaveValue('Go for a walk');
  });

  it('"I did this!" pre-opens the "attach a feel" section', async () => {
    render(<FeelList refreshKey={0} />);
    await expandCard();
    await userEvent.click(await screen.findByRole('button', { name: /suggest follow-ups with ai/i }));
    const didThisButtons = await screen.findAllByRole('button', { name: /i did this/i });
    await userEvent.click(didThisButtons[0]);
    // The "Attach a feel" checkbox should be checked
    const checkbox = await screen.findByRole('checkbox', { name: /attach a feel to this action/i });
    expect(checkbox).toBeChecked();
  });

  it('"log as follow-up" opens the form pre-filled but without attach-feel expanded', async () => {
    render(<FeelList refreshKey={0} />);
    await expandCard();
    await userEvent.click(await screen.findByRole('button', { name: /suggest follow-ups with ai/i }));
    const logButtons = await screen.findAllByRole('button', { name: /log as follow-up/i });
    await userEvent.click(logButtons[1]); // second rec: "Deep breathing"
    const textarea = await screen.findByPlaceholderText(/went for a walk/i);
    expect(textarea).toHaveValue('Deep breathing');
    const checkbox = screen.getByRole('checkbox', { name: /attach a feel to this action/i });
    expect(checkbox).not.toBeChecked();
  });

  it('recommendations persist after opening the follow-up form', async () => {
    render(<FeelList refreshKey={0} />);
    await expandCard();
    await userEvent.click(await screen.findByRole('button', { name: /suggest follow-ups with ai/i }));
    await screen.findByText('Go for a walk');
    // Click "I did this!" — recs should still be visible above the form
    const didThisButtons = screen.getAllByRole('button', { name: /i did this/i });
    await userEvent.click(didThisButtons[0]);
    // Both rec descriptions visible — use getAllByText since textarea also has it
    expect(screen.getAllByText('Go for a walk').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Deep breathing')).toBeInTheDocument();
    // The recs section heading is still visible
    expect(screen.getByText(/ai suggestions/i)).toBeInTheDocument();
  });

  it('submitting the follow-up form posts to the API and closes the form', async () => {
    render(<FeelList refreshKey={0} />);
    await expandCard();
    // Use "log as follow-up" so the attach-feel section is closed (no required select to fill)
    await userEvent.click(await screen.findByRole('button', { name: /suggest follow-ups with ai/i }));
    const logButtons = await screen.findAllByRole('button', { name: /log as follow-up/i });
    await userEvent.click(logButtons[0]); // "Go for a walk", attachFeel=false
    const submitBtn = await screen.findByRole('button', { name: /^add$/i });
    await userEvent.click(submitBtn);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/follow-ups',
        expect.objectContaining({ description: 'Go for a walk', rootFeelId: FEEL.id })
      );
    });
    // Form should be gone after save
    expect(screen.queryByPlaceholderText(/went for a walk/i)).not.toBeInTheDocument();
  });

  it('shows error state when recommendations fail to load', async () => {
    mockGet.mockReset();
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/emotions')) return Promise.resolve({ data: { entries: [FEEL] } });
      if (url.includes('/follow-ups')) return Promise.resolve({ data: { followUps: [] } });
      if (url.includes('/recommendations')) return Promise.reject(new Error('Network error'));
      return Promise.resolve({ data: {} });
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<FeelList refreshKey={0} />);
    await expandCard();
    await userEvent.click(await screen.findByRole('button', { name: /suggest follow-ups with ai/i }));
    await waitFor(() => {
      expect(screen.getByText(/could not load recommendations/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
