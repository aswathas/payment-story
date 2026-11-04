# Permission does not scale at machine speed

A scroll-driven, hand-drawn explanation of autonomous payment agents, written for a smart reader who is not a payments engineer.

Six chapters: what a payment really is, who is already building this, where it breaks, how big it actually is, what we built, and the one rule that makes it safe. Every diagram is drawn with rough.js and inks itself in as you scroll.

- `index.html`, `styles.css`, `story.js`
- `vendor/rough.js` — hand-drawn SVG
- `fonts/` — self-hosted Instrument Serif, IBM Plex Sans, IBM Plex Mono

Light and dark themes, following the system preference, with a manual toggle. Motion respects `prefers-reduced-motion`; all prose is readable with scripting off.

Run locally: `python -m http.server` in this folder.
