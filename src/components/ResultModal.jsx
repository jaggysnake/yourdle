import { useEffect, useRef } from 'react';

const TITLE_ID = 'result-modal-title';

export default function ResultModal({ open, won, answer, onShare, shareLabel, homeHref, onClose }) {
  const dialogRef = useRef(null);

  // Focus moves into the dialog so a screen reader announces it and Escape has somewhere
  // to act from. Tab is not contained, so the content behind stays reachable -- the
  // dialog is announced as modal but is not one in the strict sense.
  useEffect(() => {
    if (!open) return undefined;
    dialogRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id={TITLE_ID}>{won ? 'You got it! 🎉' : 'Out of guesses'}</h2>
        {!won && (
          <p>
            The word was <strong>{answer.toUpperCase()}</strong>
          </p>
        )}
        <button type="button" className="btn primary" onClick={onShare}>
          {shareLabel}
        </button>
        <a className="btn" href={homeHref}>
          Create your own
        </a>
      </div>
    </div>
  );
}
