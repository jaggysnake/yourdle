# Yourdle

A Wordle-style game where **you pick the word and how many guesses**, then share a
link. The whole puzzle is encoded in the URL — there is **no backend** and nothing is
stored across sessions.

- Landing page: enter a 5-letter word + a guess count → get a shareable link.
- Share link (`?word=<base64url>`): plays exactly like Wordle (colors, keyboard, flip
  reveal, shake on invalid words), validating guesses against a bundled 12,970-word
  dictionary.
- Installable PWA; works offline after first load.

## Run locally

```bash
npm install
npm run dev
```

Vite binds to `0.0.0.0`, so it prints a `Network:` URL as well as `localhost`.

### Reaching it from your Mac (cloud desktop → Mac)

The dev server runs on the cloud desktop. From your Mac, SSH-tunnel the port:

```bash
ssh -N -L 5173:localhost:5173 <your-cloud-desktop-host>
```

Then open `http://localhost:5173` in your Mac browser. (Use the same pattern with
`4173` for `npm run preview`, which serves the production build.)

## Test

```bash
npm test          # Vitest: encoding, scoring, dictionary, share text, reducer
```

## Build

```bash
npm run build     # static site in dist/
npm run preview   # serve the built site (also on 0.0.0.0)
```

## Regenerate the dictionary

`src/data/words.txt` is the union of the Wordle answer list and allowed-guess list,
filtered to `^[a-z]{5}$`. To rebuild it:

```bash
npm run build:dict
```

## Publish to GitHub

```bash
git init && git add -A && git commit -m "Initial commit"
git branch -M mainline
git remote add origin git@github.com:<you>/yourdle.git
git push -u origin mainline
```

## Hosting (free, custom domain, auto-deploy on push)

All four below are free for a static site and redeploy automatically when you push to
your default branch — which satisfies the "mainline commit pushes to host" stretch goal
with **zero CI code** (they build from the connected repo):

| Host | Custom domain | Notes |
|------|---------------|-------|
| **Cloudflare Pages** (recommended) | Easiest — they can run your DNS, free managed TLS | Unlimited bandwidth, global CDN. Connect repo → build `npm run build`, output `dist`. |
| Netlify | Easy, free managed TLS | Connect repo, same build/output. Generous free tier. |
| Vercel | Easy, free managed TLS | Connect repo, same build/output. |
| GitHub Pages | Supported via `CNAME` | Uses the included workflow (below). Project sites need a base path (see note). |

**Recommendation:** use **Cloudflare Pages** if you want the smoothest custom-domain
experience, since you can keep the domain's DNS there too. For an all-in-GitHub setup,
GitHub Pages works via the included `.github/workflows/deploy.yml`.

### GitHub Pages specifics

- The workflow builds and deploys on every push to `mainline`/`main`.
- Enable Pages: repo **Settings → Pages → Source: GitHub Actions**.
- **Custom domain** → set it in Settings → Pages; base path stays `/` (leave the
  `BASE_PATH` repo variable unset).
- **No custom domain** (served at `https://<you>.github.io/yourdle/`) → set a repo
  **variable** `BASE_PATH` to `/yourdle/` so asset URLs resolve.

The third-party hosts (Cloudflare/Netlify/Vercel) don't need the workflow at all —
delete it if you go that route.

## How the link works

The creator's choice is serialized as JSON and base64url-encoded into `?word=`:

```
{ "word": "scary", "guesses": 4 }
  → eyJ3b3JkIjoic2NhcnkiLCJndWVzc2VzIjo0fQ
  → https://yourdle.com/?word=eyJ3b3JkIjoic2NhcnkiLCJndWVzc2VzIjo0fQ
```

Decoding is defensive: the word must be 5 letters `a–z` and the guess count 1–10, or the
app shows a friendly "broken link" screen.
