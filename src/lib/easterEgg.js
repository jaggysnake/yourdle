// Pure, DOM-free logic for the header "triple tap" easter egg.
// Kept separate from the React component so the "quick succession" rule is unit-testable.

// Three taps must all fall within this rolling window to count as "quick succession".
export const TAP_WINDOW_MS = 800;
export const TAPS_TO_TRIGGER = 3;

// Append `now` to the previous tap timestamps and drop any that fall outside the
// rolling window ending at `now`. Returns a new array (does not mutate the input).
export function recordTap(previousTaps, now, windowMs = TAP_WINDOW_MS) {
  return [...previousTaps, now].filter((t) => now - t <= windowMs);
}

// True once enough taps have accumulated inside the window.
export function shouldTrigger(taps, count = TAPS_TO_TRIGGER) {
  return taps.length >= count;
}
