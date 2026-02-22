// Ensure jQuery is available as a global before any plugin (e.g. Flot)
// that references the bare `jQuery` identifier.  esbuild --inject
// replaces those bare references with the named export below.
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;
export { jQuery };
