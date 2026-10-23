import { useEffect, useState } from 'react';
import Board from './Board.jsx';
import Keyboard from './Keyboard.jsx';
import Toast from './Toast.jsx';
import ResultModal from './ResultModal.jsx';
import Header from './Header.jsx';
import { useGame } from '../hooks/useGame.js';
import { buildShareText } from '../lib/share.js';
import { loadDictionary, isLengthLoaded } from '../lib/dictionary.js';

const HOME_HREF = import.meta.env.BASE_URL;

export default function Game({ answer, maxGuesses }) {
  const wordLength = answer.length;
  const revealMs = wordLength * 300 + 400;
  const { state, onKey, onBackspace, onEnter, clearToast, clearShake } = useGame({ answer, maxGuesses });
  const [ready, setReady] = useState(isLengthLoaded(wordLength));
  const [modalOpen, setModalOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState('Share result');

  useEffect(() => {
    let active = true;
    loadDictionary(wordLength)
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [wordLength]);

  useEffect(() => {
    if (!ready) return undefined;
    const handler = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter') onEnter();
      else if (e.key === 'Backspace') onBackspace();
      else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ready, onKey, onEnter, onBackspace]);

  useEffect(() => {
    if (!state.toast) return undefined;
    const t = setTimeout(clearToast, 1200);
    return () => clearTimeout(t);
  }, [state.toast, clearToast]);

  useEffect(() => {
    if (!state.shake) return undefined;
    const t = setTimeout(clearShake, 600);
    return () => clearTimeout(t);
  }, [state.shake, clearShake]);

  useEffect(() => {
    if (state.status === 'playing') return undefined;
    const t = setTimeout(() => setModalOpen(true), revealMs);
    return () => clearTimeout(t);
  }, [state.status, revealMs]);

  const share = async () => {
    const statusesPerRow = state.rows.map((r) => r.statuses);
    const text = buildShareText({
      statusesPerRow,
      maxGuesses,
      url: window.location.href,
      won: state.status === 'won',
    });
    try {
      await navigator.clipboard.writeText(text);
      setShareLabel('Copied to clipboard!');
    } catch {
      setShareLabel('Copy failed — select & copy manually');
    }
  };

  return (
    <div className="screen game">
      <Header />
      <Toast message={state.toast} />
      {ready ? (
        <>
          <Board
            rows={state.rows}
            current={state.current}
            maxGuesses={maxGuesses}
            wordLength={wordLength}
            shake={state.shake}
          />
          <Keyboard keyStates={state.keyStates} onKey={onKey} onEnter={onEnter} onBackspace={onBackspace} />
        </>
      ) : (
        <div className="board-wrap">
          <p className="muted">Loading dictionary…</p>
        </div>
      )}
      <ResultModal
        open={modalOpen}
        won={state.status === 'won'}
        answer={answer}
        onShare={share}
        shareLabel={shareLabel}
        homeHref={HOME_HREF}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
