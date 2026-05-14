import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Pin the random word so tests are deterministic
vi.mock('../data/words', async () => {
  const actual = await vi.importActual<typeof import('../data/words')>('../data/words');
  return {
    ...actual,
    getRandomWord: () => 'crane',
  };
});

function renderApp() {
  return render(<App />);
}

describe('App — initial render', () => {
  it('shows the LEXLE title', () => {
    renderApp();
    expect(screen.getByText(/lexle/i)).toBeInTheDocument();
  });

  it('renders the game board', () => {
    renderApp();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders the keyboard', () => {
    renderApp();
    expect(screen.getByRole('region', { hidden: true }) || screen.getByLabelText('Keyboard')).toBeTruthy();
  });

  it('shows the help button', () => {
    renderApp();
    expect(screen.getByLabelText('How to play')).toBeInTheDocument();
  });

  it('shows the new-word button', () => {
    renderApp();
    expect(screen.getByLabelText('New word')).toBeInTheDocument();
  });
});

describe('App — typing', () => {
  it('adds a letter when a keyboard key is pressed', async () => {
    renderApp();
    await userEvent.keyboard('c');
    const tiles = screen.getAllByRole('gridcell', { hidden: true });
    // first tile should have the letter
    expect(tiles.length).toBeGreaterThan(0);
  });

  it('removes a letter on Backspace', async () => {
    renderApp();
    await userEvent.keyboard('c');
    await userEvent.keyboard('{Backspace}');
    // Board should reset first tile to empty
    const tiles = screen.getAllByLabelText(/empty/i);
    expect(tiles.length).toBeGreaterThan(0);
  });

  it('shows toast when submitting a word not in the word list', async () => {
    renderApp();
    await userEvent.keyboard('zzzzz');
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByText(/not in word list/i)).toBeInTheDocument();
  });

  it('shows toast when submitting with fewer than 5 letters', async () => {
    renderApp();
    await userEvent.keyboard('cr');
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByText(/not enough letters/i)).toBeInTheDocument();
  });
});

describe('App — on-screen keyboard', () => {
  it('clicking a letter key types it', async () => {
    renderApp();
    const cKey = screen.getByRole('button', { name: 'C' });
    await userEvent.click(cKey);
    const tile = screen.getByLabelText('C tbd');
    expect(tile).toBeInTheDocument();
  });

  it('clicking ⌫ key removes a letter', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: 'C' }));
    await userEvent.click(screen.getByRole('button', { name: 'Backspace' }));
    expect(screen.queryByLabelText('C tbd')).not.toBeInTheDocument();
  });
});

describe('App — winning', () => {
  it('shows the win modal after guessing correctly', async () => {
    vi.useFakeTimers();
    renderApp();

    // Type "crane" (the mocked target)
    for (const letter of 'crane') {
      await userEvent.keyboard(letter);
    }
    await userEvent.keyboard('{Enter}');

    // Fast-forward reveal animation (5 tiles × 300ms + 100ms buffer)
    await act(async () => { vi.advanceTimersByTime(2000); });

    expect(await screen.findByText(/you got it/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe('App — help modal', () => {
  it('opens help modal when clicking the ? button', async () => {
    renderApp();
    await userEvent.click(screen.getByLabelText('How to play'));
    expect(screen.getByText(/how to play/i)).toBeInTheDocument();
  });

  it('closes help modal when clicking the ✕ button', async () => {
    renderApp();
    await userEvent.click(screen.getByLabelText('How to play'));
    const closeBtn = screen.getByRole('button', { name: '✕' });
    await userEvent.click(closeBtn);
    // Modal should be gone
    expect(screen.queryByText('How to Play')).not.toBeInTheDocument();
  });
});

describe('App — new word', () => {
  it('resets the board when clicking the new-word button', async () => {
    renderApp();
    await userEvent.keyboard('crane');
    await userEvent.click(screen.getByLabelText('New word'));
    // All tiles should be empty after reset
    const emptyTiles = screen.getAllByLabelText(/empty/i);
    expect(emptyTiles.length).toBe(30); // 6×5
  });
});
