// Ensure jQuery and Bootstrap are available as globals before any
// module that references bare `jQuery` or `bootstrap` identifiers.
// esbuild --inject replaces those bare references with the named
// exports below, and the globals are set during module init.
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

import * as bootstrap from "bootstrap";
window.bootstrap = bootstrap;

export { jQuery, bootstrap };
