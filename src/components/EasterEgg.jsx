import { useEffect, useMemo } from 'react';

const HEART_GLYPHS = ['❤️', '💖', '💕', '💗', '💓', '💞', '💘'];
const HEART_COUNT = 18;
const DISMISS_MS = 2800;

// Build one batch of firework hearts with randomized trajectories.
// Each heart starts near the bottom-center and flies up + sideways, fading out.
function buildHearts() {
  return Array.from({ length: HEART_COUNT }, (_, i) => {
    const dx = Math.round((Math.random() - 0.5) * 2 * 45); // -45vw..45vw sideways drift
    const dy = -(55 + Math.round(Math.random() * 40)); // rise 55vh..95vh
    return {
      id: i,
      glyph: HEART_GLYPHS[i % HEART_GLYPHS.length],
      startX: 40 + Math.round(Math.random() * 20), // launch from 40%..60% width
      dx,
      dy,
      scale: (0.8 + Math.random() * 1.4).toFixed(2),
      delay: (Math.random() * 0.5).toFixed(2),
      rotate: Math.round((Math.random() - 0.5) * 120),
    };
  });
}

// Decorative overlay: a "Matt loves Tia" popup plus heart fireworks. Auto-dismisses
// after DISMISS_MS (or on click). Holds no game state and persists nothing.
export default function EasterEgg({ onDone }) {
  const hearts = useMemo(buildHearts, []);

  useEffect(() => {
    const t = setTimeout(onDone, DISMISS_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="ee-overlay" onClick={onDone} aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="ee-heart"
          style={{
            left: `${h.startX}%`,
            '--dx': `${h.dx}vw`,
            '--dy': `${h.dy}vh`,
            '--scale': h.scale,
            '--delay': `${h.delay}s`,
            '--rotate': `${h.rotate}deg`,
          }}
        >
          {h.glyph}
        </span>
      ))}
      <div className="ee-popup" role="status">
        <span className="ee-popup-hearts">💕</span>
        <strong>Matt loves Tia</strong>
      </div>
    </div>
  );
}
