import { useCallback, useRef, useState } from 'react';
import EasterEgg from './EasterEgg.jsx';
import GitHubIcon from './GitHubIcon.jsx';
import HomeIcon from './HomeIcon.jsx';
import { HOME_HREF } from '../lib/constants.js';
import { recordTap, shouldTrigger } from '../lib/easterEgg.js';

const REPO_URL = 'https://github.com/jaggysnake/yourdle';

// Shared app header. Tapping the title three times in quick succession reveals a
// hidden easter egg. Used by every screen so the behavior lives in one place.
export default function Header() {
  const tapsRef = useRef([]);
  const [eggActive, setEggActive] = useState(false);

  const handleTap = useCallback(() => {
    const recent = recordTap(tapsRef.current, Date.now());
    if (shouldTrigger(recent)) {
      tapsRef.current = [];
      setEggActive(true);
    } else {
      tapsRef.current = recent;
    }
  }, []);

  return (
    <>
      <header className="header">
        <a className="header-icon header-home" href={HOME_HREF} aria-label="Home" title="Home">
          <HomeIcon />
        </a>
        <h1 className="header-title" onPointerDown={handleTap}>
          Yourdle
        </h1>
        <a
          className="header-icon header-github"
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Source on GitHub (opens in new tab)"
          title="Source on GitHub"
        >
          <GitHubIcon />
        </a>
      </header>
      {eggActive && <EasterEgg onDone={() => setEggActive(false)} />}
    </>
  );
}
