// Decorative; the enclosing button supplies the accessible name.
// Drawn rather than set as U+25B2/U+25BC, because none of the fonts in the body stack
// reliably cover those on mobile. Each glyph then resolved to whichever system font
// happened to have it, and the two arrows came out different sizes.
export default function ArrowIcon({ pointing }) {
  const points = pointing === 'up' ? '12,8 19,16 5,16' : '5,8 19,8 12,16';
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points={points} />
    </svg>
  );
}
