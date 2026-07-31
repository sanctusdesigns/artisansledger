#!/usr/bin/env node
/*
 * embed_wiki_icons.js  (v1.4)
 * ---------------------------
 * Embeds real item/material icons into Artisan's Ledger so the app is fully
 * self-contained and offline. Two sets are embedded:
 *   1. Materials -> ores & bars     (WIKI_ICON_DATA,      keyed by metal)
 *   2. Items     -> smithed goods    (WIKI_ITEM_ICON_DATA, keyed "Metal|Type")
 *
 * ITEMS ARE NO LONGER HARD-CODED. This script builds the FULL matrix of every
 * metal x every item type, asks the Grand Exchange (via the Weird Gloop API)
 * which of those are real items, and embeds the official icon for each one it
 * finds. Combinations that aren't real items (e.g. "Orikalkum longsword", which
 * doesn't exist -- Orikalkum's melee line is warhammers) simply don't resolve
 * and the app draws its bar/SVG fallback. Nothing is pre-excluded by hand.
 *
 * ICON SOURCES (priority when ICON_SOURCE = "official"):
 *   1. Official Jagex Item Database sprite, by GE item ID:
 *        https://secure.runescape.com/m=itemdb_rs/obj_sprite.gif?id=<id>
 *   2. RuneScape Wiki inventory image (Special:FilePath) as a fallback.
 *   3. The app's built-in SVG / bar icon if neither resolves.
 * Set ICON_SOURCE = "wiki" to use only the RuneScape Wiki.
 *
 * LEGAL: RuneScape and all in-game item imagery are the property of Jagex Ltd,
 * used under Jagex's Fan Content Policy for a free, non-commercial fan project.
 * GE data via the Weird Gloop API. RuneScape Wiki content is CC BY-NC-SA 3.0.
 * This tool only downloads; keep the project non-commercial and attribution
 * intact. Not legal advice.
 *
 * USAGE:  node embed_wiki_icons.js "index.html"
 * Writes "index (wiki icons).html" alongside it. Requires Node 18+ (global fetch).
 */

const fs = require('fs');
const path = require('path');

// "official" = Jagex item-DB icons by GE id, wiki fallback.  "wiki" = wiki only.
const ICON_SOURCE = "official";

// =====================================================================
// MATERIALS -- ores & bars.  Value = RuneScape Wiki file name; the GE lookup
// name is the value without ".png".
// =====================================================================
const WIKI_FILES = {
  "Bronze":"Bronze bar.png", "Iron":"Iron bar.png", "Silver":"Silver bar.png",
  "Steel":"Steel bar.png", "Mithril":"Mithril bar.png", "Gold":"Gold bar.png",
  "Adamant":"Adamant bar.png", "Rune":"Runite bar.png", "Orikalkum":"Orikalkum bar.png",
  "Necronium":"Necronium bar.png", "Bane":"Bane bar.png", "Elder Rune":"Elder rune bar.png",
  "Primal":"Primal bar.png", "Platinum":"Platinum bar.png",
  "Copper Ore":"Copper ore.png", "Tin Ore":"Tin ore.png", "Iron Ore":"Iron ore.png",
  "Coal":"Coal.png", "Mithril Ore":"Mithril ore.png", "Luminite":"Luminite.png",
  "Adamantite Ore":"Adamantite ore.png", "Runite Ore":"Runite ore.png",
  "Orichalcite Ore":"Orichalcite ore.png", "Drakolith":"Drakolith.png",
  "Necrite Ore":"Necrite ore.png", "Phasmatite":"Phasmatite.png", "Banite Ore":"Banite ore.png",
  "Light Animica":"Light animica.png", "Dark Animica":"Dark animica.png",
  "Silver Ore":"Silver ore.png", "Gold Ore":"Gold ore.png", "Platinum Ore":"Platinum.png"
};

// =====================================================================
// ITEMS -- the full matrix is generated from these two tables.
// Every metal x every type is attempted; the Grand Exchange decides what's real.
// =====================================================================

// App metal name -> Grand Exchange item-name prefix. (Every metal is attempted;
// ones that don't smith equipment -- Silver, Gold, Platinum, Infernal -- simply
// won't resolve and fall back.)
const METAL_PREFIX = {
  "Bronze":"Bronze", "Iron":"Iron", "Silver":"Silver", "Steel":"Steel",
  "Mithril":"Mithril", "Gold":"Gold", "Adamant":"Adamant", "Rune":"Rune",
  "Orikalkum":"Orikalkum", "Necronium":"Necronium", "Bane":"Bane",
  "Elder Rune":"Elder rune", "Primal":"Primal", "Platinum":"Platinum",
  "Dragon":"Dragon", "Infernal":"Infernal"
};

// App item type -> candidate GE-name suffixes, tried in order (first that
// resolves to a GE id wins). Multiple candidates cover naming variants across
// tiers (e.g. "sq shield" vs "square shield", "boots" vs "armoured boots",
// "med helm" vs "helm" for Dragon, "claws" vs "claw" for Dragon).
const TYPE_CANDIDATES = {
  // Weapons
  "Dagger":["dagger"], "Sword":["sword"], "Scimitar":["scimitar"],
  "Longsword":["longsword"], "Two-handed sword":["2h sword"], "Mace":["mace"],
  "Warhammer":["warhammer"], "Battleaxe":["battleaxe"], "Halberd":["halberd"],
  "Spear":["spear"], "Claws":["claws","claw"], "Knives (throwing)":["knife"],
  "Javelin heads":["javelin heads","javelin"], "Dart tips":["dart tip"],
  "Arrowtips":["arrowheads","arrowtips"], "Bolts (unf)":["bolts (unf)"],
  // Armour -- head
  "Medium helmet":["med helm","helm"], "Full helmet":["full helm"], "Coif":["coif"],
  // Armour -- body
  "Chainbody":["chainbody"], "Platebody":["platebody"],
  // Armour -- legs
  "Platelegs":["platelegs"], "Plateskirt":["plateskirt"],
  // Armour -- shields
  "Square shield":["square shield","sq shield"], "Kiteshield":["kiteshield"],
  // Armour -- hands & feet
  "Gauntlets":["gauntlets"], "Chainskirt":["chainskirt"],
  "Metal boots":["armoured boots","boots"],
  // Tools
  "Pickaxe":["pickaxe"], "Hatchet":["hatchet"],
  // Misc / utility
  "Ore box":["ore box"], "Nails":["nails"], "Studs":["studs"], "Wire":["wire"],
  "Grapple tip":["grapple tip"], "Limbs (crossbow)":["limbs"]
};

// Build [{ key:"Metal|Type", names:[candidate GE names...] }] for the full matrix.
function buildItemCombos(){
  const combos = [];
  for(const metal of Object.keys(METAL_PREFIX)){
    const prefix = METAL_PREFIX[metal];
    for(const type of Object.keys(TYPE_CANDIDATES)){
      const names = TYPE_CANDIDATES[type].map(s => prefix + " " + s);
      combos.push({ key: metal + "|" + type, names });
    }
  }
  return combos;
}

const FILEPATH_BASE = "https://runescape.wiki/w/Special:FilePath/";
const ITEMDB_SPRITE = "https://secure.runescape.com/m=itemdb_rs/obj_sprite.gif?id=";
const GE_LATEST     = "https://api.weirdgloop.org/exchange/history/rs/latest?name=";
const UA = "ArtisansLedger-icon-embed/1.4 (personal fan project; contact via github.com/sanctusdesigns/artisansledger)";

const sleep = ms => new Promise(r => setTimeout(r, ms));
const geName = file => file.replace(/\.png$/i, "");

// Retrying binary fetch -> data URI. Retries 429/5xx/network; a 404 is final.
async function fetchBinary(url){
  let lastErr;
  for(let attempt = 0; attempt < 4; attempt++){
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
      if(res.status === 404) throw new Error("HTTP 404");
      if(res.status === 429 || res.status >= 500) throw new Error("HTTP " + res.status + " (retryable)");
      if(!res.ok) throw new Error("HTTP " + res.status);
      const type = res.headers.get("content-type") || "image/png";
      if(!/^image\//i.test(type)) throw new Error("not an image (" + type + ")");
      const buf = Buffer.from(await res.arrayBuffer());
      return "data:" + type + ";base64," + buf.toString("base64");
    } catch(e){
      lastErr = e;
      if(/HTTP 404/.test(e.message)) break;
      if(attempt < 3) await sleep(700 * (attempt + 1));
    }
  }
  throw lastErr;
}

// Resolve GE item IDs for a list of names via Weird Gloop, batched.
async function resolveGEIds(names){
  const ids = {};
  const uniq = [...new Set(names)];
  const CHUNK = 40;
  for(let i = 0; i < uniq.length; i += CHUNK){
    const chunk = uniq.slice(i, i + CHUNK);
    try {
      const res = await fetch(GE_LATEST + encodeURIComponent(chunk.join("|")),
        { headers: { "User-Agent": UA, "Accept": "application/json" } });
      if(res.ok){
        const j = await res.json();
        for(const n of Object.keys(j)){
          if(j[n] && j[n].id != null) ids[n] = String(j[n].id);
        }
      }
    } catch(e){ /* leave chunk unresolved -> wiki fallback */ }
    await sleep(250);
  }
  return ids;
}

// Materials: fixed name list, official-by-id with wiki fallback.
async function embedMaterials(){
  const keys = Object.keys(WIKI_FILES);
  let ids = {};
  if(ICON_SOURCE === "official"){
    process.stdout.write("Resolving GE ids for materials (ore & bar)... ");
    ids = await resolveGEIds(keys.map(k => geName(WIKI_FILES[k])));
    console.log(Object.keys(ids).length + " matched.");
  }
  console.log("Fetching " + keys.length + " material icons...\n");
  const data = {}; let official = 0, wiki = 0, fail = 0; const misses = [];
  for(const key of keys){
    const file = WIKI_FILES[key], name = geName(file);
    let uri = null, via = "";
    if(ICON_SOURCE === "official" && ids[name]){
      try { uri = await fetchBinary(ITEMDB_SPRITE + ids[name]); via = "official #" + ids[name]; official++; } catch(e){}
    }
    if(!uri){
      try { uri = await fetchBinary(FILEPATH_BASE + encodeURIComponent(file)); via = "wiki"; wiki++; } catch(e){}
    }
    if(uri){ data[key] = uri; process.stdout.write("  ✓ " + key + "  [" + via + "]\n"); }
    else { fail++; misses.push(key); process.stdout.write("  ✗ " + key + "\n"); }
    await sleep(120);
  }
  console.log("\nMaterials: " + official + " official + " + wiki + " wiki, " + fail + " fallback.");
  if(misses.length) console.log("  No icon: " + misses.join(", "));
  console.log("");
  return data;
}

// Items: full metal x type matrix, GE decides what's real.
async function embedItems(){
  const combos = buildItemCombos();
  const allNames = [...new Set(combos.flatMap(c => c.names))];
  console.log("Item matrix: " + combos.length + " metal x type combinations (" + allNames.length + " candidate names).");
  let ids = {};
  if(ICON_SOURCE === "official"){
    process.stdout.write("Resolving candidate item names via Weird Gloop... ");
    ids = await resolveGEIds(allNames);
    console.log(Object.keys(ids).length + " matched a real GE item.\n");
  }
  const data = {}; let official = 0, wiki = 0; const misses = [];
  for(const c of combos){
    let uri = null, via = "", id = null, resolvedName = null;
    for(const n of c.names){ if(ids[n]){ id = ids[n]; resolvedName = n; break; } }
    if(id){
      try { uri = await fetchBinary(ITEMDB_SPRITE + id); via = "official #" + id + " (" + resolvedName + ")"; official++; } catch(e){}
    }
    if(!uri){
      // Wiki fallback: try the first candidate name as a wiki file.
      try { uri = await fetchBinary(FILEPATH_BASE + encodeURIComponent(c.names[0] + ".png")); via = "wiki (" + c.names[0] + ")"; wiki++; } catch(e){}
    }
    if(uri){ data[c.key] = uri; process.stdout.write("  ✓ " + c.key + "  [" + via + "]\n"); }
    else { misses.push(c.key); }
    await sleep(120);
  }
  console.log("\nItems: " + official + " official + " + wiki + " wiki embedded, " + misses.length + " not real items (bar/SVG fallback).");
  if(misses.length){
    console.log("  These metal/type combos are not real RS3 items, so they fall back:");
    console.log("  " + misses.join(", "));
  }
  console.log("");
  return data;
}

async function main(){
  const inFile = process.argv[2];
  if(!inFile){ console.error('Usage: node embed_wiki_icons.js "index.html"'); process.exit(1); }
  const html = fs.readFileSync(inFile, "utf8");
  const hasMat  = html.includes("__WIKI_ICON_DATA_INJECT__");
  const hasItem = html.includes("__WIKI_ITEM_ICON_DATA_INJECT__");
  if(!hasMat && !hasItem){
    console.error("No injection marker found. Point this at an Artisan's Ledger 1.8.1+ build.");
    process.exit(1);
  }
  console.log("Icon source: " + ICON_SOURCE + (ICON_SOURCE === "official" ? " (Jagex item DB by GE id, RuneScape Wiki fallback)\n" : " (RuneScape Wiki only)\n"));
  let out = html; const bytesBefore = html.length;

  if(hasMat){
    const data = await embedMaterials();
    out = out.replace(
      /var WIKI_ICON_DATA = \{\};\s*\/\* __WIKI_ICON_DATA_INJECT__ \*\//,
      "var WIKI_ICON_DATA = " + JSON.stringify(data) + "; /* __WIKI_ICON_DATA_INJECT__ */"
    );
  }
  if(hasItem){
    const data = await embedItems();
    out = out.replace(
      /var WIKI_ITEM_ICON_DATA = \{\};\s*\/\* __WIKI_ITEM_ICON_DATA_INJECT__ \*\//,
      "var WIKI_ITEM_ICON_DATA = " + JSON.stringify(data) + "; /* __WIKI_ITEM_ICON_DATA_INJECT__ */"
    );
  }

  const dir = path.dirname(inFile);
  const base = path.basename(inFile).replace(/\.html$/i, "");
  const outFile = path.join(dir, base + " (wiki icons).html");
  fs.writeFileSync(outFile, out, "utf8");
  console.log("Added ~" + Math.round((out.length - bytesBefore)/1024) + " KB of embedded art.");
  console.log("Wrote: " + outFile);
}

main().catch(e => { console.error(e); process.exit(1); });
