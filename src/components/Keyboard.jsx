const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

export default function Keyboard({ keyStates, onKey, onEnter, onBackspace }) {
  return (
    <div className="keyboard">
      {ROWS.map((row, ri) => (
        <div className="kb-row" key={ri}>
          {ri === 2 && (
            <button type="button" className="key wide" onClick={onEnter}>
              Enter
            </button>
          )}
          {row.split('').map((ch) => (
            <button
              type="button"
              key={ch}
              className={`key ${keyStates[ch] || ''}`.trim()}
              onClick={() => onKey(ch)}
            >
              {ch.toUpperCase()}
            </button>
          ))}
          {ri === 2 && (
            <button type="button" className="key wide" onClick={onBackspace} aria-label="Backspace">
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
