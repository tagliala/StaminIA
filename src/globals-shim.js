// Ensure Bootstrap is available as a global before any
// module that references bare `bootstrap` identifiers.
// esbuild --inject replaces those bare references with the named
// exports below, and the globals are set during module init.

import Alert from "bootstrap/js/src/alert";
import Collapse from "bootstrap/js/src/collapse";
import Dropdown from "bootstrap/js/src/dropdown";
import Modal from "bootstrap/js/src/modal";
import Tab from "bootstrap/js/src/tab";
import Tooltip from "bootstrap/js/src/tooltip";

const bootstrap = { Alert, Collapse, Dropdown, Modal, Tab, Tooltip };
window.bootstrap = bootstrap;

export { bootstrap };
