#!/usr/bin/env node
/**
 * Translation autofix script.
 *
 * For every lang file that is missing top-level keys present in en-us.json,
 * copies the English value as a placeholder so the file reaches full parity.
 * Also ensures JAVASCRIPT_STRINGS has the same sub-keys as English.
 *
 * Run: pnpm run fix:translations
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const LANG_DIR = "lang";
const BASE_LANG = "en-us.json";

function sortedLang(lang, baseKeys) {
  const { JAVASCRIPT_STRINGS: js, ...rest } = lang;
  const sortedJs = js
    ? Object.fromEntries(Object.entries(js).sort(([a], [b]) => a.localeCompare(b)))
    : js;
  const sortedRest = Object.fromEntries(
    Object.entries(rest).sort(([a], [b]) => a.localeCompare(b))
  );
  return { JAVASCRIPT_STRINGS: sortedJs, ...sortedRest };
}

const base = JSON.parse(readFileSync(join(LANG_DIR, BASE_LANG), "utf8"));
const baseKeys = Object.keys(base).filter((k) => k !== "JAVASCRIPT_STRINGS");
const baseJsKeys = Object.keys(base.JAVASCRIPT_STRINGS ?? {});

let totalFixed = 0;

const allFiles = readdirSync(LANG_DIR).filter((f) => f.endsWith(".json")).sort();

// Also sort the base file itself
{
  const fp = join(LANG_DIR, BASE_LANG);
  const sorted = sortedLang(base, baseKeys);
  const original = readFileSync(fp, "utf8");
  const newContent = JSON.stringify(sorted, null, 2) + "\n";
  if (original !== newContent) {
    writeFileSync(fp, newContent);
    console.log(`FIX   ${BASE_LANG}: sorted keys`);
  }
}

for (const file of allFiles.filter((f) => f !== BASE_LANG)) {
  const fp = join(LANG_DIR, file);
  const lang = JSON.parse(readFileSync(fp, "utf8"));
  let changed = false;

  // Remove extra top-level keys not in English
  for (const key of Object.keys(lang)) {
    if (key !== "JAVASCRIPT_STRINGS" && !baseKeys.includes(key)) {
      delete lang[key];
      console.log(`FIX   ${file}: removed orphaned key "${key}"`);
      totalFixed++;
      changed = true;
    }
  }

  // Add missing top-level keys with English fallback
  for (const key of baseKeys) {
    if (!(key in lang)) {
      lang[key] = base[key];
      console.log(`FIX   ${file}: added missing key "${key}" (English fallback)`);
      totalFixed++;
      changed = true;
    }
  }

  // Add missing JAVASCRIPT_STRINGS sub-keys with English fallback
  if (base.JAVASCRIPT_STRINGS) {
    lang.JAVASCRIPT_STRINGS ??= {};
    for (const key of baseJsKeys) {
      if (!(key in lang.JAVASCRIPT_STRINGS)) {
        lang.JAVASCRIPT_STRINGS[key] = base.JAVASCRIPT_STRINGS[key];
        console.log(`FIX   ${file}: added missing JAVASCRIPT_STRINGS.${key} (English fallback)`);
        totalFixed++;
        changed = true;
      }
    }
    // Remove extra JAVASCRIPT_STRINGS sub-keys
    for (const key of Object.keys(lang.JAVASCRIPT_STRINGS)) {
      if (!baseJsKeys.includes(key)) {
        delete lang.JAVASCRIPT_STRINGS[key];
        console.log(`FIX   ${file}: removed orphaned JAVASCRIPT_STRINGS.${key}`);
        totalFixed++;
        changed = true;
      }
    }
  }

  const reordered = sortedLang(lang, baseKeys);
  const reorderedStr = JSON.stringify(reordered, null, 2) + "\n";
  const originalStr = readFileSync(fp, "utf8");
  if (changed || reorderedStr !== originalStr) {
    writeFileSync(fp, reorderedStr);
  }
}

if (totalFixed === 0) {
  console.log("All translation files already at parity with English.");
} else {
  console.log(`\nFixed ${totalFixed} entries across ${allFiles.length} files.`);
}
