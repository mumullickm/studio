# Aykiz Intelligence · Studio

One live deck for every brand and build: Aykiz, Wasilah, Crisp, Drafy, Misbah, and what comes next.

Status + brand library on one screen. Curated, not scraped: everything reads from `data.json`. Update that one file and the deck (web + installed PWA + the Aykiz app tab) follows.

## Run locally

```
cd studio
python3 -m http.server 4505
# open http://localhost:4505
```

## Update the deck

Edit `data.json`. Each project carries its status, version, platforms, brand tokens (tap a swatch to copy the hex), links, and next steps. Bump `meta.updated`.

## Stack

Static. No build step. Geist for the UI, EB Garamond for the masthead only (sacred-vs-daily rule). PWA via `manifest.webmanifest` + `sw.js` (data fetched network-first so the deck stays current; shell cached for offline).

## Hosted

GitHub Pages off `main`. Installable to home screen, and embedded in the Aykiz app under the Studio tab.
