export default function Tile({ letter, status, col, state }) {
  const classes = ['tile'];
  if (state === 'filled') classes.push('filled');
  if (state === 'revealed' && status) classes.push('reveal', status);
  const style = state === 'revealed' ? { '--col': col } : undefined;
  return (
    <div className={classes.join(' ')} style={style}>
      {letter}
    </div>
  );
}
