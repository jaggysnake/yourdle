import { useMemo } from 'react';
import CreateScreen from './components/CreateScreen.jsx';
import Game from './components/Game.jsx';
import { decodePuzzle } from './lib/puzzle.js';

function parseLocation() {
  const raw = new URLSearchParams(window.location.search).get('word');
  if (!raw) return { mode: 'create' };
  try {
    const { word, guesses } = decodePuzzle(raw);
    return { mode: 'play', word, guesses };
  } catch {
    return { mode: 'error' };
  }
}

export default function App() {
  const parsed = useMemo(parseLocation, []);

  if (parsed.mode === 'play') {
    return <Game answer={parsed.word} maxGuesses={parsed.guesses} />;
  }
  if (parsed.mode === 'error') {
    return (
      <div className="screen create">
        <header className="header">
          <h1>Yourdle</h1>
        </header>
        <p className="error">That puzzle link looks broken.</p>
        <a className="btn primary" href={import.meta.env.BASE_URL}>
          Create your own →
        </a>
      </div>
    );
  }
  return <CreateScreen />;
}
