# Yourdle

Wordle, except you pick the word. Choose a 4–8 letter word and how many guesses your
friend gets, and Yourdle hands you a link. Everything needed to play is in that link, so
there is no account, no database and no server.

Live at **[yourdle.app](https://yourdle.app)**.

## How it works

### The link is the backend

There is no backend. A puzzle is two query parameters:

```
https://yourdle.app/?word=c2Nhcnk&guesses=6
```

`word` is the answer base64url-encoded — enough to stop a glance at the link spoiling
the puzzle, and nothing more. Anyone who decodes it can read the answer, which is a
deliberate trade for having no server to keep it on.

`guesses` is plain text. Encoding only the word keeps the link short (22 characters here
rather than 43 for the whole payload as JSON) and makes the encoded part a function of
the word alone, so two puzzles for the same word look the same regardless of the guess
count.

`src/lib/puzzle.js` owns both parameter names and every validation rule. Because a link
is entirely user-controlled and nothing validates it server-side, `decodePuzzle` is the
only thing between a hand-built query string and the game state: it type-gates both
fields, rejects a word that is not 4–8 letters of `a–z`, and rejects a guess count that
is not plain digits in range. Anything it refuses lands on a "broken link" screen.

Links created before the format changed carry base64url JSON in `word` and no `guesses`
parameter. Those still play — the absence of `guesses` is what identifies them.

### The dictionary

`public/words/len-{4..8}.txt` are the `^[a-z]+$` entries of the
[dwyl/english-words](https://github.com/dwyl/english-words) list, split by length. The
app fetches only the length a puzzle needs, then caches it in memory and in the service
worker. Regenerate with `npm run build:dict`, which reads the allowed range from
`src/lib/constants.js`.

The range and the shipped files have to agree in both directions, and a test in
`src/lib/dictionary.test.js` enforces that: a length with no list would 404 at play
time, and a list outside the range is dead weight.

### Layout

| Path | Holds |
|---|---|
| `src/lib/` | Pure logic, no React — URL codec, scoring, dictionary, share text |
| `src/hooks/useGame.js` | The game reducer: keystrokes, guesses, win/lose |
| `src/components/` | Presentation. `Game`, `CreateScreen`, `Board`, `Keyboard`, `Header` |
| `public/words/` | Per-length dictionaries |
| `scripts/` | Dictionary generation |

Scoring lives in `src/lib/evaluate.js` and handles the case naive implementations get
wrong: with a repeated letter, the number of yellow tiles is capped by how many of that
letter the answer actually contains.

### Stack

React 18, Vite 5, and `vite-plugin-pwa` for the installable/offline build. Vitest with
jsdom and Testing Library for tests. No state library, no router, no CSS framework —
`src/index.css` is plain CSS with custom properties.

GitHub Actions builds and deploys to GitHub Pages on every push to `mainline`. `BASE_PATH`
is unset for the custom domain; set it to `/yourdle/` to serve from a repo subpath.

## Run it

```bash
npm install
npm run dev        # Vite binds 0.0.0.0, so it prints a Network: URL too
npm test           # Vitest
npm run build      # static site in dist/
npm run preview    # serve the built site
```

## Contributing

Issues and pull requests are welcome.

**Keep logic out of components.** Anything with a rule in it belongs in `src/lib/` or the
reducer, where it can be tested without rendering. Components should read as markup.

**Every change needs a test that fails without it.** The suite is quick, so there is no
excuse for an untested branch. Before you call a test done, delete the code it covers and
confirm it actually fails — a test that passes either way is worse than none, because it
reads like coverage. Pure logic gets a unit test in `src/lib`; interactive behaviour gets
a Testing Library test that drives the real thing.

**Query by role and label, not by class name.** `getByRole('button', { name: 'Fewer
guesses' })` ties a test to what a user perceives. A CSS selector ties it to styling that
will change.

**Reach for the constants.** `src/lib/constants.js` holds the word-length and guess-count
bounds. Interpolate them into copy rather than writing the numbers out, so changing a
bound does not leave text behind contradicting it.

**Don't break existing links.** Shared links are the whole product and they live in other
people's chat histories. If you change the URL format, keep the old one decodable and add
a test for it.

**Mind accessibility.** Icon-only controls need an `aria-label`. Avoid `disabled` on a
control a keyboard user may be holding focus on — `aria-disabled` keeps focus and lets the
underlying guard do the work.

```bash
npm test && npm run build    # both green before you open a PR
```
