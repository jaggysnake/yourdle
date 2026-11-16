import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header.jsx';
import { HOME_HREF } from '../lib/constants.js';

describe('Header', () => {
  it('renders a labelled home link to the deployment root', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', HOME_HREF);
  });

  it('renders a GitHub link that opens detached from the app', () => {
    render(<Header />);
    const github = screen.getByRole('link', { name: /Source on GitHub/ });

    expect(github).toHaveAttribute('href', 'https://github.com/jaggysnake/yourdle');
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
