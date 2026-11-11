import { parseLogCSV } from "./models.mjs";
const $ = (id) => document.getElementById(id),
  battery = "/SystemStats/BatteryVoltage",
  velocity = "/Drive/Module0/DriveVelocityRadPerSec",
  enabled = "/DriverStation/Enabled";
function show(text, name) {
  try {
    const data = parseLogCSV(text);
    $("status").textContent =
      `Loaded ${name}: ${data.length} independent samples.`;
    const t0 = data[0].seconds,
      t1 = data.at(-1).seconds,
      span = Math.max(t1 - t0, 1e-9),
      x = (t) => 70 + ((t - t0) / span) * 760;
    const nums = (s) => data.filter((d) => d.signal === s),
      bounds = (a) => {
        const values = a.map((d) => d.value);
        let lo = Math.min(...values),
          hi = Math.max(...values);
        const pad = Math.max((hi - lo) * 0.1, 0.1);
        return [lo - pad, hi + pad];
      },
      b = nums(battery),
      v = nums(velocity),
      bs = bounds(b),
      vs = bounds(v),
      y = (n, range) => 290 - ((n - range[0]) / (range[1] - range[0])) * 240;
    // Colors live in labs.css (.plot-*, .is-*) so the figure follows the theme.
    let svg =
      '<rect class="plot-area" x="70" y="50" width="760" height="240"/>';
    const e = nums(enabled);
    for (let i = 0; i < e.length; i++)
      if (e[i].value) {
        const end = e[i + 1]?.seconds ?? t1;
        svg += `<rect class="plot-band" x="${x(e[i].seconds)}" y="50" width="${Math.max(0, x(end) - x(e[i].seconds))}" height="240"/>`;
      }
    for (const [points, range, tone] of [
      [b, bs, "is-blue"],
      [v, vs, "is-orange"],
    ])
      for (const p of points)
        svg += `<circle class="plot-point ${tone}" cx="${x(p.seconds)}" cy="${y(p.value, range)}" r="4"/>`;
    svg += `<text x="70" y="325">${t0.toFixed(2)} s</text><text x="830" y="325" text-anchor="end">${t1.toFixed(2)} s</text><text class="plot-label is-blue" x="10" y="45">${bs[1].toFixed(2)} V</text><text class="plot-label is-blue" x="10" y="295">${bs[0].toFixed(2)} V</text><text class="plot-label is-orange" x="835" y="45">${vs[1].toFixed(2)}</text><text class="plot-label is-orange" x="835" y="295">${vs[0].toFixed(2)}</text>`;
    $("plot").innerHTML = svg;
    $("scales").textContent =
      "Time in seconds. Blue points: battery voltage, left axis (V). Orange points: module 0 angular velocity, right axis (rad/s). Green shading: recorded enabled state. Absence of shading before the first transition is unknown, not proof of disabled state.";
    $("rows").replaceChildren(
      ...data.map((d) => {
        const tr = document.createElement("tr"),
          unit =
            d.signal === battery
              ? "V"
              : d.signal === velocity
                ? "rad/s"
                : "boolean";
        for (const value of [
          d.seconds.toFixed(6),
          d.timestampUs,
          d.signal,
          String(d.value),
          unit,
        ]) {
          const td = document.createElement("td");
          td.textContent = value;
          tr.append(td);
        }
        return tr;
      }),
    );
  } catch (e) {
    $("plot").replaceChildren();
    $("rows").replaceChildren();
    $("scales").textContent = "";
    $("status").textContent = `Could not load ${name}: ${e.message}`;
  }
}
async function sample() {
  try {
    const response = await fetch("../media/robots/2024-log-excerpt.csv");
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    show(await response.text(), "sample CSV");
  } catch (e) {
    $("status").textContent =
      `Sample unavailable: ${e.message}. Serve the site over HTTP or choose a local CSV.`;
  }
}
$("sample").onclick = sample;
$("file").onchange = async () => {
  const f = $("file").files[0];
  if (!f) return;
  if (f.size > 1_000_000) {
    $("plot").replaceChildren();
    $("rows").replaceChildren();
    $("scales").textContent = "";
    $("status").textContent = "File exceeds 1 MB.";
    return;
  }
  show(await f.text(), f.name);
};
sample();
