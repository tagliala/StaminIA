# GitHub Copilot Instructions — StaminIA Modernization

## Project Overview

StaminIA (Stamin.IA!) is a Hattrick substitutions calculator tool. It helps
Hattrick football manager players determine the optimal substitution minute based
on player stamina, form, experience, and other attributes.

### Current State

- **Backend**: PHP (index.php, localization.php, CHPP OAuth integration)
- **Frontend logic**: JavaScript sources in `src/` compiled to `dist/`
- **Stylesheets**: SCSS in `src/styles.scss`, Bootstrap 5.3.8 via npm
- **Build system**: pnpm with npm scripts (esbuild + sass)
- **Package manager**: pnpm
- **Testing**: Vitest
- **CI**: GitHub Actions

## Technology Stack

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| Package manager  | pnpm                              |
| JS bundler       | esbuild                           |
| CSS preprocessor | sass (Dart Sass)                  |
| CSS framework    | Bootstrap 5.3.8 (npm)             |
| JS linting       | Biome                             |
| CSS linting      | Stylelint                         |
| Testing          | Vitest                            |
| CI               | GitHub Actions                    |
| Pre-commit hooks | Husky + lint-staged               |
| Backend          | PHP                               |

## Code Style and Conventions

### JavaScript

- Follow the existing JavaScript style in `src/` files
- Use double quotes for strings
- Use two-space indentation
- Prefer descriptive variable names (camelCase)
- Keep functions short and focused

### CSS / SCSS

- Use two-space indentation
- Custom styles go in `src/styles.scss`
- Do not modify files in `node_modules/`

### Ruby Conventions (where applicable)

- Follow standard RuboCop guidelines for any Ruby tooling
- Use snake_case for file names and variables
- Use two-space indentation
- Prefer single quotes unless interpolation is needed

### PHP

- Follow existing conventions in the codebase
- Keep backward compatibility with the current PHP backend

## Commit Message Guidelines

- Use the **imperative mood** in the subject line (e.g., "Add feature" not "Added feature")
- Keep the subject line **concise** (under 50 characters)
- Explain **what** the change does and **why** it is needed
- Separate subject from body with a blank line
- Wrap the body at 72 characters

Examples:

```
Add esbuild bundling for JavaScript

Replace the legacy CoffeeScript compilation with esbuild for
faster builds and better tree-shaking support.
```

```
Fix stamina calculation for pressing mode
```

## Build and Development Workflow

### Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- PHP (for running the backend)
- Composer (for PHP linting)

### Commands

```bash
pnpm install       # Install dependencies
pnpm run build     # Build JS and CSS for production
pnpm run build:dev # Build JS and CSS for development (unminified)
pnpm run watch     # Watch for changes (development)
pnpm run lint      # Run all linters
pnpm run lint:js   # Lint JavaScript files (Biome)
pnpm run lint:css  # Lint CSS files (Stylelint)
pnpm run test      # Run tests (Vitest)
```

### Directory Structure

```
src/          → JavaScript and SCSS source files (project code)
dist/         → Compiled output (JS and CSS)
node_modules/ → Dependencies (do not modify)
lang/         → Localization JSON files
chpp/         → CHPP API integration (PHP)
img/          → Images and icons
test/         → Vitest test files
scripts/      → Build and utility scripts
```

### Development Workflow

1. Make changes to JavaScript/SCSS files in `src/`
2. Run `pnpm run watch` for automatic rebuild during development
3. Run `pnpm run lint` before committing
4. Run `pnpm run test` to run tests
5. Run `pnpm run build` to verify production builds

### Translation Workflow

**After any change to `lang/*.json` files, ALL of the following linters must be
run and must pass:**

```bash
pnpm run lint:translations # Validates all lang/*.json files
pnpm run lint:js           # Biome — JS may reference translation keys
pnpm run lint:css          # Stylelint — no-op but required for full green
pnpm run lint:php          # PHP CS Fixer — localization.php changes
pnpm run lint              # Run all of the above in one command (preferred)
```

These are **mandatory, not optional**. Do not consider a translation task done
until `pnpm run lint` exits with all checks green. The translation linter
(`lint:translations`) reports missing top-level keys in `lang/*.json` as
warnings — existing warnings are acceptable, but no **new** warnings may be
introduced.

**i18n architecture notes:**
- `lang/*.json` — single source of truth for all translations
- Top-level keys → used by PHP (`localization.php`) for server-rendered UI
- `JAVASCRIPT_STRINGS` nested object → used by JS via `localizeJavascript()`
- All locale files must have `JAVASCRIPT_STRINGS` with the same keys
- English (`en-us`) is the fallback: missing keys are filled per-key from `en-us`
- `best_in_first_half` uses football terminology per language (e.g. "primera
  parte" in Spanish, "première mi-temps" in French, "erste Halbzeit" in German)
- `es-CA` is Central American Spanish, not Catalan

## Testing Expectations

- All linters must pass before merging
- CI must be green on every pull request
- Build output (`dist/`) must match expected compilation results
- Tests must pass (`pnpm run test`)
- No regressions in existing PHP backend functionality
- Manual testing with a PHP server to verify the application works
