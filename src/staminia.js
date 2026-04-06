// Single source of truth for the Staminia namespace.
// All src modules import this; window.Staminia is set once for
// the PHP-inlined locale scripts that run after the bundle.
const Staminia = {};
window.Staminia = Staminia;

export default Staminia;
