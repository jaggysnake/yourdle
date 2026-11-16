import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Header from './Header.jsx';
import { HOME_HREF } from '../lib/constants.js';

// The project has no DOM test environment, so these assert the rendered markup via
// react-dom/server. The links carry no event handlers, so their attributes are the
// whole of their behaviour.
describe('Header', () => {
  it('renders a labelled home link to the deployment root', () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html).toContain('header-home');
    expect(html).toContain(`href="${HOME_HREF}"`);
    expect(html).toContain('aria-label="Home"');
  });
});
