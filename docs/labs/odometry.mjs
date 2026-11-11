import { odometryExperiment, clamp } from "./models.mjs";
const $ = (id) => document.getElementById(id),
  limits = { drift: [0, 0.3], latencySteps: [0, 30], gain: [0, 1] };
function render() {
  const p = {};
  for (const id of Object.keys(limits)) {
    const [lo, hi] = limits[id],
      n = Number($(id).value);
    p[id] = clamp(Number.isFinite(n) ? n : lo, lo, hi);
    if (id === "latencySteps") p[id] = Math.round(p[id]);
    $(id).value = p[id];
  }
  const r = odometryExperiment(p),
    all = [...r.truth, ...r.odom, ...r.corrected],
    xs = all.map((a) => a.x),
    ys = all.map((a) => a.y),
    xmin = Math.min(...xs) - 0.2,
    xmax = Math.max(...xs) + 0.2,
    ymin = Math.min(...ys) - 0.2,
    ymax = Math.max(...ys) + 0.2,
    scale = Math.min(470 / (xmax - xmin), 280 / (ymax - ymin)),
    x = (v) => 40 + (v - xmin) * scale,
    y = (v) => 310 - (v - ymin) * scale;
  let svg =
    '<rect x="40" y="30" width="470" height="280" fill="#fff" stroke="#899"/>';
  for (const [path, color] of [
    [r.truth, "#075d93"],
    [r.odom, "#b75200"],
    [r.corrected, "#26743a"],
  ])
    svg += `<polyline fill="none" stroke="${color}" stroke-width="3" points="${path.map((p) => `${x(p.x)},${y(p.y)}`).join(" ")}"/>`;
  svg += `<text x="40" y="335">x: ${xmin.toFixed(2)}–${xmax.toFixed(2)} m; y: ${ymin.toFixed(2)}–${ymax.toFixed(2)} m</text>`;
  $("plot").innerHTML = svg;
  const last = (path) => path.at(-1),
    fmt = (p) => `(${p.x.toFixed(3)}, ${p.y.toFixed(3)}) m`;
  $("result").textContent =
    `At 10 s: truth ${fmt(last(r.truth))}; odometry ${fmt(last(r.odom))}, error ${r.odometryError.toFixed(3)} m; corrected ${fmt(last(r.corrected))}, error ${r.correctedError.toFixed(3)} m.`;
  const v = r.observations.at(-1);
  $("times").textContent = v
    ? `${r.observations.length} observations applied. Last observation captured at ${v.captureTime.toFixed(1)} s and delivered at ${v.deliveryTime.toFixed(1)} s.`
    : "No observations delivered within the run.";
}
for (const id of Object.keys(limits)) $(id).addEventListener("change", render);
$("reset").onclick = () => {
  $("drift").value = 0.04;
  $("latencySteps").value = 5;
  $("gain").value = 0.5;
  render();
};
render();
