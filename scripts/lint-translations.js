#!/usr/bin/env node
/**
 * Translation JSON linter.
 *
 * Checks that:
 * 1. Every lang file has exactly the same top-level keys as the English base.
 * 2. Every lang file's JAVASCRIPT_STRINGS has exactly the same sub-keys as English.
 * 3. Specific HTML content rules are satisfied (e.g. required element IDs).
 *
 * Run `pnpm run fix:translations` to automatically fill missing keys with
 * English fallback values.
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const LANG_DIR = "lang";
const BASE_LANG = "en-us.json";

// HTML content rules for specific translation keys.
// Each entry: [humanReadableDescription, testFn(value) => boolean]
const HTML_RULES = {
  LONG_HELP: [
    [
      'must contain <a id="extraLink"> (used by the Extra tab click handler)',
      (v) => v.includes('id="extraLink"'),
    ],
  ],
};

const base = JSON.parse(readFileSync(join(LANG_DIR, BASE_LANG), "utf8"));
const baseKeys = new Set(Object.keys(base));
const baseTopLevelKeys = [...baseKeys].filter((k) => k !== "JAVASCRIPT_STRINGS");
const baseJsKeys = new Set(Object.keys(base.JAVASCRIPT_STRINGS ?? {}));
const baseJsKeysSorted = [...baseJsKeys].sort((a, b) => a.localeCompare(b));

let errors = 0;

const files = readdirSync(LANG_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

for (const file of files) {
  const lang = JSON.parse(readFileSync(join(LANG_DIR, file), "utf8"));
  const langKeys = new Set(Object.keys(lang));

  // 1. Missing top-level keys (error — run `pnpm run fix:translations` to fix)
  for (const key of baseKeys) {
    if (!langKeys.has(key)) {
      console.error(`ERROR ${file}: missing top-level key "${key}" (run fix:translations)`);
      errors++;
    }
  }

  // 2. Extra top-level keys not in English (error — remove or add to en-us.json)
  if (file !== BASE_LANG) {
    for (const key of langKeys) {
      if (!baseKeys.has(key)) {
        console.error(`ERROR ${file}: extra key "${key}" not present in ${BASE_LANG}`);
        errors++;
      }
    }
  }

  // 3. JAVASCRIPT_STRINGS sub-key parity
  const jsKeys = new Set(Object.keys(lang.JAVASCRIPT_STRINGS ?? {}));
  const jsKeysList = [...jsKeys];
  if (file !== BASE_LANG) {
    for (const key of baseJsKeys) {
      if (!jsKeys.has(key)) {
        console.error(`ERROR ${file}: missing JAVASCRIPT_STRINGS.${key} (run fix:translations)`);
        errors++;
      }
    }
    for (const key of jsKeys) {
      if (!baseJsKeys.has(key)) {
        console.error(`ERROR ${file}: extra JAVASCRIPT_STRINGS.${key} not in ${BASE_LANG}`);
        errors++;
      }
    }
  }

  // 4. JAVASCRIPT_STRINGS must be sorted alphabetically
  const jsKeysSorted = [...jsKeysList].sort((a, b) => a.localeCompare(b));
  if (JSON.stringify(jsKeysList) !== JSON.stringify(jsKeysSorted)) {
    console.error(`ERROR ${file}: JAVASCRIPT_STRINGS keys are not sorted alphabetically (run fix:translations)`);
    errors++;
  }

  // 5. Top-level keys (excluding JAVASCRIPT_STRINGS) must be sorted alphabetically
  const topKeys = Object.keys(lang).filter((k) => k !== "JAVASCRIPT_STRINGS");
  const topKeysSorted = [...topKeys].sort((a, b) => a.localeCompare(b));
  if (JSON.stringify(topKeys) !== JSON.stringify(topKeysSorted)) {
    console.error(`ERROR ${file}: top-level keys are not sorted alphabetically (run fix:translations)`);
    errors++;
  }

  // 4. HTML content rules (error — these cause runtime JS errors)
  for (const [key, rules] of Object.entries(HTML_RULES)) {
    const value = lang[key];
    if (!value) continue;
    for (const [desc, test] of rules) {
      if (!test(value)) {
        console.error(`ERROR ${file}: "${key}" — ${desc}`);
        errors++;
      }
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s) found. Run \`pnpm run fix:translations\` to auto-fix missing keys.`);
  process.exit(1);
} else {
  console.log(`All ${files.length} translation files OK.`);
}
