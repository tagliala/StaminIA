# GitHub Copilot Instructions — StaminIA Modernization

## Project Overview

StaminIA (Stamin.IA!) is a Hattrick substitutions calculator tool. It helps
Hattrick football manager players determine the optimal substitution minute based
on player stamina, form, experience, and other attributes.

### Current State

- **Backend**: PHP (index.php, localization.php, CHPP OAuth integration)
- **Frontend logic**: CoffeeScript sources in `coffee/` compiled to JavaScript in `js/`
- **Stylesheets**: LESS sources in `less/` compiled to CSS in `css/`
- **Build system**: pnpm with npm scripts (migrated from legacy Apache Ant)
- **Package manager**: pnpm
- **CI**: GitHub Actions

## Technology Stack

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| Package manager  | pnpm                              |
| JS compilation   | CoffeeScript (coffeescript)       |
| CSS compilation  | LESS (less)                       |
| JS linting       | Biome                             |
| CSS linting      | Stylelint                         |
| CI               | GitHub Actions                    |
| Pre-commit hooks | Husky + lint-staged               |
| Backend          | PHP                               |

## Code Style and Conventions

### JavaScript / CoffeeScript

- Follow the existing CoffeeScript style in `coffee/` files
- Use double quotes for strings
- Use two-space indentation
- Prefer descriptive variable names (camelCase)
- Keep functions short and focused

### CSS / LESS

- Use two-space indentation
- Follow the existing Bootstrap 2.x LESS conventions in `less/`
- Keep selectors specific but not overly nested

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
Add CoffeeScript compilation to build scripts

Replace the legacy Ant-based CoffeeScript compilation with a pnpm
script using the coffeescript package. This ensures the build system
works without Java dependencies.
```

```
Fix stamina calculation for pressing mode
```

## Build and Development Workflow

### Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- PHP (for running the backend)

### Commands

```bash
pnpm install          # Install dependencies
pnpm run build        # Compile CoffeeScript and LESS (production)
pnpm run build:coffee # Compile CoffeeScript only
pnpm run build:less   # Compile LESS only
pnpm run watch        # Watch for changes (development)
pnpm run lint         # Run all linters
pnpm run lint:js      # Lint JavaScript files
pnpm run lint:css     # Lint CSS/LESS files
```

### Directory Structure

```
coffee/          → CoffeeScript source files
js/              → Compiled JavaScript (output from CoffeeScript)
less/            → LESS source files (Bootstrap 2.x)
css/             → Compiled CSS (output from LESS) + custom stylesheets
chpp/            → CHPP API integration (PHP)
lang/            → Localization JSON files
lib/             → PHP libraries (PHT)
img/             → Images and icons
build/           → (removed — was legacy Ant build system)
```

### Development Workflow

1. Make changes to files in `coffee/` or `less/`
2. Run `pnpm run watch` for automatic recompilation during development
3. Run `pnpm run lint` before committing
4. Run `pnpm run build` to verify production builds

## Testing Expectations

- All linters must pass before merging
- CI must be green on every pull request
- Build output (`js/`, `css/`) must match expected compilation results
- No regressions in existing PHP backend functionality
- Manual testing with a PHP server to verify the application works
