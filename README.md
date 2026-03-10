[Stamin.IA!](https://lizardopoli.altervista.org/staminia/)
=================

Stamin.IA! is the Hattrick's first substitutions calculator tool

[Hattrick](https://www.hattrick.org) is the original online football manager game, and it's free to play. Here you get to create your own club, build the team of your dreams, and compete against hundreds of thousands of real people from all over the globe.


Bug tracker
-----------

Have a bug? Please create an issue here on GitHub! Also, when filing please make sure you're familiar with [necolas's guidelines](https://github.com/necolas/issue-guidelines). thanks!

https://github.com/tagliala/StaminIA/issues


`.htaccess`
-----------------

The repository includes an `.htaccess` file for Apache that provides:

- **Security headers** — CSP, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy (requires `mod_headers`)
- **Session hardening** — HttpOnly, Secure, SameSite=Lax cookies and strict
  mode (requires `mod_php`)
- **Gzip compression** (requires `mod_deflate`)
- **Far-future expires** for static assets (requires `mod_expires`)
- **www-stripping redirect** (requires `mod_rewrite`)

**HSTS:** The `Strict-Transport-Security` header is commented out by default.
Uncomment it once HTTPS is confirmed in production:

```apache
Header set Strict-Transport-Security "max-age=63072000; includeSubDomains"
```

If you are using Nginx or another web server, add the equivalent
configuration for headers, compression, and session settings.

**Planned PHP upgrade:** The project currently keeps some compatibility
workarounds for PHP 7.3 environments. When the runtime baseline is raised,
we should migrate to **PHP 8.4** and remove those 7.3-specific workarounds
(including compatibility-oriented linter/runtime settings).


Developers
----------

### Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- PHP (for running the backend)

### Installation

```bash
pnpm install       # Install Node.js dependencies
composer install   # Install PHP dependencies
```

### Commands

```bash
pnpm run build     # Compile JavaScript and CSS for production
pnpm run build:dev # Compile without minification (development)
pnpm run watch     # Watch for changes and recompile (development)
pnpm run lint      # Run all linters (JS, CSS, PHP, translations)
pnpm run lint:js   # Lint JavaScript files (Biome)
pnpm run lint:css  # Lint CSS/SCSS files (Stylelint)
pnpm run lint:php  # Lint PHP files (PHP CS Fixer)
pnpm test          # Run tests with Vitest
```



Internationalization (i18n)
---------------------------

Please check out our wiki: [Internationalization-I18n-guide](https://github.com/tagliala/StaminIA/wiki/Internationalization-I18n-guide)



Contributing
------------

Please make all pull requests against develop branch.



Authors
-------

**Geremia Taglialatela**

+ https://github.com/tagliala



Copyright and license
---------------------

**Stamin.IA!** is licensed under the BSD 2-Clause License

Bootstrap is licensed under the MIT License

Chart.js is licensed under the MIT License

@popperjs/core is licensed under the MIT License

Font Awesome Free code is licensed under the MIT License

Font Awesome Free icons are licensed under the CC BY 4.0 License

PHT is licensed under the LGPL-3.0 License

This product includes PHP, freely available from <https://www.php.net/>



Thanks
---------------------

Special thanks to Mark James for [FAMFAMFAM flag icons](https://github.com/legacy-icons/famfamfam-flags)


#### Translators
* cl_lime (8795775) - Deutsch
* MBJames (4814342) - English (US)
* panitinho (6225560) - Español
* courpot (9571012) - Français
* Lizardopoli (5246225) and LudovR (9878845) - Italiano
* dzsoo (9668661) - Magyar
* Dockseven (809784) - Nederlands
* LA-Heggland (695472) - Norsk
* bigs_ (5775947) - Português (Portugal)
* Izozimo (1325602) - Svensk
* FB-Utku (5081202) - Türkçe
* Dockseven (809784) - Vlaams
* tsaloo (9530688) - Ελληνικά
* deBurgos (9663917) - Русский


#### Statistics and mathematics
* GM-Andreac (7790187)
* Danfisico (3232936)
* Cuomos (4052076)


#### Testers
* Hiddink14 (9141503)
* sulce (9767434)
* Shinobi-fisc (7328722)
* taccola (7541533)
* Cacchino (11389955)
* -Materasso- (7313267)
* arezzowave (11613695)
* trigrottro (10193531)
* Manny_Ray-BSK (6506224)
* Federation "L'Antica Osteria da Ciccio" (91634)
* Federation "DAC - Crick & Croack" (37817)
