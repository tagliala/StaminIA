// StaminIA — single JS bundle entry point
// Order matters: jQuery globals must be set before plugins that rely on them.

import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

import * as bootstrap from "bootstrap";
window.bootstrap = bootstrap;

// Vendored jQuery plugins
import "jquery-validation";
import "flot";

// Application
import "./icons.js";
import "./main.js";
import "./plugins.js";
import "./engine.js";
