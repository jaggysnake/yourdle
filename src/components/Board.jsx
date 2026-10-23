import Row from './Row.jsx';

export default function Board({ rows, current, maxGuesses, wordLength, shake }) {
  const items = Array.from({ length: maxGuesses }, (_, r) => {
    if (r < rows.length) {
      return <Row key={r} length={wordLength} guess={rows[r].guess} statuses={rows[r].statuses} revealed />;
    }
    if (r === rows.length) {
      return <Row key={r} length={wordLength} guess={current} shake={shake} />;
    }
    return <Row key={r} length={wordLength} />;
  });
  return (
    <div className="board-wrap">
      <div className="board" style={{ '--cols': wordLength }}>
        {items}
      </div>
    </div>
  );
}
