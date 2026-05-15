#!/usr/bin/env node
// Builds public/usda-foods.json from USDA FoodData Central SR Legacy.
//
// SR Legacy is public-domain US Government data with ~7,700 generic foods
// (USDA-authoritative nutrition). We download the zip once, cache it, and
// produce a slim per-food JSON the client can fuzzy-search.
//
// Run with: node scripts/build-usda.mjs

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CACHE_DIR = resolve(ROOT, 'node_modules/.cache/usda');
const OUT = resolve(ROOT, 'public/usda-foods.json');

// Public-domain USDA bulk download (no API key required).
const ZIP_URL = 'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip';
const ZIP_PATH = resolve(CACHE_DIR, 'srlegacy.zip');

// Nutrient IDs we care about (from USDA's nutrient.csv)
const N_ENERGY  = '1008'; // Energy (kcal)
const N_PROTEIN = '1003'; // Protein (g)
const N_CARBS   = '1005'; // Carbohydrate, by difference (g)
const N_FAT     = '1004'; // Total lipid (fat) (g)

if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

if (!existsSync(ZIP_PATH)) {
  console.log('Downloading USDA SR Legacy (~30 MB)…');
  execSync(`curl -fsSL -o "${ZIP_PATH}" "${ZIP_URL}"`, { stdio: 'inherit' });
} else {
  console.log('Using cached SR Legacy zip.');
}

// Extract only the CSVs we need (zip contains many)
const NEEDED = ['food.csv', 'food_nutrient.csv'];
const have = NEEDED.every((f) => existsSync(resolve(CACHE_DIR, f)));
if (!have) {
  console.log('Extracting food.csv and food_nutrient.csv …');
  execSync(`cd "${CACHE_DIR}" && unzip -o -j srlegacy.zip "*food.csv" "*food_nutrient.csv" > /dev/null`, { stdio: 'inherit' });
}

// ───────────────────────────────────────────────────────
// Minimal RFC-4180 CSV parser (handles quoted fields, commas, newlines)
function* parseCSV(text) {
  let row = [];
  let cell = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuote = false;
      } else cell += c;
    } else if (c === '"') inQuote = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); yield row; row = []; cell = ''; }
    else if (c === '\r') { /* skip */ }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); yield row; }
}

function readCSVMap(file, keyCol, ...valCols) {
  console.log(`Reading ${file}…`);
  const text = readFileSync(resolve(CACHE_DIR, file), 'utf8');
  const rows = parseCSV(text);
  const header = rows.next().value;
  const keyIdx = header.indexOf(keyCol);
  const valIdxs = valCols.map((c) => header.indexOf(c));
  const map = new Map();
  for (const row of rows) {
    map.set(row[keyIdx], valIdxs.map((i) => row[i]));
  }
  return map;
}

// ───────────────────────────────────────────────────────
// 1. Load food.csv  -> { fdc_id: { name } }
console.log('Reading food.csv…');
const foodText = readFileSync(resolve(CACHE_DIR, 'food.csv'), 'utf8');
const foods = new Map();
{
  const it = parseCSV(foodText);
  const header = it.next().value;
  const iId = header.indexOf('fdc_id');
  const iDesc = header.indexOf('description');
  const iType = header.indexOf('data_type');
  for (const row of it) {
    if (!row[iId]) continue;
    if (row[iType] !== 'sr_legacy_food') continue;
    foods.set(row[iId], { name: row[iDesc] });
  }
}
console.log(`Loaded ${foods.size} foods.`);

// 2. Load food_nutrient.csv  -> attach per-100g macros
console.log('Reading food_nutrient.csv (this is the big one)…');
const fnText = readFileSync(resolve(CACHE_DIR, 'food_nutrient.csv'), 'utf8');
{
  const it = parseCSV(fnText);
  const header = it.next().value;
  const iFdc = header.indexOf('fdc_id');
  const iNut = header.indexOf('nutrient_id');
  const iAmt = header.indexOf('amount');
  for (const row of it) {
    const fid = row[iFdc];
    if (!foods.has(fid)) continue;
    const nid = row[iNut];
    const amt = parseFloat(row[iAmt]);
    if (!Number.isFinite(amt)) continue;
    const f = foods.get(fid);
    if (nid === N_ENERGY)  f.calories = amt;
    else if (nid === N_PROTEIN) f.protein = amt;
    else if (nid === N_CARBS)   f.carbs = amt;
    else if (nid === N_FAT)     f.fats = amt;
  }
}

// 3. Filter and slim
const round = (n) => Math.round(n * 10) / 10;
const slim = [];
for (const f of foods.values()) {
  if (!f.name) continue;
  if (!Number.isFinite(f.calories)) continue;
  // Skip near-zero food entries (probably water variants, spices in trace amounts)
  if (f.calories < 1 && (f.protein || 0) < 1 && (f.carbs || 0) < 1 && (f.fats || 0) < 1) continue;

  slim.push({
    n: f.name,                          // short keys to keep JSON small
    c: round(f.calories),
    p: round(f.protein  || 0),
    h: round(f.carbs    || 0),           // h = cHo (avoid the 'c' collision)
    f: round(f.fats     || 0),
  });
}

slim.sort((a, b) => a.n.localeCompare(b.n));

writeFileSync(OUT, JSON.stringify(slim));
console.log(`Wrote ${slim.length} USDA foods to ${OUT} (${(JSON.stringify(slim).length / 1024).toFixed(0)} KB raw)`);
