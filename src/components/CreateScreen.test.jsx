import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateScreen from './CreateScreen.jsx';
import { DEFAULT_GUESSES, MIN_GUESSES, MAX_GUESSES } from '../lib/constants.js';

const ENOUGH_TO_CROSS_THE_RANGE = MAX_GUESSES - MIN_GUESSES + 1;

async function clickTimes(user, button, times) {
  for (let i = 0; i < times; i += 1) {
    await user.click(button);
  }
}

describe('CreateScreen guess stepper', () => {
  it('steps the count down and back up', async () => {
    const user = userEvent.setup();
    render(<CreateScreen />);
    const count = screen.getByLabelText('Number of guesses');

    expect(count).toHaveTextContent(String(DEFAULT_GUESSES));

    await user.click(screen.getByRole('button', { name: 'Fewer guesses' }));
    expect(count).toHaveTextContent(String(DEFAULT_GUESSES - 1));

    await user.click(screen.getByRole('button', { name: 'More guesses' }));
    expect(count).toHaveTextContent(String(DEFAULT_GUESSES));
  });

  // The buttons stay enabled at the bounds so keyboard focus is not dropped, which
  // means these clicks do reach the handler and the clamp is what holds the count.
  it('holds at each bound and marks the button that would leave the range', async () => {
    const user = userEvent.setup();
    render(<CreateScreen />);
    const count = screen.getByLabelText('Number of guesses');
    const fewer = screen.getByRole('button', { name: 'Fewer guesses' });
    const more = screen.getByRole('button', { name: 'More guesses' });

    await clickTimes(user, fewer, ENOUGH_TO_CROSS_THE_RANGE);
    expect(count).toHaveTextContent(String(MIN_GUESSES));
    expect(fewer).toHaveAttribute('aria-disabled', 'true');
    expect(more).toHaveAttribute('aria-disabled', 'false');

    await clickTimes(user, more, ENOUGH_TO_CROSS_THE_RANGE);
    expect(count).toHaveTextContent(String(MAX_GUESSES));
    expect(more).toHaveAttribute('aria-disabled', 'true');
    expect(fewer).toHaveAttribute('aria-disabled', 'false');
  });

  // The arrows were text glyphs and rendered at two different sizes on mobile, because
  // no font in the body stack covers U+25B2/U+25BC and each resolved its own fallback.
  it('draws both arrows at one size instead of relying on a font', () => {
    render(<CreateScreen />);
    const fewer = screen.getByRole('button', { name: 'Fewer guesses' });
    const more = screen.getByRole('button', { name: 'More guesses' });

    const arrows = [fewer, more].map((button) => button.querySelector('svg'));

    arrows.forEach((arrow) => expect(arrow).not.toBeNull());
    expect(arrows[0].getAttribute('width')).toBe(arrows[1].getAttribute('width'));
    expect(arrows[0].getAttribute('height')).toBe(arrows[1].getAttribute('height'));
    expect(fewer.textContent).toBe('');
    expect(more.textContent).toBe('');
  });
});
