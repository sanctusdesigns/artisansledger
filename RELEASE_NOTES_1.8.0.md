# Artisan's Ledger — v1.8.0 (Pre-Release)

*A fantasy-styled ledger and interactive mining map for tracking your RuneScape 3 mining & smithing.*

This is a **pre-release** — everything below is functional, but expect a few rough edges and please send feedback.

---

## ✨ Highlights

- **New: Windows desktop app.** Artisan's Ledger now ships as a proper Windows application (Electron), in addition to the single-file web/PWA version. Custom shield-and-anvil icon, its own window, and it runs fully standalone.
- **Two ways to install on Windows:** a one-click **installer** (Start Menu + desktop shortcuts and a clean uninstaller, no admin rights needed) or a **portable** build that runs from any folder with nothing to install.
- **Still one self-contained file.** The web version remains a single HTML file — no accounts, no server, works offline as a PWA and installs to your home screen on mobile.

## 🧰 What's included

- **Metal Bank** — track exact quantities of every ore and bar, from Bronze through Primal, and deposit finished pieces into your Item Bank.
- **Work Orders** — plan the smithing items you want to craft; the app cross-references your Metal Bank and flags each order as **Ready** or **Need Mats**.
- **Item Bank** — keep an inventory of your finished, crafted items.
- **Interactive Gielinor Map** — filter by ore to highlight every mining location, pan/zoom (mouse or touch), and click a region node for a zoomed-in view of what you can gather there.
- **Autosave + manual save** — changes save automatically with a live "All changes saved" indicator; hit **Save** anytime to lock in values.
- **Backup & restore** — **Export** your ledger to a `.json` file and **Import** it back to move or restore your data.
- **Ambiance** — the **Level Up!** button fires celebratory fireworks and **Heat** stokes the forge with sound and a warmer glow.
- **Light / Dark themes** — toggle in Settings to suit your taste.

## 🖥️ Installing the Windows app

**Installer**

1. Run `Artisan's Ledger Setup 1.8.0.exe`.
2. Choose a location (or accept the default) and finish — shortcuts are added to the Start Menu and desktop.
3. Launch from the shortcut. Remove anytime via Add/Remove Programs.

**Portable**

1. Unzip the portable build anywhere (e.g. a USB drive).
2. Run `Artisan's Ledger.exe`. No installation, no shortcuts.

## ⚠️ Known limitations (Pre-Release)

- **Unsigned build.** The exe isn't code-signed yet, so Windows SmartScreen may warn on first launch — choose **More info → Run anyway**.
- **Display font needs internet the first time.** The Cinzel heading font loads from Google Fonts when online and falls back to a system serif offline; core functionality is unaffected.
- **Ore/bar art.** This build uses the built-in drawn (SVG) icons. The optional pack that embeds the real RuneScape Wiki PNGs can be baked in for fully-offline art.

## 🙏 Credits & attribution

- Built by **GM-Kayaba** — a member of **Juggleknobs**.
- Ore & bar icons courtesy of the **RuneScape Wiki**, used under **CC BY-NC-SA 3.0**.
- Thanks to **Jagex** for RuneScape.
- Source: **github.com/sanctusdesigns/artisansledger** · Support: **ko-fi.com/svnctus**

*Artisan's Ledger is a personal fan project and is not affiliated with or endorsed by Jagex.*
