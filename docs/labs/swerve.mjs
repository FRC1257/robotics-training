import { swerve, clamp } from "./models.mjs";
const $ = (id) => document.getElementById(id),
  ids = [
    "vx",
    "vy",
    "omega",
    "heading",
    "length",
    "width",
    "centerX",
    "centerY",
    "maxSpeed",
    "currentAngle",
  ],
  limits = {
    vx: [-5, 5],
    vy: [-5, 5],
    omega: [-10, 10],
    heading: [-360, 360],
    length: [0.1, 2],
    width: [0.1, 2],
    centerX: [-2, 2],
    centerY: [-2, 2],
    maxSpeed: [0.1, 10],
    currentAngle: [-360, 360],
  };
const presets = {
  translation: [1, 0, 0, 0, 0.6, 0.6, 0, 0, 4, 0, false, true],
  rotation: [0, 0, 2, 0, 0.6, 0.6, 0, 0, 4, 0, false, true],
  mixed: [2, 1, 3, 0, 0.6, 0.6, 0, 0, 2, 0, false, true],
  field: [1, 0, 0, 90, 0.6, 0.6, 0, 0, 4, 0, true, true],
};
function apply(name) {
  const a = presets[name];
  ids.forEach((id, i) => ($(id).value = a[i]));
  $("fieldRelative").checked = a[10];
  $("optimize").checked = a[11];
  render();
}
function render() {
  const p = {};
  ids.forEach((id) => {
    const [lo, hi] = limits[id],
      n = Number($(id).value);
    p[id] = clamp(Number.isFinite(n) ? n : 0, lo, hi);
    $(id).value = p[id];
  });
  p.heading *= Math.PI / 180;
  p.currentAngle *= Math.PI / 180;
  p.fieldRelative = $("fieldRelative").checked;
  p.optimize = $("optimize").checked;
  const r = swerve(p);
  $("result").textContent =
    `Robot-frame translation: ${r.robotVx.toFixed(2)}, ${r.robotVy.toFixed(2)} m/s. Desaturation scale: ${r.scale.toFixed(3)}.`;
  $("states").innerHTML = r.modules
    .map(
      (m) =>
        `<tr><th scope="row">${m.name}</th><td>${m.speed.toFixed(2)}</td><td>${((m.angle * 180) / Math.PI).toFixed(1)}°</td></tr>`,
    )
    .join("");
  const scale = 140 / Math.max(p.length, p.width),
    xy = (x, y) => [250 - y * scale, 200 - x * scale];
  // Colors live in labs.css (.robot-*, .plot-*, .is-*) so the diagram follows the theme.
  let html =
    '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path class="plot-point is-blue" d="M0,0 L0,6 L6,3 z"/></marker></defs>';
  const [left, top] = xy(p.length / 2, p.width / 2);
  html += `<rect class="robot-body" x="${left}" y="${top}" width="${p.width * scale}" height="${p.length * scale}"/><text x="250" y="25" text-anchor="middle">Forward (+x) ↑</text>`;
  for (const m of r.modules) {
    const [x, y] = xy(m.x, m.y),
      dx = -m.vy * 25,
      dy = -m.vx * 25;
    html += `<circle class="robot-module" cx="${x}" cy="${y}" r="5"/><line class="plot-line is-blue" x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}" stroke-width="4" marker-end="url(#arrow)"/>`;
  }
  const [cx, cy] = xy(p.centerX, p.centerY);
  html += `<text class="robot-center" x="${cx}" y="${cy}" text-anchor="middle" font-size="22">×</text>`;
  $("diagram").innerHTML = html;
}
for (const id of [...ids, "fieldRelative", "optimize"])
  $(id).addEventListener("change", render);
$("preset").onchange = () => apply($("preset").value);
$("reset").onclick = () => {
  $("preset").value = "translation";
  apply("translation");
};
render();
