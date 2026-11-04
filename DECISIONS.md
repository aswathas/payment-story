# Decisions

## 2026-11-05 · Plain language over protocol language

The reader is a smart person who does not work in payments. Every technical term is either replaced or explained in the sentence that follows it. "Nonce" becomes "a request that can only be spent once"; "mandate" becomes "the limits you signed".

## 2026-11-05 · Drawings are the argument

Each chapter is one idea plus one drawing that inks itself as you scroll. Prose stays under eighty words a screen, because a wall of text about enforcement is exactly the kind of page nobody finishes.

## 2026-11-05 · Hand-drawn, not geometric

rough.js gives the strokes a slight wobble. It reads as a working notebook rather than a diagram generator, which matches the tone: this is an argument being made, not a spec being published.

## 2026-11-05 · GSAP ScrollTrigger, vendored

Pinned scenes and scrubbed timelines need a scroll engine. GSAP is vendored locally so the page has no third-party requests and no build step; the whole site is static files.

## 2026-11-05 · Demo inside the page, not only behind a link

The separate demo was judged not understandable on its own. Chapter 06 now runs the rulebook inline, in plain English, with five cases, so the reader never has to leave to understand the product.

## 2026-11-05 · Light and dark, following the system

Two token blocks, one attribute on `<html>`, a manual toggle that overrides the system preference and is remembered. Every diagram redraws in the new ink rather than swapping colours.

## 2026-11-05 · Paginated screens instead of one continuous canvas

Sticky stages give each idea a full viewport while the drawing advances with scroll. It also means the page degrades to readable prose when scripting or motion is off.

## 2026-11-05 · Market figures are sourced or labelled

Reported cumulative payments are shown with their sources. The three-to-five trillion dollar figure appears only with the word forecast attached, because it is one.
