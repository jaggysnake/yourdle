export default function ResultModal({ open, won, answer, onShare, shareLabel, homeHref, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{won ? 'You got it! 🎉' : 'Out of guesses'}</h2>
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
