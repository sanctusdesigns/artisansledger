#!/usr/bin/env node
/*
 * embed_wiki_icons.js
 * -------------------
 * Downloads the real ore & bar inventory icons from the RuneScape Wiki and
 * embeds them (as base64 data URIs) directly into Artisan's Ledger, so the app
 * ships every icon it uses and needs no internet at runtime.
 *
 * The icons are used under CC BY-NC-SA 3.0 -- attribution is already shown in the
 * app's Settings panel. See https://runescape.wiki/ and
 * https://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * USAGE:
 *   node embed_wiki_icons.js "Artisan's Ledger 1.7.5 Beta.html"
 *
 * It writes a new file alongside it: "...  (wiki icons).html"
 * (Your original is never modified.)
 *
 * Requires Node 18+ (uses the built-in global fetch). No npm install needed.
 */

const fs = require('fs');
const path = require('path');

// Map each material (exactly as named in the app's METALS list) to its RuneScape
// Wiki file name. The wiki's Special:FilePath endpoint redirects to the real PNG.
const WIKI_FILES = {
  // --- Bars ---
  "Bronze":            "Bronze bar.png",
  "Iron":              "Iron bar.png",
  "Silver":            "Silver bar.png",
  "Steel":             "Steel bar.png",
  "Mithril":           "Mithril bar.png",
  "Gold":              "Gold bar.png",
  "Adamant":           "Adamant bar.png",
  "Rune":              "Runite bar.png",
  "Orikalkum":         "Orikalkum bar.png",
  "Necronium":         "Necronium bar.png",
  "Bane":              "Bane bar.png",
  "Elder Rune":        "Elder rune bar.png",
  "Primal":            "Primal bar.png",
  "Platinum":          "Platinum bar.png",
  // --- Ores ---
  "Copper Ore":        "Copper ore.png",
  "Tin Ore":           "Tin ore.png",
  "Iron Ore":          "Iron ore.png",
  "Coal":              "Coal.png",
  "Mithril Ore":       "Mithril ore.png",
  "Luminite":          "Luminite.png",
  "Adamantite Ore":    "Adamantite ore.png",
  "Runite Ore":        "Runite ore.png",
  "Orichalcite Ore":   "Orichalcite ore.png",
  "Drakolith":         "Drakolith.png",
  "Necrite Ore":       "Necrite ore.png",
  "Phasmatite":        "Phasmatite.png",
  "Banite Ore":        "Banite ore.png",
  "Light Animica":     "Light animica.png",
  "Dark Animica":      "Dark animica.png",
  "Silver Ore":        "Silver ore.png",
  "Gold Ore":          "Gold ore.png",
  "Platinum Ore":      "Platinum.png"
};

const FILEPATH_BASE = "https://runescape.wiki/w/Special:FilePath/";
// A descriptive User-Agent is required by the wiki's API etiquette.
const UA = "ArtisansLedger-icon-embed/1.0 (personal fan project; contact via github.com/sanctusdesigns/artisansledger)";

async function fetchIcon(fileName){
  const url = FILEPATH_BASE + encodeURIComponent(fileName);
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if(!res.ok) throw new Error("HTTP " + res.status + " for " + fileName);
  const buf = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get("content-type") || "image/png";
  return "data:" + type + ";base64," + buf.toString("base64");
}

async function main(){
  const inFile = process.argv[2];
  if(!inFile){
    console.error('Usage: node embed_wiki_icons.js "Artisan\'s Ledger 1.7.5 Beta.html"');
    process.exit(1);
  }
  const html = fs.readFileSync(inFile, "utf8");
  if(!html.includes("__WIKI_ICON_DATA_INJECT__")){
    console.error("Couldn't find the injection marker in that file. Make sure you're pointing at a build that has the WIKI_ICON_DATA placeholder.");
    process.exit(1);
  }

  const names = Object.keys(WIKI_FILES);
  console.log("Downloading " + names.length + " icons from the RuneScape Wiki...\n");

  const data = {};
  let ok = 0, fail = 0;
  for(const metal of names){
    try {
      data[metal] = await fetchIcon(WIKI_FILES[metal]);
      ok++;
      process.stdout.write("  \u2713 " + metal + "\n");
    } catch(e){
      fail++;
      process.stdout.write("  \u2717 " + metal + "  (" + e.message + ") -- will use the drawn SVG fallback\n");
    }
    await new Promise(r => setTimeout(r, 150)); // be polite to the wiki
  }

  // Replace the empty placeholder object with the populated one.
  const json = JSON.stringify(data);
  const out = html.replace(
    /var WIKI_ICON_DATA = \{\};\s*\/\* __WIKI_ICON_DATA_INJECT__ \*\//,
    "var WIKI_ICON_DATA = " + json + "; /* __WIKI_ICON_DATA_INJECT__ */"
  );

  const dir = path.dirname(inFile);
  const base = path.basename(inFile).replace(/\.html$/i, "");
  const outFile = path.join(dir, base + " (wiki icons).html");
  fs.writeFileSync(outFile, out, "utf8");

  const addedKB = Math.round((out.length - html.length) / 1024);
  console.log("\nDone: " + ok + " embedded, " + fail + " fell back to SVG.");
  console.log("Added ~" + addedKB + " KB of embedded art.");
  console.log("Wrote: " + outFile);
}

main().catch(e => { console.error(e); process.exit(1); });
