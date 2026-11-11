import { motionProfile, clamp } from "./models.mjs";
const $ = (id) => document.getElementById(id),
  limits = {
    distance: [0.01, 50],
    maxVelocity: [0.01, 10],
    maxAcceleration: [0.01, 20],
  };
function render() {
  const p = {};
  for (const id of Object.keys(limits)) {
    const [lo, hi] = limits[id],
      n = Number($(id).value);
    p[id] = clamp(Number.isFinite(n) ? n : lo, lo, hi);
    $(id).value = p[id];
  }
  const profile = (t) =>
      motionProfile(p.distance, p.maxVelocity, p.maxAcceleration, t),
    r = profile(0);
  $("result").textContent =
    `${r.cruiseTime < 1e-9 ? "Triangular" : "Trapezoidal"} profile. Duration ${r.duration.toFixed(3)} s; peak speed ${r.peakVelocity.toFixed(3)} m/s; cruise time ${r.cruiseTime.toFixed(3)} s.`;
  $("samples").innerHTML = Array.from({ length: 9 }, (_, i) => {
    const t = (r.duration * i) / 8,
      s = profile(t);
    return `<tr><td>${t.toFixed(3)}</td><td>${s.position.toFixed(3)}</td><td>${s.velocity.toFixed(3)}</td><td>${s.acceleration.toFixed(3)}</td></tr>`;
  }).join("");
}
for (const id of Object.keys(limits)) $(id).addEventListener("change", render);
$("reset").onclick = () => {
  $("distance").value = 3;
  $("maxVelocity").value = 2;
  $("maxAcceleration").value = 1;
  render();
};
render();
