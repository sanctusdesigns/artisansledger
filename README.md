# Artisan's Ledger

A fantasy-styled **ledger and interactive mining map** for tracking your **RuneScape 3** mining & smithing. It's a single self-contained HTML file — no accounts, no server — and it also builds into a Windows desktop app.

> Personal fan project. Not affiliated with or endorsed by Jagex.

## Use it

- **Web / offline:** open [`index.html`](index.html) in any modern browser. It works offline and installs as a PWA (add to home screen on mobile).
- **Windows desktop:** grab the latest installer or portable build from the [Releases](https://github.com/sanctusdesigns/artisansledger/releases) page.

## Features

- **Metal Bank** — track exact quantities of every ore and bar (Bronze → Primal).
- **Work Orders** — plan smithing jobs; the app checks your Metal Bank and marks each order **Ready** or **Need Mats**.
- **Item Bank** — inventory of your finished, crafted items.
- **Interactive Gielinor Map** — filter by ore to highlight mining locations; pan/zoom and open region details.
- **Autosave + manual save**, with **Export / Import** of your ledger as `.json`.
- **Ambiance** — Level Up fireworks and a Heat forge-stoke effect; light/dark themes.

## Build the desktop app

Requires **Node.js 18+**.

```bash
npm install
npm run dist        # -> dist/ : NSIS installer, portable .exe, and a zip (Windows x64)
npm start           # run without packaging
```

### Optional: embed the real RuneScape Wiki icons

By default the app uses built-in drawn (SVG) icons. To bake in the real ore/bar
PNGs from the RuneScape Wiki (downloads ~32 images; needs internet), run this
once **before** building:

```bash
npm run embed-icons     # writes "index.html (wiki icons).html"
```

Then replace `index.html` with the generated file and build. See
[`RELEASE_NOTES_1.8.0.md`](RELEASE_NOTES_1.8.0.md) for what's in the current release.

## Repository layout

```
index.html               The app (single self-contained file; also GitHub-Pages hostable)
main.js                  Electron main process
package.json             App metadata + electron-builder config
build/icon.ico|.png      App icon
embed_wiki_icons.js      Optional tool to embed RuneScape Wiki icons
RELEASE_NOTES_1.8.0.md   Release notes
NOTICE.md                Third-party attribution
```

The packaged installer/exe are published as **Release assets**, not committed to the repo.

## Credits & license

- Built by **GM-Kayaba** — a member of **Juggleknobs**. Support: [ko-fi.com/svnctus](https://ko-fi.com/svnctus).
- Ore & bar icons courtesy of the **RuneScape Wiki**, used under **CC BY-NC-SA 3.0** — see [`NOTICE.md`](NOTICE.md).
- Add your chosen license for the application **code** in a `LICENSE` file at the repo root. (Note: the Wiki icons are non-commercial / share-alike, which constrains redistribution of any build that embeds them.)
