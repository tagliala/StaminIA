// StaminIA — single JS bundle entry point
// Order matters: jQuery globals must be set before plugins that rely on them.

const jQuery = require("jquery");
window.$ = window.jQuery = jQuery;

const bootstrap = require("bootstrap");
window.bootstrap = bootstrap;

// Vendored jQuery plugins
require("../js/vendor/jqvalidate/jquery.validate.min.js");
require("../js/vendor/jqthrottle/jquery.ba-throttle-debounce.min.js");
require("../js/jquery.flot.js");

// Application
require("./icons.js");
require("./main.js");
require("./plugins.js");
require("./engine.js");
