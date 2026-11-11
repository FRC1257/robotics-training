// Figure colors come from labs.css custom properties, so canvas plots follow the page theme.
// SVG figures use classes styled in labs.css and restyle themselves without a redraw.
const root = document.documentElement;
export function plotColors(element = root) {
  const css = getComputedStyle(element),
    read = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  return {
    ink: read("--plot-ink", "#182b26"),
    muted: read("--plot-muted", "#506071"),
    blue: read("--plot-blue", "#076baf"),
    orange: read("--plot-orange", "#c45b00"),
    green: read("--plot-green", "#26743a"),
  };
}
// Calls redraw whenever the lab or its parent lesson switches data-theme.
export function onThemeChange(redraw) {
  new MutationObserver(() => redraw()).observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}
