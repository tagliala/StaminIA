#!/usr/bin/env node
/**
 * Translation JSON linter.
 *
 * Checks that:
 * 1. Every lang file has the same top-level keys as the English base.
 * 2. Specific HTML content rules are satisfied (e.g. required element IDs).
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

let errors = 0;
let warnings = 0;

const files = readdirSync(LANG_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

for (const file of files) {
  const lang = JSON.parse(readFileSync(join(LANG_DIR, file), "utf8"));
  const langKeys = new Set(Object.keys(lang));

  // 1. Missing keys (warning only — partial translations fall back gracefully)
  for (const key of baseKeys) {
    if (!langKeys.has(key)) {
      console.warn(`WARN  ${file}: missing key "${key}"`);
      warnings++;
    }
  }

  // 2. HTML content rules (error — these cause runtime JS errors)
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
  console.error(`\n${errors} error(s), ${warnings} warning(s) found.`);
  process.exit(1);
} else {
  console.log(`All ${files.length} translation files OK. (${warnings} warnings)`);
}
