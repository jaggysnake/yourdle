import Tile from './Tile.jsx';

export default function Row({ length, guess = '', statuses = null, revealed = false, shake = false }) {
  const letters = Array.from({ length }, (_, i) => guess[i] || '');
  const classes = shake ? 'row invalid' : 'row';
  return (
    <div className={classes}>
      {letters.map((ch, i) => (
        <Tile
          key={i}
          col={i}
          letter={ch.toUpperCase()}
          status={revealed && statuses ? statuses[i] : null}
          state={revealed ? 'revealed' : ch ? 'filled' : 'empty'}
        />
      ))}
    </div>
  );
}
