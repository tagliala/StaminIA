// StaminIA — single JS bundle entry point
// jQuery globals are set by src/jquery-shim.js (loaded via esbuild --inject).

import * as bootstrap from "bootstrap";
window.bootstrap = bootstrap;

import "jquery-validation";
import "flot";

import "./icons.js";
import "./main.js";
import "./plugins.js";
import "./engine.js";
