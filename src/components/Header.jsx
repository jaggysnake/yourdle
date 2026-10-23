import { useCallback, useRef, useState } from 'react';
import EasterEgg from './EasterEgg.jsx';
import { recordTap, shouldTrigger } from '../lib/easterEgg.js';

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
        <h1 className="header-title" onPointerDown={handleTap}>
          Yourdle
        </h1>
      </header>
      {eggActive && <EasterEgg onDone={() => setEggActive(false)} />}
    </>
  );
}
