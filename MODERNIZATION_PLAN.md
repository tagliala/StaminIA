# StaminIA Modernization Plan

## Overview

This document outlines the phased modernization plan for StaminIA, migrating from
a legacy Apache Ant build system to modern JavaScript tooling while preserving full
backward compatibility with the existing PHP backend.

---

## Phase 0: Build System Migration

**Status**: ✅ Complete

### Goals

- Remove the Apache Ant build system
- Implement modern build tooling with pnpm and npm scripts
- Migrate CoffeeScript compilation to the new build system
- Set up development build scripts with watch mode
- Maintain backward compatibility with the existing PHP backend

### Changes

| Before                           | After                                |
| -------------------------------- | ------------------------------------ |
| Apache Ant + Java                | pnpm + npm scripts                   |
| Manual CoffeeScript compilation  | `pnpm run build`                     |
| No watch mode                    | `pnpm run watch` for development     |
| `build/` directory with Ant XML  | `package.json` with npm scripts      |

### Decisions

- **pnpm** selected as package manager for speed, disk efficiency, and strict
  dependency resolution
- **npm scripts** used for build orchestration (no bundler needed since this is a
  PHP app with simple compilation needs)
- **coffeescript** package for CoffeeScript → JavaScript compilation
- The `less/` directory contains vendored Bootstrap 2.3.0 LESS source and is kept
  as reference only — the pre-compiled `css/bootstrap.css` is used directly
- Compiled JS output continues to go to `js/` for PHP backend compatibility

---

## Phase 0.5: Code Quality & CI

**Status**: ✅ Complete

### Goals

- Implement JavaScript linting with Biome
- Implement CSS linting with Stylelint
- Set up GitHub Actions CI workflow
- Ensure linters run on every commit and pull request
- Add pre-commit hooks with Husky and lint-staged

### Tools

| Tool        | Purpose                          |
| ----------- | -------------------------------- |
| Biome       | JavaScript linting               |
| Stylelint   | CSS linting                      |
| Husky       | Git hook management              |
| lint-staged | Run linters on staged files only |

### CI Workflow

- Runs on every push and pull request
- Steps: install dependencies → lint → build
- Uses pnpm for reproducible installs

### Linting Strategy

- **Biome**: Lints project JS files (`js/*.js`), excludes vendored libraries
  (`js/vendor/`). Configured with minimal rules appropriate for CoffeeScript-
  generated code.
- **Stylelint**: Lints custom CSS (`css/main.css`, `css/bootstrap-overload.css`),
  excludes vendored CSS (`css/bootstrap.css`, `css/bootstrap-responsive.css`,
  `css/flags.css`).

---

## Phase 1: CHPP API Migration

**Status**: ✅ Complete

### Goals

- Migrate from vendored PHT v2 to Composer-managed PHT v3
- Update authentication flows to use PHT v3 API
- Add Composer for PHP dependency management
- Add PHP linting with PHP-CS-Fixer

### Changes

| Before                                  | After                                         |
| --------------------------------------- | --------------------------------------------- |
| Vendored PHT v2.17 in `lib/PHT/`       | Composer-managed `jetwitaussi/pht` ^3.15      |
| `include '../lib/PHT/PHT.php'`          | `require __DIR__ . '/../vendor/autoload.php'` |
| `CHPPConnection` class                  | `\PHT\Connection` + `\PHT\PHT` classes        |
| `HTError` exceptions                    | `\PHT\Exception\ChppException`                |
| Serialized `$_SESSION['HT']` object     | Token-based session (`oauthToken`, `oauthTokenSecret`) |
| No PHP linter                           | PHP-CS-Fixer with @PER-CS ruleset             |
| No PHP dependency manager               | Composer                                      |

### Tasks

- [x] Add Composer with `jetwitaussi/pht` ^3.15 as runtime dependency
- [x] Add `php-cs-fixer/shim` ^3.94 as dev dependency
- [x] Create `.php-cs-fixer.dist.php` configuration
- [x] Update `config.php.example` with `getPhtConfig()` helper
- [x] Migrate `chpp_auth.php` to PHT v3 (`\PHT\Connection`)
- [x] Migrate `chpp_callback.php` to PHT v3 (`\PHT\Connection::getChppAccess()`)
- [x] Migrate `chpp_retrievedata.php` to PHT v3 (`\PHT\PHT`)
- [x] Migrate `chpp_revokeauth.php` to PHT v3 (`\PHT\Connection::deleteChppAccess()`)
- [x] Update `index.php` session logic (token-based instead of object-based)
- [x] Remove vendored `lib/PHT/` directory
- [x] Add `.editorconfig`
- [x] Format all PHP files with PHP-CS-Fixer
- [x] Update `package.json` lint scripts to include PHP

### Session Architecture Change

PHT v2 serialized the entire `CHPPConnection` object into `$_SESSION['HT']`.
PHT v3 uses a config-based approach: only OAuth tokens are stored in the session
(`$_SESSION['oauthToken']`, `$_SESSION['oauthTokenSecret']`), and `\PHT\Connection`
/ `\PHT\PHT` objects are reconstructed on each request using `getPhtConfig()`.

### Notes

- The actual `chpp/config.php` (gitignored) must be manually updated to match
  the new `config.php.example` (add `getPhtConfig()` helper, update `require`
  path to use Composer autoload)

---

## Phase 2: UI Redesign

**Status**: 📋 Planned (Future)

### Goals

- Full UI redesign with Tailwind CSS
- Replace vendored Bootstrap 2.3.0 styles
- Modernize component structure
- Ensure responsive design across all devices

### Tasks

- [ ] Install and configure Tailwind CSS in the build pipeline
- [ ] Create new design system (colors, typography, spacing)
- [ ] Migrate page layout from Bootstrap 2.x grid to Tailwind
- [ ] Redesign form inputs and player configuration panels
- [ ] Redesign results display and substitution recommendations
- [ ] Redesign charts and data visualization
- [ ] Implement responsive design for mobile and tablet
- [ ] Remove vendored Bootstrap 2.x files (`less/`, `css/bootstrap.css`,
  `css/bootstrap-responsive.css`)
- [ ] Update `index.php` templates to use new component structure
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Considerations

- Tailwind CSS will require a build step (PostCSS integration)
- Consider adding a CSS purge step for production builds
- Evaluate whether to keep jQuery or migrate to vanilla JS
- The Flash-based clipboard functionality in `plugins.coffee` should be replaced
  with the modern Clipboard API
