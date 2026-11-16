import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Header from './Header.jsx';
import { HOME_HREF } from '../lib/constants.js';

// The project has no DOM test environment, so these assert the rendered markup via
// react-dom/server. The links carry no event handlers, so their attributes are the
// whole of their behaviour.
function anchorWithClass(className) {
  const html = renderToStaticMarkup(<Header />);
  const match = html.match(new RegExp(`<a[^>]*${className}[^>]*>`));
  return match === null ? '' : match[0];
}

describe('Header', () => {
  it('renders a labelled home link to the deployment root', () => {
    const home = anchorWithClass('header-home');

    expect(home).toContain(`href="${HOME_HREF}"`);
    expect(home).toContain('aria-label="Home"');
  });

  it('renders a labelled GitHub link that opens detached from the app', () => {
    const github = anchorWithClass('header-github');

    expect(github).toContain('href="https://github.com/jaggysnake/yourdle"');
    expect(github).toContain('aria-label="Source on GitHub (opens in new tab)"');
    expect(github).toContain('target="_blank"');
    expect(github).toContain('rel="noopener noreferrer"');
  });
});
