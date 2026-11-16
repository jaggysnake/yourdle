import { describe, expect, it, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Game from './Game.jsx';
import { loadDictionary } from '../lib/dictionary.js';

// Seeding the cache through the injectable fetcher also makes isLengthLoaded true, so
// Game renders the board immediately instead of waiting on a real network request.
beforeAll(async () => {
  await loadDictionary(5, async () => ({ ok: true, text: async () => 'scary\n' }));
});

const REVEAL_TIMEOUT = 4000;

async function winTheGame(user) {
  await user.keyboard('scary{Enter}');
  await waitFor(() => expect(screen.getByRole('heading', { name: /You got it/ })).toBeVisible(), {
    timeout: REVEAL_TIMEOUT,
  });
}

describe('Game result modal', () => {
  it('can be reopened after it is dismissed', async () => {
    const user = userEvent.setup();
    render(<Game answer="scary" maxGuesses={4} />);

    await winTheGame(user);
    expect(screen.queryByRole('button', { name: 'Show result' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('heading', { name: /You got it/ }).closest('.modal-backdrop'));

    expect(screen.queryByRole('heading', { name: /You got it/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show result' }));

    expect(screen.getByRole('heading', { name: /You got it/ })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Show result' })).not.toBeInTheDocument();
  });

  it('offers no reopen button while the tiles are still revealing', async () => {
    const user = userEvent.setup();
    render(<Game answer="scary" maxGuesses={4} />);

    await user.keyboard('scary{Enter}');

    expect(screen.queryByRole('heading', { name: /You got it/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show result' })).not.toBeInTheDocument();
  });

  it('offers no reopen button while the game is still in play', () => {
    render(<Game answer="scary" maxGuesses={4} />);

    expect(screen.queryByRole('button', { name: 'Show result' })).not.toBeInTheDocument();
  });
});
