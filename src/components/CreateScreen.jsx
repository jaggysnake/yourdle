import { useState } from 'react';
import {
  MIN_WORD_LENGTH,
  MAX_WORD_LENGTH,
  MIN_GUESSES,
  MAX_GUESSES,
  DEFAULT_GUESSES,
} from '../lib/constants.js';
import { loadDictionary, isValidWord } from '../lib/dictionary.js';
import { encodePuzzle } from '../lib/puzzle.js';

function buildBase() {
  return `${window.location.origin}${import.meta.env.BASE_URL}`.replace(/\/$/, '');
}

export default function CreateScreen() {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState(DEFAULT_GUESSES);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    const w = word.trim().toLowerCase();
    setCopied(false);
    setUrl('');
    if (w.length < MIN_WORD_LENGTH || w.length > MAX_WORD_LENGTH) {
      setError(`Word must be ${MIN_WORD_LENGTH}–${MAX_WORD_LENGTH} letters`);
      return;
    }
    setError('');
    setChecking(true);
    try {
      await loadDictionary(w.length);
    } catch {
      setChecking(false);
      setError('Could not load the word list — check your connection');
      return;
    }
    setChecking(false);
    if (!isValidWord(w)) {
      setError(`"${w}" is not in the word list`);
      return;
    }
    setUrl(`${buildBase()}/?word=${encodePuzzle({ word: w, guesses })}`);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="screen create">
      <header className="header">
        <h1>Yourdle</h1>
      </header>
      <p className="tagline">
        Make a word puzzle for a friend. Pick a word (4–10 letters) and how many guesses they get, then
        share the link.
      </p>
      <label className="field">
        <span>Word ({MIN_WORD_LENGTH}–{MAX_WORD_LENGTH} letters)</span>
        <input
          value={word}
          maxLength={MAX_WORD_LENGTH}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="scary"
          onChange={(e) => setWord(e.target.value.replace(/[^a-zA-Z]/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && generate()}
        />
      </label>
      <label className="field">
        <span>Number of guesses</span>
        <input
          type="number"
          min={MIN_GUESSES}
          max={MAX_GUESSES}
          value={guesses}
          onChange={(e) => setGuesses(Math.max(MIN_GUESSES, Math.min(MAX_GUESSES, Number(e.target.value) || MIN_GUESSES)))}
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="button" className="btn primary block" onClick={generate} disabled={checking}>
        {checking ? 'Checking…' : 'Generate link'}
      </button>
      {url && (
        <div className="result-link">
          <input readOnly value={url} onFocus={(e) => e.target.select()} />
          <div className="result-actions">
            <button type="button" className="btn" onClick={copy}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <a className="btn primary" href={url}>
              Open puzzle →
            </a>
          </div>
        </div>
      )}
      <p className="muted">4–10 letter words · no account, no server</p>
    </div>
  );
}
