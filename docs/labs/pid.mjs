import { pidStep, initialPID, clamp } from "./models.mjs";
const $ = (id) => document.getElementById(id),
  ids = ["setpoint", "kp", "ki", "kd", "ff", "limit", "disturbance"];
const bounds = {
  setpoint: [-5, 5],
  kp: [0, 100],
  ki: [0, 30],
  kd: [0, 30],
  ff: [-20, 20],
  limit: [0.1, 20],
  disturbance: [-10, 10],
};
let state,
  samples,
  running = !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  saturated = 0,
  peak = 0,
  inBandSince = null,
  settled = null,
  accumulator = 0,
  previous = null;
function params() {
  const p = {};
  for (const id of ids) {
    const [lo, hi] = bounds[id],
      n = Number($(id).value);
    p[id] = clamp(Number.isFinite(n) ? n : 0, lo, hi);
    $(id).value = p[id];
  }
  return {
    ...p,
    antiwindup: $("antiwindup").checked,
    mass: 1,
    gravity: 2,
    drag: 1,
  };
}
let p = params();
function reset() {
  p = params();
  state = initialPID();
  samples = [{ ...state }];
  saturated = 0;
  peak = 0;
  inBandSince = null;
  settled = null;
  accumulator = 0;
  previous = null;
  render();
}
function step() {
  state = pidStep(state, p);
  samples.push({ ...state });
  if (samples.length > 501) samples.shift();
  if (state.saturated) saturated += 0.02;
  const direction = Math.sign(p.setpoint) || 1;
  peak = Math.max(peak, direction * (state.position - p.setpoint));
  if (Math.abs(state.position - p.setpoint) <= 0.05) {
    if (inBandSince === null) inBandSince = state.time;
    if (state.time - inBandSince >= 1) settled = inBandSince;
  } else {
    inBandSince = null;
    settled = null;
  }
}
function render() {
  const c = $("plot"),
    ctx = c.getContext("2d"),
    w = c.width,
    h = c.height;
  ctx.clearRect(0, 0, w, h);
  const positions = samples.map((s) => s.position).concat([p.setpoint, 0]);
  let min = Math.min(...positions) - 0.2,
    max = Math.max(...positions) + 0.2;
  if (max - min < 1) {
    min -= 0.5;
    max += 0.5;
  }
  const x = (i) => (i / Math.max(500, samples.length - 1)) * w,
    y = (v) => h - ((v - min) / (max - min)) * h;
  ctx.strokeStyle = "#506071";
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.moveTo(0, y(p.setpoint));
  ctx.lineTo(w, y(p.setpoint));
  ctx.stroke();
  ctx.setLineDash([]);
  for (const [key, color, convert] of [
    ["position", "#076baf", y],
    ["output", "#c45b00", (v) => h / 2 - (v / p.limit) * h * 0.5],
  ]) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    samples.forEach((s, i) => {
      if (i === 0) ctx.moveTo(x(i), convert(s[key]));
      else ctx.lineTo(x(i), convert(s[key]));
    });
    ctx.stroke();
  }
  $("plot-scale").textContent =
    `Time: ${samples[0].time.toFixed(2)}–${(samples[0].time + 10).toFixed(2)} s. Left axis: position ${min.toFixed(2)}–${max.toFixed(2)} m (blue) and setpoint (dashed). Right axis: output ±${p.limit.toFixed(2)} N (orange); zero is centered.`;
  $("sample-table").innerHTML = samples
    .filter((_, i) => i % 50 === 0 || i === samples.length - 1)
    .slice(-5)
    .map(
      (s) =>
        `<tr><td>${s.time.toFixed(2)}</td><td>${s.position.toFixed(3)}</td><td>${p.setpoint.toFixed(3)}</td><td>${s.output.toFixed(2)}</td></tr>`,
    )
    .join("");
  $("summary").textContent =
    `Time ${state.time.toFixed(2)} s · Position ${state.position.toFixed(3)} m · Error ${(p.setpoint - state.position).toFixed(3)} m · Output ${state.output.toFixed(2)} N · Overshoot ${peak.toFixed(3)} m · Saturated ${saturated.toFixed(2)} s · Settling ${settled === null ? "not currently settled" : settled.toFixed(2) + " s (within ±0.05 m for 1 s)"}`;
  $("feedback").textContent = p.antiwindup
    ? "Anti-windup is enabled. Compare the same run with it disabled."
    : "Anti-windup is disabled. Watch saturation and the accumulated response.";
}
function frame(t) {
  if (previous !== null && running && !document.hidden) {
    accumulator += Math.min((t - previous) / 1000, 0.1);
    while (accumulator >= 0.02) {
      step();
      accumulator -= 0.02;
    }
    render();
  }
  previous = t;
  requestAnimationFrame(frame);
}
$("toggle").onclick = () => {
  running = !running;
  $("toggle").textContent = running ? "Pause" : "Run";
  previous = null;
};
$("step").onclick = () => {
  running = false;
  $("toggle").textContent = "Run";
  step();
  render();
};
$("reset").onclick = reset;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    running = false;
    $("toggle").textContent = "Run";
  }
  previous = null;
});
for (const id of [...ids, "antiwindup"])
  $(id).addEventListener("change", reset);
$("preset").onchange = () => {
  const presets = {
    default: [1, 8, 0, 4, 0, 10, 0, true],
    windup: [3, 8, 5, 3, 0, 4, 0, false],
    p: [1, 8, 0, 0, 0, 10, 0, true],
  };
  const values = presets[$("preset").value];
  ids.forEach((id, i) => ($(id).value = values[i]));
  $("antiwindup").checked = values[7];
  reset();
};
reset();
$("toggle").textContent = running ? "Pause" : "Run";
requestAnimationFrame(frame);
