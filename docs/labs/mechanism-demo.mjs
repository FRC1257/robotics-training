// Shared UI for the seven mechanism demos (mechanism-*.html, body[data-demo]).
// Behavior comes only from mechanism-models.mjs, an original JavaScript teaching model.
// The drawings are conceptual schematics driven by that model's state; the related team
// source is shown read-only as text and is never executed.
const $ = (id) => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";
const DT = 0.02; // model step, s
const MAX_FRAME = 0.1; // bounded catch-up per animation frame, s (at most 5 steps)
const HISTORY = 300; // plotted samples (6 s)
const WHEEL_SLOWDOWN = 25; // flywheel spokes are drawn 25x slower than modelled to avoid aliasing
const page = document.documentElement;
const DEMO = document.body.dataset.demo;
const embedded = page.dataset.embed === "1";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

// ---------- small helpers ----------
function make(ns, tag, attrs = {}, parent = null, text) {
  const node = ns
    ? document.createElementNS(ns, tag)
    : document.createElement(tag);
  for (const [key, value] of Object.entries(attrs))
    if (value !== undefined && value !== null && value !== false)
      node.setAttribute(key, value === true ? "" : String(value));
  if (text !== undefined) node.textContent = text;
  if (parent) parent.append(node);
  return node;
}
const h = (tag, attrs, parent, text) => make(null, tag, attrs, parent, text);
const S = (tag, attrs, parent, text) => make(NS, tag, attrs, parent, text);
function set(node, attrs) {
  for (const [key, value] of Object.entries(attrs))
    node.setAttribute(key, String(value));
  return node;
}
const show = (node, on) => node.classList.toggle("is-hidden", !on);
const setText = (node, text) => {
  if (node.textContent !== text) node.textContent = text;
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const toDeg = (rad) => (rad * 180) / Math.PI;
const r1 = (n) => Math.round(n * 10) / 10;
function fmt(value, digits = 2) {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value !== "number" || !Number.isFinite(value))
    return String(value);
  const text = value.toFixed(digits);
  return /^-0(\.0+)?$/.test(text) ? text.slice(1) : text;
}
const degText = (rad) => `${fmt(toDeg(rad), 1)}°`;
// Screen-space arc; angles in radians measured clockwise from +x because SVG y points down.
function arc(cx, cy, r, a0, a1) {
  const p = (a) => `${r1(cx + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))}`;
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0,
    sweep = a1 > a0 ? 1 : 0;
  return `M${p(a0)}A${r} ${r} 0 ${large} ${sweep} ${p(a1)}`;
}
function sector(cx, cy, r0, r1_, a0, a1) {
  const p = (r, a) => `${r1(cx + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))}`;
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  if (r0 <= 0)
    return `M${cx} ${cy}L${p(r1_, a0)}A${r1_} ${r1_} 0 ${large} 1 ${p(r1_, a1)}Z`;
  return `M${p(r0, a0)}L${p(r1_, a0)}A${r1_} ${r1_} 0 ${large} 1 ${p(r1_, a1)}L${p(r0, a1)}A${r0} ${r0} 0 ${large} 0 ${p(r0, a0)}Z`;
}
function link(href, text, parent) {
  const a = h("a", { href }, parent, text);
  if (embedded) a.target = "_top";
  return a;
}

// ---------- shared drawing parts ----------
function addDefs(svg) {
  const defs = S("defs", {}, svg);
  const hatch = S(
    "pattern",
    {
      id: "m-hatch",
      width: 7,
      height: 7,
      patternUnits: "userSpaceOnUse",
      patternTransform: "rotate(45)",
    },
    defs,
  );
  S("line", { x1: 0, y1: 0, x2: 0, y2: 7, class: "m-hatch-line" }, hatch);
  for (const kind of ["", "actual", "goal", "sense"]) {
    const marker = S(
      "marker",
      {
        id: "m-arrow" + (kind ? "-" + kind : ""),
        viewBox: "0 0 10 10",
        refX: 7,
        refY: 5,
        markerWidth: 4,
        markerHeight: 4,
        orient: "auto-start-reverse",
      },
      defs,
    );
    S(
      "path",
      {
        d: "M0 0L10 5L0 10z",
        class: "m-arrowhead" + (kind ? " is-" + kind : ""),
      },
      marker,
    );
  }
  return defs;
}
// Phase tag in the drawing's top-right corner (the same text is also in #mech-phase).
function phaseTag(svg, width) {
  const g = S("g", { class: "m-tag" }, svg);
  const box = S("rect", { class: "m-tag-box", rx: 4, y: 6, height: 21 }, g);
  const text = S("text", { x: width - 15, y: 21, "text-anchor": "end" }, g);
  let last = "";
  return (label, tone) => {
    g.setAttribute("class", "m-tag" + (tone ? " is-" + tone : ""));
    if (label === last) return;
    last = label;
    text.textContent = label;
    let w = 0;
    try {
      w = text.getComputedTextLength();
    } catch {}
    if (!w) w = label.length * 7.2;
    set(box, { x: width - 22 - w, width: w + 14 });
  };
}
// Obstruction is an input the user sets; it is drawn as a hatched marker, never as contact.
function obstacle(parent, x, y, w, ht, labelY = y - 6) {
  const g = S("g", { class: "is-hidden" }, parent);
  S("rect", { x, y, width: w, height: ht, rx: 3, class: "m-obstacle" }, g);
  S(
    "text",
    {
      x: x + w / 2,
      y: labelY,
      "text-anchor": "middle",
      class: "m-label m-fault-text",
    },
    g,
    "obstruction (input)",
  );
  return g;
}
// A sensor glyph: green when its input is true, dashed red with "?" when readings are untrusted.
function sensorGroup(parent) {
  const g = S("g", {}, parent);
  return {
    g,
    update(on, trusted = true) {
      g.classList.toggle("is-on", !!on);
      g.classList.toggle("is-untrusted", !trusted);
    },
  };
}
function untrustedText(v) {
  return !v.inputs.sensorValid ? "invalid" : v.inputs.stale ? "stale" : "";
}
function ruler(parent, x, y0, pxPerM, maxM, stepM, labelEvery, side = "left") {
  const g = S("g", { class: "m-ruler-group" }, parent);
  S(
    "line",
    { x1: x, y1: y0, x2: x, y2: y0 - maxM * pxPerM, class: "m-ruler" },
    g,
  );
  const n = Math.round(maxM / stepM);
  for (let i = 0; i <= n; i++) {
    const m = i * stepM,
      y = y0 - m * pxPerM,
      major = i % labelEvery === 0;
    S(
      "line",
      { x1: x - (major ? 6 : 3), y1: y, x2: x, y2: y, class: "m-ruler" },
      g,
    );
    if (major)
      S(
        "text",
        {
          x: side === "left" ? x - 9 : x + 9,
          y: y + 4,
          "text-anchor": side === "left" ? "end" : "start",
          class: "m-label m-value",
        },
        g,
        `${fmt(m, 1)}${i === n ? " m" : ""}`,
      );
  }
  return g;
}
// Pointer triangles on a ruler: blue for model state, orange outline for the goal.
function pointer(parent, cls) {
  return S("path", { class: cls, d: "M0 0L-9 -5V5Z" }, parent);
}
// Flywheel speed gauge with the readiness band (±tol around the requested speed).
function gauge(parent, cx, cy, r, max, label) {
  const A0 = (150 * Math.PI) / 180,
    SW = (240 * Math.PI) / 180,
    ang = (v) => A0 + clamp(v / max, 0, 1) * SW,
    g = S("g", {}, parent);
  S(
    "text",
    { x: cx, y: cy - r - 9, "text-anchor": "middle", class: "m-label-strong" },
    g,
    label,
  );
  S("path", { d: arc(cx, cy, r, A0, A0 + SW), class: "m-track" }, g);
  const band = S("path", { class: "m-gauge-band" }, g),
    value = S("path", { class: "m-gauge-value" }, g);
  for (let k = 0; k <= 4; k++) {
    const a = ang((max * k) / 4),
      c = Math.cos(a),
      s = Math.sin(a);
    S(
      "line",
      {
        x1: cx + (r - 10) * c,
        y1: cy + (r - 10) * s,
        x2: cx + (r - 5) * c,
        y2: cy + (r - 5) * s,
        class: "m-line m-thin",
      },
      g,
    );
    if (k % 2 === 0)
      S(
        "text",
        {
          x: cx + (r - 19) * c,
          y: cy + (r - 19) * s + 4,
          "text-anchor": "middle",
          class: "m-label m-minor",
        },
        g,
        String((max * k) / 4),
      );
  }
  const tick = S("line", { class: "m-goal-tick" }, g),
    needle = S("line", { class: "m-actual" }, g);
  S("circle", { cx, cy, r: 4, class: "m-dark" }, g);
  const text = S(
      "text",
      {
        x: cx,
        y: cy + r * 0.55 + 6,
        "text-anchor": "middle",
        class: "m-actual-text m-value",
      },
      g,
    ),
    goalText = S(
      "text",
      {
        x: cx,
        y: cy + r * 0.55 + 20,
        "text-anchor": "middle",
        class: "m-label m-goal-text m-value",
      },
      g,
    ),
    sensor = sensorGroup(g);
  S(
    "circle",
    { cx: cx + r * 0.62, cy: cy - r * 0.62, r: 4, class: "m-sensor" },
    sensor.g,
  );
  return (actual, goal, tol, trustedLabel) => {
    const a = ang(actual);
    set(value, { d: actual > 0.5 ? arc(cx, cy, r, A0, a) : "" });
    set(needle, {
      x1: cx,
      y1: cy,
      x2: cx + (r - 12) * Math.cos(a),
      y2: cy + (r - 12) * Math.sin(a),
    });
    show(tick, goal > 0);
    show(band, goal > 0);
    if (goal > 0) {
      const ga = ang(goal);
      set(tick, {
        x1: cx + (r - 13) * Math.cos(ga),
        y1: cy + (r - 13) * Math.sin(ga),
        x2: cx + (r + 7) * Math.cos(ga),
        y2: cy + (r + 7) * Math.sin(ga),
      });
      set(band, {
        d: arc(cx, cy, r, ang(goal * (1 - tol)), ang(goal * (1 + tol))),
      });
    }
    sensor.update(true, !trustedLabel);
    setText(text, `${fmt(actual, 0)} rad/s${trustedLabel ? " ?" : ""}`);
    return goalText;
  };
}

// ---------- per-family drawings ----------
// Each build(svg) draws the static parts once and returns update(view).
// view: { state, inputs, desc, out, gate, fault, run, homed, trusted, vis, geometry }
const RENDER = {};

RENDER["fixed-shooter"] = (svg) => {
  const g = S("g", {}, svg);
  S(
    "text",
    { x: 12, y: 20, class: "m-label m-minor" },
    g,
    "Side view · schematic, not to scale",
  );
  // Feed path from the hopper (progress 0) to the flywheel entry (progress 1).
  const A = { x: 62, y: 214 },
    B = { x: 284, y: 170 },
    dx = B.x - A.x,
    dy = B.y - A.y,
    len = Math.hypot(dx, dy),
    n = { x: -dy / len, y: dx / len };
  const at = (t, off = 0) => ({
    x: A.x + dx * t + n.x * off,
    y: A.y + dy * t + n.y * off,
  });
  const lo0 = at(-0.14, 16),
    lo1 = at(1.02, 16);
  S(
    "path",
    {
      d: `M${lo0.x} ${lo0.y}L${lo1.x} ${lo1.y}L${lo1.x} 262L${lo0.x} 262Z`,
      class: "m-steel-2",
    },
    g,
  );
  S("line", { x1: 24, y1: 262, x2: 460, y2: 262, class: "m-floor" }, g);
  for (const [t0, t1] of [
    [-0.14, 0.33],
    [0.45, 0.69],
    [0.81, 1.0],
  ]) {
    const p = at(t0, -16),
      q = at(t1, -16);
    S("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, class: "m-line" }, g);
  }
  S("text", { x: 34, y: 196, class: "m-label m-minor" }, g, "hopper");
  // Side plate and the flywheel pair.
  S(
    "rect",
    { x: 292, y: 80, width: 76, height: 182, rx: 8, class: "m-steel" },
    g,
  );
  const wheels = [
    { c: { x: 330, y: 125 }, dir: -1 },
    { c: { x: 330, y: 217 }, dir: 1 },
  ].map(({ c, dir }) => {
    const outer = S("g", {}, g);
    S("circle", { cx: c.x, cy: c.y, r: 36, class: "m-steel-2" }, outer);
    const rot = S("g", {}, outer);
    const blur = S("circle", { cx: c.x, cy: c.y, r: 31, class: "m-blur" }, rot);
    for (let k = 0; k < 5; k++) {
      const a = (k * 2 * Math.PI) / 5;
      S(
        "line",
        {
          x1: c.x,
          y1: c.y,
          x2: c.x + 27 * Math.cos(a),
          y2: c.y + 27 * Math.sin(a),
          class: "m-line",
        },
        rot,
      );
    }
    S("circle", { cx: c.x + 30, cy: c.y, r: 3.5, class: "m-actual-fill" }, rot);
    S("circle", { cx: c.x, cy: c.y, r: 8, class: "m-dark" }, outer);
    return { c, dir, rot, blur };
  });
  S(
    "text",
    { x: 330, y: 74, "text-anchor": "middle", class: "m-label" },
    g,
    "flywheels",
  );
  // Encoder on the top wheel feeds the gauge.
  S("path", { d: "M338 118H360L396 104", class: "m-beam-line" }, g);
  S("text", { x: 300, y: 270 + 14, class: "m-label m-minor" }, g, "");
  const gaugeUpdate = gauge(g, 410, 96, 38, 400, "Flywheel (rad/s)");
  // Feed rollers above the path; they turn only while the model requests feed.
  const rollers = [0.39, 0.75].map((t) => {
    const c = at(t, -25),
      rot = S("g", {}, g);
    S("circle", { cx: c.x, cy: c.y, r: 10, class: "m-dark" }, rot);
    for (let k = 0; k < 3; k++) {
      const a = (k * 2 * Math.PI) / 3;
      S(
        "line",
        {
          x1: c.x,
          y1: c.y,
          x2: c.x + 8 * Math.cos(a),
          y2: c.y + 8 * Math.sin(a),
          class: "m-line",
        },
        rot,
      );
    }
    return { c, rot };
  });
  const feedLabel = S(
    "text",
    {
      x: at(0.57, -44).x,
      y: at(0.57, -44).y,
      "text-anchor": "middle",
      class: "m-label",
    },
    g,
    "feed rollers",
  );
  // Piece sensor across the path.
  const sensor = sensorGroup(g),
    e = at(0.12, -27),
    rcv = at(0.12, 27);
  S(
    "line",
    { x1: e.x, y1: e.y, x2: rcv.x, y2: rcv.y, class: "m-beam-line" },
    sensor.g,
  );
  S(
    "rect",
    { x: e.x - 6, y: e.y - 5, width: 12, height: 9, rx: 2, class: "m-sensor" },
    sensor.g,
  );
  S(
    "rect",
    {
      x: rcv.x - 6,
      y: rcv.y - 4,
      width: 12,
      height: 9,
      rx: 2,
      class: "m-sensor",
    },
    sensor.g,
  );
  const sensorText = S(
    "text",
    { x: e.x, y: e.y - 10, "text-anchor": "middle", class: "m-label" },
    g,
    "piece sensor",
  );
  const piece = S("circle", { r: 13, class: "m-piece" }, g);
  S(
    "path",
    { d: "M372 171H392M386 165L392 171L386 177", class: "m-line m-minor" },
    g,
  );
  S(
    "text",
    { x: 380, y: 160, "text-anchor": "middle", class: "m-label m-minor" },
    g,
    "exit",
  );
  const obst = obstacle(g, 402, 154, 30, 36, 206);
  S(
    "text",
    { x: 20, y: 42, class: "m-label-strong" },
    g,
    "Top view: chassis aim",
  );
  S("circle", { cx: 62, cy: 82, r: 25, class: "m-line" }, g);
  const chassisArrow = S(
    "line",
    { x1: 62, y1: 82, class: "m-actual", "marker-end": "url(#m-arrow-actual)" },
    g,
  );
  const headingGoal = S(
    "line",
    { x1: 62, y1: 82, class: "m-goal", "marker-end": "url(#m-arrow-goal)" },
    g,
  );
  const headingReadout = S(
    "text",
    { x: 100, y: 78, class: "m-label m-value" },
    g,
  );
  const headingGoalText = S(
    "text",
    { x: 100, y: 95, class: "m-goal-text m-value" },
    g,
  );
  const status = S("text", { x: 14, y: 288, class: "m-label m-value" }, g);
  return (v) => {
    const speed = v.state.velocityRadPerSec ?? 0,
      goal = v.out.flywheelTargetRadPerSec ?? 0,
      untrusted = untrustedText(v);
    for (const w of wheels) {
      const angle = v.reduced ? 0 : w.dir * toDeg(v.vis.wheel);
      set(w.rot, { transform: `rotate(${r1(angle)} ${w.c.x} ${w.c.y})` });
      w.blur.style.opacity = v.reduced
        ? 0
        : String(clamp(speed / 260, 0, 0.85));
    }
    const heading = v.geometry.chassisHeadingRad ?? 0,
      desiredHeading = wrap(v.inputs.targetHeadingRad ?? 0);
    set(chassisArrow, {
      x2: 62 + 24 * Math.cos(heading),
      y2: 82 - 24 * Math.sin(heading),
    });
    set(headingGoal, {
      x2: 62 + 29 * Math.cos(desiredHeading),
      y2: 82 - 29 * Math.sin(desiredHeading),
    });
    setText(headingReadout, `actual ${fmt(heading, 2)} rad`);
    setText(headingGoalText, `goal ${fmt(desiredHeading, 2)} rad`);
    const goalText = gaugeUpdate(speed, goal, 0.04, untrusted);
    setText(
      goalText,
      goal > 0
        ? `goal ${fmt(goal, 0)} ±4%`
        : `setpoint ${fmt(v.inputs.targetRadPerSec, 0)} · not requested`,
    );
    for (const r of rollers)
      set(r.rot, {
        transform: `rotate(${r1(v.reduced ? 0 : -toDeg(v.vis.feed))} ${r.c.x} ${r.c.y})`,
      });
    setText(feedLabel, `feed rollers: ${v.out.feed ? "ON" : "off"}`);
    feedLabel.setAttribute(
      "class",
      "m-label" + (v.out.feed ? " m-actual-text" : ""),
    );
    sensor.update(v.inputs.pieceDetected, !untrusted);
    setText(
      sensorText,
      `piece sensor: ${untrusted ? untrusted + "?" : v.inputs.pieceDetected ? "detected" : "clear"}`,
    );
    const p = clamp(v.geometry.piece?.x ?? 0, 0, 1),
      pos = at(p);
    show(piece, v.geometry.piece?.visible);
    set(piece, { cx: r1(pos.x), cy: r1(pos.y) });
    show(obst, v.inputs.obstructed);
    setText(
      status,
      !v.geometry.piece?.visible
        ? "No piece detected (input) — nothing to feed."
        : p >= 1
          ? "Model feed progress 100% — piece departure is not sensed."
          : v.out.feed
            ? `Feeding: model progress ${fmt(p * 100, 0)}%`
            : `Piece held at ${fmt(p * 100, 0)}% — feed not requested.`,
    );
  };
};

RENDER["turret-shooter"] = (svg) => {
  const g = S("g", {}, svg),
    C = { x: 165, y: 150 };
  // Robot frame: forward is up the page; positive angles turn counter-clockwise (left).
  const scr = (theta) => -Math.PI / 2 - theta; // robot angle -> screen angle
  const pt = (theta, r) => ({
    x: C.x + r * Math.cos(scr(theta)),
    y: C.y + r * Math.sin(scr(theta)),
  });
  S(
    "text",
    { x: 12, y: 20, class: "m-label m-minor" },
    g,
    "Top view · robot frame, forward ↑",
  );
  S(
    "rect",
    { x: 62, y: 46, width: 206, height: 200, rx: 16, class: "m-steel-2" },
    g,
  );
  S(
    "rect",
    { x: 72, y: 56, width: 186, height: 180, rx: 10, class: "m-steel" },
    g,
  );
  S(
    "text",
    { x: C.x, y: 42, "text-anchor": "middle", class: "m-label" },
    g,
    "front",
  );
  // Robot axes.
  S(
    "line",
    {
      x1: 86,
      y1: 224,
      x2: 86,
      y2: 196,
      class: "m-line",
      "marker-end": "url(#m-arrow)",
    },
    g,
  );
  S(
    "line",
    {
      x1: 86,
      y1: 224,
      x2: 60,
      y2: 224,
      class: "m-line m-minor",
      "marker-end": "url(#m-arrow)",
    },
    g,
  );
  S("text", { x: 92, y: 202, class: "m-label" }, g, "x_R");
  S("text", { x: 40, y: 216, class: "m-label m-minor" }, g, "y_R");
  // Angle ring.
  S("circle", { cx: C.x, cy: C.y, r: 62, class: "m-line m-thin" }, g);
  for (let d = -180; d < 180; d += 15) {
    const t = (d * Math.PI) / 180,
      a = pt(t, 62),
      b = pt(t, d % 45 === 0 ? 70 : 66);
    S("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: "m-ruler" }, g);
  }
  for (const [d, label] of [
    [0, "0°"],
    [90, "+90°"],
    [-90, "−90°"],
  ]) {
    const p = pt((d * Math.PI) / 180, 80);
    S(
      "text",
      { x: p.x, y: p.y + 4, "text-anchor": "middle", class: "m-label" },
      g,
      label,
    );
  }
  // The shaded forbidden sector represents illustrative hard stops at ±2.6 rad.
  S(
    "path",
    {
      d: sector(C.x, C.y, 42, 92, scr(-2.6), scr(2.6) + 2 * Math.PI),
      class: "m-travel-stop",
    },
    g,
  );
  const s0 = pt(Math.PI, 40),
    s1 = pt(Math.PI, 82);
  S("line", { x1: s0.x, y1: s0.y, x2: s1.x, y2: s1.y, class: "m-seam" }, g);
  S(
    "text",
    { x: C.x + 8, y: s1.y + 2, class: "m-label" },
    g,
    "travel stops ±2.6 rad",
  );
  const band = S("path", { class: "m-band" }, g);
  const ghost = S("g", {}, g);
  S(
    "rect",
    { x: C.x - 8, y: C.y - 100, width: 16, height: 84, rx: 4, class: "m-goal" },
    ghost,
  );
  const turret = S("g", {}, g);
  S("circle", { cx: C.x, cy: C.y, r: 42, class: "m-steel-2" }, turret);
  S(
    "rect",
    {
      x: C.x - 9,
      y: C.y - 98,
      width: 18,
      height: 80,
      rx: 4,
      class: "m-actual-part",
    },
    turret,
  );
  S(
    "rect",
    { x: C.x - 15, y: C.y - 40, width: 30, height: 20, rx: 4, class: "m-dark" },
    turret,
  );
  const piece = S("circle", { cx: C.x, r: 7, class: "m-piece" }, turret);
  S("circle", { cx: C.x, cy: C.y, r: 6, class: "m-dark" }, g);
  const errArc = S(
    "path",
    { class: "m-goal", "marker-end": "url(#m-arrow-goal)" },
    g,
  );
  // Right column: speed gauge and turret readings.
  const gaugeUpdate = gauge(g, 396, 92, 38, 400, "Flywheel (rad/s)");
  S(
    "text",
    { x: 318, y: 172, class: "m-label-strong" },
    g,
    "Turret (robot-relative)",
  );
  const actualText = S(
      "text",
      { x: 318, y: 190, class: "m-actual-text m-value" },
      g,
    ),
    goalText = S("text", { x: 318, y: 207, class: "m-goal-text m-value" }, g),
    encText = S("text", { x: 318, y: 224, class: "m-label m-value" }, g);
  const sensor = sensorGroup(g);
  S("circle", { cx: 323, cy: 237, r: 5, class: "m-sensor" }, sensor.g);
  const pieceText = S("text", { x: 333, y: 241, class: "m-label" }, g);
  const obst = obstacle(g, 290, 256, 56, 30, 252);
  return (v) => {
    const theta = v.geometry.angle ?? 0,
      target = wrap(v.inputs.targetAngleRad ?? 0),
      untrusted = untrustedText(v);
    set(turret, { transform: `rotate(${r1(-toDeg(theta))} ${C.x} ${C.y})` });
    set(ghost, { transform: `rotate(${r1(-toDeg(target))} ${C.x} ${C.y})` });
    set(band, {
      d: sector(C.x, C.y, 0, 104, scr(target + 0.05), scr(target - 0.05)),
    });
    band.classList.toggle("is-ok", !!v.gate.aim);
    const err = target - theta;
    set(errArc, {
      d:
        Math.abs(err) > 0.03
          ? arc(C.x, C.y, 52, scr(theta), scr(theta + err))
          : "",
    });
    show(piece, v.geometry.piece?.visible);
    set(piece, {
      cy: r1(C.y - 22 - clamp(v.geometry.piece?.x ?? 0, 0, 1) * 70),
    });
    const speed = v.state.velocityRadPerSec ?? 0,
      goal = v.out.flywheelTargetRadPerSec ?? 0;
    const gt = gaugeUpdate(speed, goal, 0.04, untrusted);
    setText(
      gt,
      goal > 0
        ? `goal ${fmt(goal, 0)} ±4%`
        : `setpoint ${fmt(v.inputs.targetRadPerSec, 0)} · not requested`,
    );
    setText(actualText, `actual ${fmt(theta, 2)} rad (${degText(theta)})`);
    setText(goalText, `goal ${fmt(target, 2)} rad ±0.05`);
    setText(
      encText,
      untrusted
        ? `angle reading ${untrusted} — not trusted`
        : v.gate.limit === false
          ? "Target unreachable: beyond travel"
          : `error ${fmt(err, 2)} rad (inside travel)`,
    );
    encText.setAttribute(
      "class",
      "m-label m-value" + (untrusted ? " m-untrusted-text" : ""),
    );
    sensor.update(v.inputs.pieceDetected, !untrusted);
    setText(
      pieceText,
      `piece sensor: ${v.inputs.pieceDetected ? "detected" : "clear"}`,
    );
    show(obst, v.inputs.obstructed);
  };
};

RENDER["piece-handling"] = (svg) => {
  const g = S("g", {}, svg);
  S(
    "text",
    { x: 12, y: 20, class: "m-label m-minor" },
    g,
    "Top view · intake at the robot front (left)",
  );
  S(
    "rect",
    { x: 118, y: 40, width: 348, height: 224, rx: 10, class: "m-steel" },
    g,
  );
  S(
    "rect",
    { x: 110, y: 40, width: 9, height: 224, rx: 3, class: "m-dark" },
    g,
  );
  S("rect", { x: 140, y: 114, width: 300, height: 72, class: "m-steel-2" }, g);
  for (const d of ["M26 60L140 114", "M26 240L140 186", "M140 114H440V186H140"])
    S("path", { d, class: "m-line", "stroke-width": 3 }, g);
  S("text", { x: 14, y: 54, class: "m-label m-minor" }, g, "← front");
  // Rollers across the path; stripes advance with the requested roller power.
  const rollers = [
    { x: 74, y0: 86, y1: 214 },
    { x: 236, y0: 116, y1: 184 },
    { x: 306, y0: 116, y1: 184 },
    { x: 376, y0: 116, y1: 184 },
  ].map((r) => {
    S(
      "rect",
      {
        x: r.x - 7,
        y: r.y0,
        width: 14,
        height: r.y1 - r.y0,
        rx: 7,
        class: "m-dark",
      },
      g,
    );
    const stripes = [0, 1, 2, 3].map(() =>
      S("line", { x1: r.x - 6, x2: r.x + 6, class: "m-line m-thin" }, g),
    );
    return { ...r, stripes };
  });
  const piece = S("g", {}, g);
  S(
    "rect",
    { x: -37, y: -14, width: 74, height: 28, rx: 13, class: "m-piece" },
    piece,
  );
  S(
    "path",
    { d: "M-20 -12V12M0 -13V13M20 -12V12", class: "m-line m-thin" },
    piece,
  );
  // Range sensors. The robot faces left, so its left side is the bottom of the drawing.
  const mk = (x, y, dir, label, labelY) => {
    const s = sensorGroup(g);
    const tip = dir > 0 ? 186 : 114;
    S(
      "path",
      {
        d: `M${x} ${y}L${x - 12} ${150}L${x + 12} ${150}Z`.replace(
          `M${x} ${y}`,
          `M${x} ${tip}`,
        ),
        class: "m-beam",
      },
      s.g,
    );
    S(
      "rect",
      {
        x: x - 8,
        y: dir > 0 ? 188 : 100,
        width: 16,
        height: 12,
        rx: 2,
        class: "m-sensor",
      },
      s.g,
    );
    S(
      "text",
      { x, y: labelY, "text-anchor": "middle", class: "m-label-strong" },
      g,
      label,
    );
    return s;
  };
  const fl = mk(170, 186, 1, "FL", 214),
    fr = mk(170, 114, -1, "FR", 94),
    back = mk(414, 114, -1, "BACK", 94);
  const flow = S(
    "path",
    { d: "M220 30H330", class: "m-flow", "marker-end": "url(#m-arrow-sense)" },
    g,
  );
  const flowText = S("text", { x: 340, y: 34, class: "m-label m-value" }, g);
  const branch = S(
    "text",
    { x: 14, y: 288, class: "m-label-strong m-value" },
    g,
  );
  const obst = obstacle(g, 200, 222, 70, 28, 218);
  return (v) => {
    const power = v.out.roller ?? 0,
      untrusted = untrustedText(v);
    for (const r of rollers) {
      const span = r.y1 - r.y0,
        phase = v.reduced
          ? 0
          : (((v.vis.roller * 40) % (span / 4)) + span / 4) % (span / 4);
      r.stripes.forEach((line, i) => {
        const y = r.y0 + 4 + ((phase + (i * span) / 4) % (span - 8));
        set(line, { y1: r1(y), y2: r1(y) });
      });
    }
    const p = clamp(v.geometry.piece?.x ?? 0, 0, 1);
    show(piece, v.geometry.piece?.visible !== false);
    set(piece, { transform: `translate(${r1(lerp(80, 398, p))} 150)` });
    fl.update(v.inputs.frontLeft, !untrusted);
    fr.update(v.inputs.frontRight, !untrusted);
    back.update(v.inputs.backSensor, !untrusted);
    flow.style.opacity = power > 0 ? String(0.35 + 0.65 * power) : "0";
    setText(flowText, `roller ${fmt(power, 2)}`);
    const names = {
      hold: "HOLD — back sensor checked first",
      handoff: "HANDOFF — both front sensors",
      collect: "COLLECT — no earlier branch matched",
    };
    setText(
      branch,
      untrusted
        ? `Sensors ${untrusted}: readings not trusted, rollers stopped`
        : names[v.desc.phase]
          ? `Branch: ${names[v.desc.phase]}`
          : `Branch: none (model ${v.desc.phase})`,
    );
    show(obst, v.inputs.obstructed);
  };
};

RENDER["elevator-wrist"] = (svg) => {
  const g = S("g", {}, svg),
    Y0 = 250,
    K = 130, // px per metre
    WRIST = 70;
  S(
    "text",
    { x: 12, y: 20, class: "m-label m-minor" },
    g,
    "Side view · schematic",
  );
  S("line", { x1: 20, y1: 284, x2: 320, y2: 284, class: "m-floor" }, g);
  S(
    "rect",
    { x: 40, y: 252, width: 260, height: 22, rx: 4, class: "m-steel" },
    g,
  );
  for (const x of [70, 270])
    S("circle", { cx: x, cy: 273, r: 11, class: "m-dark" }, g);
  // Rails and travel (model clamps height to 0–1.5 m).
  for (const x of [148, 176])
    S(
      "rect",
      { x, y: 22, width: 6, height: 230, rx: 2, class: "m-steel-2" },
      g,
    );
  const rule = ruler(g, 118, Y0, K, 1.5, 0.25, 2);
  const ptActual = pointer(g, "m-actual-fill"),
    ptGoal = pointer(g, "m-goal");
  const heightSensor = sensorGroup(g);
  S(
    "rect",
    { x: 155, y: 10, width: 16, height: 10, rx: 2, class: "m-sensor" },
    heightSensor.g,
  );
  const sensorText = S(
    "text",
    { x: 176, y: 19, class: "m-label" },
    g,
    "height sensor",
  );
  const home = sensorGroup(g);
  S(
    "rect",
    { x: 183, y: 238, width: 12, height: 10, rx: 2, class: "m-sensor" },
    home.g,
  );
  S("text", { x: 199, y: 247, class: "m-label m-minor" }, g, "home switch");
  // Goal ghost: carriage + wrist at the requested pose.
  const ghost = S("g", {}, g);
  S(
    "rect",
    { x: 140, y: -28, width: 48, height: 28, rx: 4, class: "m-goal" },
    ghost,
  );
  const ghostWrist = S("g", {}, ghost);
  S(
    "path",
    {
      d: `M0 0H${WRIST - 8}M${WRIST + 4} -13H${WRIST - 8}V13H${WRIST + 4}`,
      class: "m-goal",
    },
    ghostWrist,
  );
  // Carriage, wrist envelope (model clamps the wrist to ±1.2 rad) and wrist.
  const carriage = S("g", {}, g);
  S(
    "path",
    { d: sector(198 - 140, -14, 0, 84, -1.2, 1.2), class: "m-envelope" },
    carriage,
  );
  S(
    "rect",
    { x: 140, y: -28, width: 48, height: 28, rx: 4, class: "m-actual-part" },
    carriage,
  );
  const unknown = S(
    "text",
    { x: 164, y: -9, "text-anchor": "middle", class: "m-fault-text" },
    carriage,
    "?",
  );
  const wristArc = S(
    "path",
    { class: "m-actual", "stroke-width": 1.5 },
    carriage,
  );
  const wrist = S("g", {}, carriage);
  S(
    "rect",
    {
      x: 0,
      y: -6,
      width: WRIST - 8,
      height: 12,
      rx: 4,
      class: "m-actual-part",
    },
    wrist,
  );
  S(
    "path",
    {
      d: `M${WRIST + 4} -13H${WRIST - 8}V13H${WRIST + 4}`,
      class: "m-actual",
      "stroke-width": 4,
    },
    wrist,
  );
  S("circle", { cx: 0, cy: 0, r: 6, class: "m-dark" }, wrist);
  const velocity = S(
    "line",
    { class: "m-actual", "marker-end": "url(#m-arrow-actual)" },
    g,
  );
  // Readout block.
  S("text", { x: 318, y: 46, class: "m-label-strong" }, g, "Elevator");
  const hA = S("text", { x: 318, y: 63, class: "m-actual-text m-value" }, g),
    hG = S("text", { x: 318, y: 79, class: "m-goal-text m-value" }, g);
  S("text", { x: 318, y: 104, class: "m-label-strong" }, g, "Wrist");
  const wA = S("text", { x: 318, y: 121, class: "m-actual-text m-value" }, g),
    wG = S("text", { x: 318, y: 137, class: "m-goal-text m-value" }, g),
    homeText = S("text", { x: 318, y: 162, class: "m-label m-value" }, g);
  const obst = obstacle(g, 330, 196, 70, 34);
  return (v) => {
    const hgt = v.geometry.extension ?? 0,
      wa = v.geometry.angle ?? 0,
      th = clamp(v.inputs.targetHeightM ?? 0, 0, 1.5),
      tw = clamp(v.inputs.targetWristRad ?? 0, -1.2, 1.2),
      untrusted = untrustedText(v),
      y = Y0 - hgt * K,
      yg = Y0 - th * K;
    set(carriage, { transform: `translate(0 ${r1(y)})` });
    set(wrist, { transform: `translate(198 -14) rotate(${r1(-toDeg(wa))})` });
    set(wristArc, { d: Math.abs(wa) > 0.02 ? arc(198, -14, 24, 0, -wa) : "" });
    set(ghost, { transform: `translate(0 ${r1(yg)})` });
    set(ghostWrist, {
      transform: `translate(198 -14) rotate(${r1(-toDeg(tw))})`,
    });
    set(ptActual, { transform: `translate(${118} ${r1(y)})` });
    set(ptGoal, { transform: `translate(${118} ${r1(yg)})` });
    rule.style.opacity = v.homed ? "1" : "0.4";
    show(unknown, !v.homed);
    home.update(v.homed);
    heightSensor.update(true, !untrusted);
    setText(
      sensorText,
      untrusted ? `height sensor ${untrusted}` : "height sensor",
    );
    sensorText.setAttribute(
      "class",
      untrusted ? "m-untrusted-text" : "m-label",
    );
    const speed = v.out.elevatorMps ?? 0;
    show(velocity, Math.abs(speed) > 0.005);
    set(velocity, {
      x1: 132,
      y1: r1(y - 14),
      x2: 132,
      y2: r1(y - 14 - speed * 70),
    });
    setText(hA, `actual ${fmt(hgt, 2)} m${v.homed ? "" : " (unreferenced)"}`);
    setText(hG, `goal ${fmt(th, 2)} m`);
    setText(wA, `actual ${fmt(wa, 2)} rad (${degText(wa)})`);
    setText(wG, `goal ${fmt(tw, 2)} rad (${degText(tw)})`);
    setText(
      homeText,
      v.homed ? "home switch recorded" : "home not recorded — motion blocked",
    );
    homeText.setAttribute(
      "class",
      "m-value " + (v.homed ? "m-label" : "m-fault-text m-label"),
    );
    show(obst, v.inputs.obstructed);
  };
};

RENDER["telescoping-arm"] = (svg) => {
  const g = S("g", {}, svg),
    P = { x: 170, y: 150 },
    K = 90, // px per metre
    L0 = 0.5; // assumed retracted length (drawing and endpoint only; not part of the model)
  const scrPt = (theta, L) => ({
    x: P.x + L * K * Math.cos(theta),
    y: P.y - L * K * Math.sin(theta),
  });
  S(
    "text",
    { x: 12, y: 20, class: "m-label m-minor" },
    g,
    "Side view · ideal planar arm",
  );
  S("line", { x1: 20, y1: 288, x2: 300, y2: 288, class: "m-floor" }, g);
  S(
    "rect",
    { x: 70, y: 252, width: 200, height: 24, rx: 4, class: "m-steel" },
    g,
  );
  for (const x of [96, 244])
    S("circle", { cx: x, cy: 277, r: 11, class: "m-dark" }, g);
  S(
    "path",
    { d: `M146 252L194 252L178 ${P.y}L162 ${P.y}Z`, class: "m-steel-2" },
    g,
  );
  // Model travel: shoulder −1…1.4 rad, length L0 + 0…1 m.
  S(
    "path",
    {
      d: sector(P.x, P.y, L0 * K, (L0 + 1) * K, -1.4, 1.0),
      class: "m-envelope",
    },
    g,
  );
  S(
    "text",
    { x: 300, y: 258, class: "m-label m-minor", "text-anchor": "end" },
    g,
    "travel envelope",
  );
  S(
    "line",
    {
      x1: P.x,
      y1: P.y,
      x2: P.x + 150,
      y2: P.y,
      class: "m-ruler",
      "stroke-dasharray": "3 4",
    },
    g,
  );
  S("text", { x: P.x + 152, y: P.y + 4, class: "m-label m-minor" }, g, "0 rad");
  const band = S("path", { class: "m-band" }, g);
  const ghostLine = S("line", { class: "m-goal" }, g),
    ghostEnd = S("circle", { r: 7, class: "m-goal" }, g);
  const arm = S("g", {}, g);
  const stage2 = S(
      "rect",
      { y: -5, height: 10, rx: 2, class: "m-steel-2" },
      arm,
    ),
    stage1 = S("rect", { y: -7, height: 14, rx: 2, class: "m-steel-2" }, arm);
  S(
    "rect",
    {
      x: -12,
      y: -10,
      width: L0 * K + 12,
      height: 20,
      rx: 5,
      class: "m-actual-part",
    },
    arm,
  );
  const grip = S("g", {}, arm);
  S(
    "path",
    { d: "M0 -12H12M0 12H12M0 -12V12", class: "m-actual", "stroke-width": 4 },
    grip,
  );
  S("circle", { cx: 0, cy: 0, r: 8, class: "m-dark" }, arm);
  const shoulderArc = S("path", { class: "m-actual", "stroke-width": 1.5 }, g);
  const tip = S("circle", { r: 4, class: "m-actual-fill" }, g),
    tipText = S("text", { class: "m-actual-text m-value" }, g);
  const angleSensor = sensorGroup(g);
  S(
    "rect",
    { x: 140, y: 170, width: 12, height: 10, rx: 2, class: "m-sensor" },
    angleSensor.g,
  );
  const home = sensorGroup(g);
  S(
    "rect",
    { x: 198, y: 236, width: 12, height: 10, rx: 2, class: "m-sensor" },
    home.g,
  );
  S("text", { x: 214, y: 245, class: "m-label m-minor" }, g, "home switch");
  S("text", { x: 318, y: 40, class: "m-label-strong" }, g, "Shoulder θ");
  const aA = S("text", { x: 318, y: 57, class: "m-actual-text m-value" }, g),
    aG = S("text", { x: 318, y: 73, class: "m-goal-text m-value" }, g);
  S("text", { x: 318, y: 97, class: "m-label-strong" }, g, "Extension");
  const eA = S("text", { x: 318, y: 114, class: "m-actual-text m-value" }, g),
    eG = S("text", { x: 318, y: 130, class: "m-goal-text m-value" }, g);
  const gateText = S("text", { x: 318, y: 152, class: "m-label m-value" }, g),
    sensorText = S("text", { x: 318, y: 170, class: "m-label m-value" }, g);
  S(
    "text",
    { x: 318, y: 192, class: "m-label m-minor" },
    g,
    "endpoint = (L cos θ, L sin θ)",
  );
  S(
    "text",
    { x: 318, y: 207, class: "m-label m-minor" },
    g,
    `L = ${L0} m (assumed) + extension`,
  );
  const obst = obstacle(g, 330, 236, 70, 34);
  return (v) => {
    const th = v.geometry.angle ?? 0,
      ext = v.geometry.extension ?? 0,
      tt = clamp(v.inputs.targetAngleRad ?? 0, -1, 1.4),
      te = clamp(v.inputs.targetExtensionM ?? 0, 0, 1),
      aligned = !!v.gate.shoulder,
      untrusted = untrustedText(v),
      L = L0 + ext;
    set(arm, {
      transform: `translate(${P.x} ${P.y}) rotate(${r1(-toDeg(th))})`,
    });
    set(stage1, {
      x: r1(0.3 * L0 * K + (ext * K) / 2),
      width: r1(0.7 * L0 * K),
    });
    set(stage2, { x: r1(0.5 * L0 * K + ext * K), width: r1(0.5 * L0 * K) });
    set(grip, { transform: `translate(${r1(L * K)} 0)` });
    set(band, {
      d: sector(P.x, P.y, 0, (L0 + 1) * K + 10, -(tt + 0.1), -(tt - 0.1)),
    });
    band.classList.toggle("is-ok", aligned);
    const ge = scrPt(tt, L0 + te);
    set(ghostLine, { x1: P.x, y1: P.y, x2: r1(ge.x), y2: r1(ge.y) });
    set(ghostEnd, { cx: r1(ge.x), cy: r1(ge.y) });
    set(shoulderArc, {
      d: Math.abs(th) > 0.02 ? arc(P.x, P.y, 30, 0, -th) : "",
    });
    const e = scrPt(th, L + 12 / K),
      ex = L * Math.cos(th),
      ey = L * Math.sin(th);
    set(tip, { cx: r1(e.x), cy: r1(e.y) });
    set(tipText, {
      x: r1(clamp(e.x + 10, 4, 236)),
      y: r1(clamp(e.y - 10, 34, 240)),
    });
    setText(tipText, `(${fmt(ex, 2)}, ${fmt(ey, 2)}) m`);
    setText(aA, `actual ${fmt(th, 2)} rad (${degText(th)})`);
    setText(aG, `goal ${fmt(tt, 2)} rad ±0.1`);
    setText(eA, `actual ${fmt(ext, 2)} m`);
    setText(eG, `goal ${fmt(te, 2)} m`);
    setText(
      gateText,
      !v.run
        ? "extension held (not running)"
        : aligned
          ? `aligned → extend to ${fmt(te, 2)} m`
          : "not aligned → extension target 0 m",
    );
    gateText.setAttribute(
      "class",
      "m-value " + (v.run && !aligned ? "m-goal-text m-label" : "m-label"),
    );
    angleSensor.update(true, !untrusted);
    home.update(v.homed);
    setText(
      sensorText,
      untrusted
        ? `angle reading ${untrusted}`
        : v.homed
          ? "home recorded"
          : "home not recorded",
    );
    sensorText.setAttribute(
      "class",
      "m-value " + (untrusted || !v.homed ? "m-untrusted-text" : "m-label"),
    );
    show(obst, v.inputs.obstructed);
  };
};

RENDER.drivetrain = (svg) => {
  const g = S("g", {}, svg),
    F = 36, // px per metre in the field pane
    FC = { x: 151, y: 152 }, // the robot stays centred; the field scrolls
    Q = { x: 389, y: 156 },
    MOD = 0.3, // assumed module offset (m) for the robot-frame inset
    MK = 44 / MOD;
  const clip = S("clipPath", { id: "m-field-clip" }, svg.querySelector("defs"));
  S("rect", { x: 6, y: 6, width: 290, height: 288, rx: 6 }, clip);
  S(
    "rect",
    { x: 6, y: 6, width: 290, height: 288, rx: 6, class: "m-field" },
    g,
  );
  const field = S("g", { "clip-path": "url(#m-field-clip)" }, g);
  const vLines = Array.from({ length: 10 }, () =>
      S("line", { y1: 6, y2: 294, class: "m-grid" }, field),
    ),
    hLines = Array.from({ length: 10 }, () =>
      S("line", { x1: 6, x2: 296, class: "m-grid" }, field),
    );
  const origin = S("g", {}, field);
  S("path", { d: "M-8 0H8M0 -8V8", class: "m-line" }, origin);
  S("text", { x: 6, y: 16, class: "m-label m-minor" }, origin, "field origin");
  const path = S(
    "polyline",
    {
      class: "m-actual",
      "stroke-width": 2,
      "stroke-opacity": 0.55,
      fill: "none",
    },
    field,
  );
  const robot = S("g", {}, field);
  S(
    "rect",
    { x: -17, y: -17, width: 34, height: 34, rx: 4, class: "m-actual-part" },
    robot,
  );
  for (const [x, y] of [
    [11, 11],
    [11, -11],
    [-11, 11],
    [-11, -11],
  ])
    S("circle", { cx: x, cy: y, r: 3.5, class: "m-dark" }, robot);
  const heading = S(
    "line",
    {
      x1: 0,
      y1: 0,
      x2: 30,
      y2: 0,
      class: "m-actual",
      "marker-end": "url(#m-arrow-actual)",
    },
    robot,
  );
  const velocity = S(
    "line",
    { class: "m-goal", "marker-end": "url(#m-arrow-goal)" },
    field,
  );
  S(
    "text",
    { x: 14, y: 24, class: "m-label-strong" },
    g,
    "Field view (robot centred)",
  );
  const headingText = S("text", { x: 14, y: 40, class: "m-label m-value" }, g),
    poseText = S("text", { x: 14, y: 56, class: "m-label m-value m-minor" }, g);
  S(
    "line",
    {
      x1: 22,
      y1: 278,
      x2: 50,
      y2: 278,
      class: "m-line",
      "marker-end": "url(#m-arrow)",
    },
    g,
  );
  S(
    "line",
    {
      x1: 22,
      y1: 278,
      x2: 22,
      y2: 250,
      class: "m-line",
      "marker-end": "url(#m-arrow)",
    },
    g,
  );
  S("text", { x: 54, y: 282, class: "m-label" }, g, "x_F");
  S("text", { x: 26, y: 250, class: "m-label" }, g, "y_F");
  S(
    "text",
    { x: 290, y: 288, "text-anchor": "end", class: "m-label m-minor" },
    g,
    "grid 1 m",
  );
  // Robot-frame inset with module vectors.
  S(
    "rect",
    { x: 304, y: 6, width: 170, height: 288, rx: 6, class: "m-field" },
    g,
  );
  S(
    "text",
    { x: Q.x, y: 46, "text-anchor": "middle", class: "m-label-strong" },
    g,
    "Robot frame · forward ↑",
  );
  S(
    "rect",
    {
      x: Q.x - 54,
      y: Q.y - 54,
      width: 108,
      height: 108,
      rx: 8,
      class: "m-steel",
    },
    g,
  );
  const omegaArc = S(
    "path",
    { class: "m-goal", "marker-end": "url(#m-arrow-goal)" },
    g,
  );
  const chassisV = S(
    "line",
    { class: "m-goal", "marker-end": "url(#m-arrow-goal)" },
    g,
  );
  const modules = [
    ["FL", MOD, MOD],
    ["FR", MOD, -MOD],
    ["BL", -MOD, MOD],
    ["BR", -MOD, -MOD],
  ].map(([name, x, y]) => {
    const c = { x: Q.x - y * MK, y: Q.y - x * MK };
    S("circle", { cx: c.x, cy: c.y, r: 15, class: "m-steel-2" }, g);
    const wheel = S(
      "rect",
      { x: -5, y: -12, width: 10, height: 24, rx: 3, class: "m-dark" },
      g,
    );
    const arrow = S(
      "line",
      { class: "m-actual", "marker-end": "url(#m-arrow-actual)" },
      g,
    );
    S(
      "text",
      {
        x: c.x + (y > 0 ? -22 : 22),
        y: c.y + (x > 0 ? -18 : 26),
        "text-anchor": "middle",
        class: "m-label",
      },
      g,
      name,
    );
    return { x, y, c, wheel, arrow };
  });
  const cmdText = S(
      "text",
      { x: Q.x, y: 252, "text-anchor": "middle", class: "m-goal-text m-value" },
      g,
    ),
    cmdText2 = S(
      "text",
      { x: Q.x, y: 268, "text-anchor": "middle", class: "m-goal-text m-value" },
      g,
    );
  S(
    "text",
    { x: Q.x, y: 286, "text-anchor": "middle", class: "m-label m-minor" },
    g,
    "modules: drawing-side kinematics",
  );
  const sensor = sensorGroup(g);
  S("circle", { cx: 279, cy: 22, r: 5, class: "m-sensor" }, sensor.g);
  const obst = obstacle(g, 200, 214, 60, 30, 208);
  return (v) => {
    const x = v.geometry.x ?? 0,
      y = v.geometry.y ?? 0,
      a = v.geometry.angle ?? 0,
      untrusted = untrustedText(v);
    const toScreen = (px, py) => ({
      x: FC.x + (px - x) * F,
      y: FC.y - (py - y) * F,
    });
    const kx = Math.floor(x - FC.x / F),
      ky = Math.floor(y - (300 - FC.y) / F);
    vLines.forEach((line, i) => {
      const sx = toScreen(kx + i, 0).x;
      set(line, { x1: r1(sx), x2: r1(sx) });
    });
    hLines.forEach((line, i) => {
      const sy = toScreen(0, ky + i).y;
      set(line, { y1: r1(sy), y2: r1(sy) });
    });
    const o = toScreen(0, 0);
    set(origin, { transform: `translate(${r1(o.x)} ${r1(o.y)})` });
    set(path, {
      points: v.vis.path
        .map((p) => {
          const s = toScreen(p.x, p.y);
          return `${r1(s.x)},${r1(s.y)}`;
        })
        .join(" "),
    });
    set(robot, {
      transform: `translate(${FC.x} ${FC.y}) rotate(${r1(-toDeg(a))})`,
    });
    heading.setAttribute("stroke-dasharray", untrusted ? "4 3" : "none");
    const vx = v.out.vxMps ?? 0,
      vy = v.out.vyMps ?? 0,
      w = v.out.omegaRadPerSec ?? 0;
    const fx = vx * Math.cos(a) - vy * Math.sin(a),
      fy = vx * Math.sin(a) + vy * Math.cos(a);
    show(velocity, Math.hypot(fx, fy) > 0.01);
    set(velocity, {
      x1: FC.x,
      y1: FC.y,
      x2: r1(FC.x + fx * 24),
      y2: r1(FC.y - fy * 24),
    });
    setText(
      headingText,
      untrusted
        ? `heading ${untrusted} — not trusted`
        : `heading ${fmt(a, 2)} rad (${degText(a)})`,
    );
    headingText.setAttribute(
      "class",
      "m-value " + (untrusted ? "m-untrusted-text" : "m-label"),
    );
    setText(poseText, `pose (${fmt(x, 2)}, ${fmt(y, 2)}) m`);
    sensor.update(true, !untrusted);
    // Chassis command in the robot frame (forward up, left to the left).
    show(chassisV, Math.hypot(vx, vy) > 0.01);
    set(chassisV, {
      x1: Q.x,
      y1: Q.y,
      x2: r1(Q.x - vy * 14),
      y2: r1(Q.y - vx * 14),
    });
    const sweep = (clamp(w, -3, 3) / 3) * 1.5 * Math.PI;
    set(omegaArc, {
      d:
        Math.abs(w) > 0.01
          ? arc(Q.x, Q.y, 22, -Math.PI / 2, -Math.PI / 2 - sweep)
          : "",
    });
    modules.forEach((m, i) => {
      const mvx = vx - w * m.y,
        mvy = v.inputs.differential ? 0 : vy + w * m.x,
        speed = Math.hypot(mvx, mvy);
      if (speed > 1e-6)
        v.vis.modules[i] = v.inputs.differential ? 0 : Math.atan2(-mvy, mvx); // screen rotation, keeps last angle at rest
      set(m.wheel, {
        transform: `translate(${r1(m.c.x)} ${r1(m.c.y)}) rotate(${r1(toDeg(v.vis.modules[i]))})`,
      });
      const len = Math.min(speed * 14, 60);
      show(m.arrow, speed > 0.01);
      set(m.arrow, {
        x1: r1(m.c.x),
        y1: r1(m.c.y),
        x2: r1(m.c.x - (mvy / (speed || 1)) * len),
        y2: r1(m.c.y - (mvx / (speed || 1)) * len),
      });
    });
    setText(cmdText, `vx ${fmt(vx, 1)} · vy ${fmt(vy, 1)} m/s`);
    setText(cmdText2, `ω ${fmt(w, 2)} rad/s`);
    show(obst, v.inputs.obstructed);
  };
};

RENDER["climb-balance"] = (svg) => {
  const g = S("g", {}, svg),
    Y0 = 216, // carriage bottom at 0 m
    K = 120;
  S(
    "text",
    { x: 12, y: 20, class: "m-label m-minor" },
    g,
    "Side view · lift only (no balance model)",
  );
  S("line", { x1: 20, y1: 286, x2: 340, y2: 286, class: "m-floor" }, g);
  S(
    "rect",
    { x: 110, y: 226, width: 220, height: 42, rx: 6, class: "m-steel" },
    g,
  );
  for (const x of [140, 300])
    S("circle", { cx: x, cy: 272, r: 12, class: "m-dark" }, g);
  // Bar drawn above the full travel so it is never shown as touched.
  S("circle", { cx: 196, cy: 10, r: 6, class: "m-steel-2" }, g);
  S(
    "text",
    { x: 184, y: 14, "text-anchor": "end", class: "m-label m-minor" },
    g,
    "cage bar (illustrative)",
  );
  S(
    "rect",
    { x: 214, y: 24, width: 12, height: 202, rx: 2, class: "m-steel-2" },
    g,
  );
  ruler(g, 290, Y0, K, 1.2, 0.2, 1, "right");
  const ptActual = pointer(g, "m-actual-fill"),
    ptGoal = pointer(g, "m-goal");
  // Winch drum turns as the cable winds in (drawn with an assumed 3 cm drum radius).
  const drum = S("g", {}, g);
  S("circle", { cx: 250, cy: 246, r: 12, class: "m-dark" }, drum);
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3;
    S(
      "line",
      {
        x1: 250,
        y1: 246,
        x2: 250 + 10 * Math.cos(a),
        y2: 246 + 10 * Math.sin(a),
        class: "m-line",
      },
      drum,
    );
  }
  S(
    "text",
    { x: 250, y: 280, "text-anchor": "middle", class: "m-label m-minor" },
    g,
    "winch",
  );
  S("circle", { cx: 232, cy: 24, r: 6, class: "m-dark" }, g);
  S("line", { x1: 238, y1: 24, x2: 238, y2: 246, class: "m-line" }, g);
  const cable = S("line", { x1: 226, y1: 24, x2: 226, class: "m-line" }, g);
  const ghost = S("g", {}, g);
  S(
    "rect",
    { x: 208, y: 0, width: 24, height: 26, rx: 3, class: "m-goal" },
    ghost,
  );
  S(
    "path",
    { d: "M208 6H188V-14A8 8 0 0 1 204 -14V-6", class: "m-goal" },
    ghost,
  );
  const carriage = S("g", {}, g);
  S(
    "rect",
    { x: 208, y: 0, width: 24, height: 26, rx: 3, class: "m-actual-part" },
    carriage,
  );
  S(
    "path",
    {
      d: "M208 6H188V-14A8 8 0 0 1 204 -14V-6",
      class: "m-actual",
      "stroke-width": 4,
    },
    carriage,
  );
  const cage = sensorGroup(carriage);
  S("circle", { cx: 196, cy: -8, r: 10, class: "m-beam" }, cage.g);
  S("circle", { cx: 196, cy: -8, r: 3.5, class: "m-sensor" }, cage.g);
  const lift = S(
    "line",
    { class: "m-actual", "marker-end": "url(#m-arrow-actual)" },
    g,
  );
  const home = sensorGroup(g);
  S(
    "rect",
    { x: 180, y: 216, width: 12, height: 10, rx: 2, class: "m-sensor" },
    home.g,
  );
  S(
    "text",
    { x: 186, y: 244, "text-anchor": "middle", class: "m-label m-minor" },
    g,
    "home",
  );
  S("text", { x: 340, y: 46, class: "m-label-strong" }, g, "Lift");
  const hA = S("text", { x: 340, y: 63, class: "m-actual-text m-value" }, g),
    hG = S("text", { x: 340, y: 79, class: "m-goal-text m-value" }, g),
    outText = S("text", { x: 340, y: 95, class: "m-label m-value" }, g);
  S("text", { x: 340, y: 120, class: "m-label-strong" }, g, "Evidence");
  const cageText = S("text", { x: 340, y: 137, class: "m-label m-value" }, g),
    homeText = S("text", { x: 340, y: 153, class: "m-label m-value" }, g),
    sensorText = S("text", { x: 340, y: 169, class: "m-label m-value" }, g);
  const obst = obstacle(g, 360, 214, 70, 34);
  return (v) => {
    const hgt = v.geometry.extension ?? 0,
      th = clamp(v.inputs.targetHeightM ?? 0, 0, 1.2),
      untrusted = untrustedText(v),
      top = Y0 - hgt * K - 26,
      gtop = Y0 - th * K - 26;
    set(carriage, { transform: `translate(0 ${r1(top)})` });
    set(ghost, { transform: `translate(0 ${r1(gtop)})` });
    set(cable, { y2: r1(top) });
    set(drum, {
      transform: `rotate(${r1(v.reduced ? 0 : -toDeg(hgt / 0.03))} 250 246)`,
    });
    set(ptActual, {
      transform: `translate(290 ${r1(Y0 - hgt * K)}) scale(-1 1)`,
    });
    set(ptGoal, { transform: `translate(290 ${r1(Y0 - th * K)}) scale(-1 1)` });
    cage.update(v.inputs.cageDetected, !untrusted);
    home.update(v.homed);
    const out = v.out.liftMps ?? 0;
    show(lift, Math.abs(out) > 0.005);
    set(lift, {
      x1: 254,
      y1: r1(top + 20),
      x2: 254,
      y2: r1(top + 20 - out * 160),
    });
    setText(hA, `actual ${fmt(hgt, 2)} m${v.homed ? "" : " (unreferenced)"}`);
    setText(hG, `goal ${fmt(th, 2)} m`);
    setText(outText, `requested ${fmt(out, 2)} m/s`);
    setText(
      cageText,
      `cage sensor: ${v.inputs.cageDetected ? "detected" : "not detected"}`,
    );
    setText(homeText, v.homed ? "home recorded" : "home not recorded");
    homeText.setAttribute(
      "class",
      "m-value " + (v.homed ? "m-label" : "m-untrusted-text"),
    );
    setText(
      sensorText,
      untrusted
        ? `readings ${untrusted} — not trusted`
        : "engagement: not measured",
    );
    sensorText.setAttribute(
      "class",
      "m-value " + (untrusted ? "m-untrusted-text" : "m-label"),
    );
    show(obst, v.inputs.obstructed);
  };
};

// ---------- per-demo data: controls, scenarios, plot, source correspondence ----------
const HEALTHY = {
  enabled: true,
  sensorValid: true,
  stale: false,
  obstructed: false,
};
const COMMON_SCENARIOS = [
  {
    id: "sensor-lost",
    label: "Sensor lost",
    set: { sensorValid: false },
    note: "The sensor now reports invalid. Watch the fault latch; changing it back does not clear the fault.",
  },
  {
    id: "stale",
    label: "Stale signal",
    set: { stale: true },
    note: "The reading is now stale. A stale value is treated like a missing one.",
  },
  {
    id: "obstruction",
    label: "Obstruction",
    set: { obstructed: true },
    note: "An obstruction is reported (input only; no contact is simulated).",
  },
  {
    id: "clear-causes",
    label: "Clear causes",
    set: { ...HEALTHY },
    note: "Causes removed. A latched fault stays latched until you release the request and press Reset fault.",
  },
  {
    id: "release",
    label: "Release request",
    set: { request: false },
    note: "Request released.",
  },
];
const DEMOS = {
  "fixed-shooter": {
    title: "Fixed shooter: flywheel pair, feed rollers and piece sensor",
    numbers: {},
    scenarios: [
      {
        id: "ready",
        label: "Ready to shoot",
        set: { ...HEALTHY, pieceDetected: true, request: true },
        note: "Healthy inputs, piece detected and request held. Feed waits for speed and chassis alignment.",
      },
      {
        id: "no-piece",
        label: "Gated: no piece",
        set: { ...HEALTHY, pieceDetected: false, request: true },
        note: "The wheel spins up but the piece gate stays open, so the feed rollers stay still.",
      },
      {
        id: "heading",
        label: "Turn chassis to 3 rad",
        set: { targetHeadingRad: 3, pieceDetected: true },
        note: "Even at speed, feed must wait for the chassis heading. Clear the piece sensor to reload after a completed feed.",
      },
      {
        id: "high-speed",
        label: "Higher target",
        set: { targetRadPerSec: 380 },
        note: "Target raised to 380 rad/s. The speed gate opens again until the wheel is within 4%.",
      },
    ],
    plot: {
      unit: "rad/s",
      min: 0,
      max: 420,
      series: [
        {
          label: "Measured speed",
          cls: "actual",
          get: (s) => s.velocityRadPerSec ?? 0,
        },
        {
          label: "Requested speed (output)",
          cls: "goal",
          get: (s) => s.outputs?.flywheelTargetRadPerSec ?? 0,
        },
      ],
    },
    related(v) {
      const ids = [],
        notes = {
          "read-aim":
            "Not mapped: this fixed-heading model has no turret, hood or validity flag.",
        };
      if (v.run) {
        ids.push("read-speed");
        notes["read-speed"] =
          `Model speed gate (within 4%): ${v.gate.speed ? "met" : "not met"}.`;
      }
      if (v.desc.phase === "feeding") {
        ids.push("ready");
        notes.ready =
          "Model: every gate met, so it requests feed. The source only returns true; it does not feed.";
      }
      return { ids, notes };
    },
  },
  "turret-shooter": {
    title: "Turret shooter: turret ring, barrel and flywheel speed gauge",
    numbers: {},
    scenarios: [
      {
        id: "ready",
        label: "Ready to aim",
        set: { ...HEALTHY, pieceDetected: true, request: true },
        note: "Healthy inputs and request held. The turret turns toward the goal and the wheel spins up.",
      },
      {
        id: "aim-left",
        label: "Aim +2.5 rad",
        set: { targetAngleRad: 2.5 },
        note: "Reachable target near the positive travel stop.",
      },
      {
        id: "aim-right",
        label: "Aim −2.5 rad",
        set: { targetAngleRad: -2.5 },
        note: "The model takes the long route inside the travel envelope; it never crosses a hard stop.",
      },
      {
        id: "unreachable",
        label: "Outside travel",
        set: { targetAngleRad: 3.1 },
        note: "No equivalent lies inside ±2.6 rad. Turn and feed remain blocked.",
      },
      {
        id: "equivalent",
        label: "2π + 0.5 rad",
        set: { targetAngleRad: 2 * Math.PI + 0.5 },
        note: "The equivalent target is +0.5 rad inside the illustrative travel limits.",
      },
      {
        id: "no-piece",
        label: "Gated: no piece",
        set: { pieceDetected: false },
        note: "The piece gate fails, so no feed is requested even when aimed and at speed.",
      },
    ],
    plot: {
      unit: "rad",
      min: -Math.PI,
      max: Math.PI,
      series: [
        { label: "Turret angle", cls: "actual", get: (s) => s.angle ?? 0 },
        {
          label: "Turret goal (input)",
          cls: "goal",
          get: (s, i) => wrap(i.targetAngleRad ?? 0),
        },
      ],
    },
    related(v) {
      const ids = [],
        notes = {
          convert: "Not mapped: the model has no gearing or rotor units.",
        };
      if (v.run) {
        ids.push("clamp");
        notes.clamp = `Different model policy: target reachability inside ±2.6 rad is ${v.gate.limit ? "satisfied" : "blocked"}. The real excerpt clamps to its own configured limits.`;
        if (v.vis.turretMoving) {
          ids.push("command");
          notes.command =
            "Model turns the turret toward the goal at up to 1.5 rad/s.";
        }
      }
      return { ids, notes };
    },
  },
  "piece-handling": {
    title: "Piece handling: intake rollers, range sensors and a coral piece",
    numbers: {},
    scenarios: [
      {
        id: "ready",
        label: "Ready: collect",
        set: {
          ...HEALTHY,
          frontLeft: false,
          frontRight: false,
          backSensor: false,
          request: true,
        },
        note: "Request held with every sensor clear: the model collects at full roller power.",
      },
      {
        id: "one-front",
        label: "Only FL tripped",
        set: { frontLeft: true, frontRight: false, backSensor: false },
        note: "One front sensor is not enough for the handoff branch; collection continues.",
      },
      {
        id: "both-front",
        label: "Both front tripped",
        set: { frontLeft: true, frontRight: true, backSensor: false },
        note: "Both front sensors: the handoff branch slows the rollers to 0.4.",
      },
      {
        id: "back",
        label: "Back tripped",
        set: { backSensor: true },
        note: "The back sensor is checked first, so the model holds even if the front sensors are also tripped.",
      },
    ],
    plot: {
      unit: "fraction",
      min: 0,
      max: 1.05,
      series: [
        {
          label: "Piece progress (model)",
          cls: "actual",
          get: (s) => s.pieceProgress ?? 0,
        },
        {
          label: "Roller output",
          cls: "aux",
          get: (s) => s.outputs?.roller ?? 0,
        },
      ],
    },
    related(v) {
      const map = { hold: "back", handoff: "front", collect: "collect" },
        ids = map[v.desc.phase] ? [map[v.desc.phase]] : [];
      const notes = {
        back: `Back sensor input ${v.inputs.backSensor ? "on → model holds (checked first)" : "off → branch skipped"}.`,
        front: `Front inputs FL ${v.inputs.frontLeft ? "on" : "off"}, FR ${v.inputs.frontRight ? "on" : "off"}${v.inputs.frontLeft && v.inputs.frontRight ? " → handoff" : ""}.`,
        collect: "Otherwise the model collects at full roller power.",
      };
      return { ids, notes };
    },
  },
  "elevator-wrist": {
    title: "Elevator and wrist: rails, carriage, wrist and goal ghost",
    numbers: { targetHeightM: { label: "Elevator target height", max: 1.5 } },
    scenarios: [
      {
        id: "ready",
        label: "Home + request",
        home: true,
        set: { ...HEALTHY },
        note: "Records the home switch with the request released, then holds the request.",
      },
      {
        id: "unhomed",
        label: "Gated: unhomed (new run)",
        fresh: true,
        set: { ...HEALTHY, request: true },
        note: "New run without a home reference: the request is held but nothing moves.",
      },
      {
        id: "high",
        label: "High pose",
        set: { targetHeightM: 1.4, targetWristRad: 0.7 },
        note: "Goal moved to 1.4 m and 0.7 rad.",
      },
      {
        id: "low",
        label: "Low pose",
        set: { targetHeightM: 0.2, targetWristRad: 0.5 },
        note: "This low-height, extended-wrist goal is incompatible with the illustrative clearance rule; both outputs stop.",
      },
    ],
    plot: {
      unit: "m",
      min: 0,
      max: 1.6,
      series: [
        { label: "Height", cls: "actual", get: (s) => s.extension ?? 0 },
        {
          label: "Height goal (input)",
          cls: "goal",
          get: (s, i) => clamp(i.targetHeightM ?? 0, 0, 1.5),
        },
      ],
    },
    related(v) {
      const ids = [],
        notes = {
          tolerance: "Not mapped: the model has no completion tolerance.",
        };
      if (v.homed && v.trusted) {
        ids.push("measure");
        notes.measure = `Model height reading ${fmt(v.geometry.extension ?? 0, 2)} m (already metres).`;
      }
      if (v.run) {
        ids.push("goal");
        notes.goal = `Model moves toward ${fmt(clamp(v.inputs.targetHeightM ?? 0, 0, 1.5), 2)} m at up to 0.5 m/s.`;
      }
      return { ids, notes };
    },
  },
  "telescoping-arm": {
    title:
      "Telescoping arm: shoulder pivot, nested stages, gripper and workspace",
    numbers: {
      targetAngleRad: { label: "Shoulder target angle", min: -1, max: 1.4 },
    },
    scenarios: [
      {
        id: "ready",
        label: "Home + request",
        home: true,
        set: { ...HEALTHY },
        note: "Records the home switch with the request released, then holds the request.",
      },
      {
        id: "unhomed",
        label: "Gated: unhomed (new run)",
        fresh: true,
        set: { ...HEALTHY, request: true },
        note: "New run without a home reference: the request is held but nothing moves.",
      },
      {
        id: "swing",
        label: "Big swing, long reach",
        set: { targetAngleRad: 1.3, targetExtensionM: 1 },
        note: "Watch the extension retract toward 0 until the shoulder is within 0.1 rad.",
      },
      {
        id: "low",
        label: "Low reach",
        set: { targetAngleRad: -0.6, targetExtensionM: 0.6 },
        note: "Goal moved below horizontal.",
      },
    ],
    plot: {
      unit: "rad / m",
      min: -1.1,
      max: 1.5,
      series: [
        {
          label: "Shoulder angle (rad)",
          cls: "actual",
          get: (s) => s.angle ?? 0,
        },
        {
          label: "Shoulder goal (rad)",
          cls: "goal",
          get: (s, i) => clamp(i.targetAngleRad ?? 0, -1, 1.4),
        },
        { label: "Extension (m)", cls: "aux", get: (s) => s.extension ?? 0 },
      ],
    },
    related(v) {
      const ids = [],
        notes = {};
      if (v.run) {
        ids.push("shoulder", "gate", "extend");
        const err =
          clamp(v.inputs.targetAngleRad ?? 0, -1, 1.4) -
          (v.geometry.angle ?? 0);
        notes.shoulder =
          "Model requests the shoulder goal (moves at up to 0.8 rad/s).";
        notes.gate = `Model shoulder error ${fmt(err, 2)} rad vs 0.1 rad: ${v.gate.shoulder ? "near" : "not near"}.`;
        notes.extend = v.gate.shoulder
          ? `Model extension target ${fmt(clamp(v.inputs.targetExtensionM ?? 0, 0, 1), 2)} m.`
          : "Model extension target 0 m.";
      }
      return { ids, notes };
    },
  },
  drivetrain: {
    title:
      "Drivetrain: field pose with path, and a robot-frame chassis with module vectors",
    numbers: {},
    scenarios: [
      {
        id: "differential",
        label: "Compare differential",
        set: { differential: true },
        note: "Wheels stay aligned with the chassis; lateral velocity is discarded.",
      },
      {
        id: "swerve",
        label: "Compare swerve",
        set: { differential: false },
        note: "Holonomic mode permits lateral velocity.",
      },
      {
        id: "ready",
        label: "Ready: arc",
        set: {
          ...HEALTHY,
          vxMps: 1,
          vyMps: 0,
          omegaRadPerSec: 0.4,
          request: true,
        },
        note: "Forward while turning: the pose traces an arc.",
      },
      {
        id: "forward",
        label: "Forward",
        set: { vxMps: 1.5, vyMps: 0, omegaRadPerSec: 0 },
        note: "Pure forward request: every module points forward.",
      },
      {
        id: "strafe",
        label: "Strafe left",
        set: { vxMps: 0, vyMps: 1.5, omegaRadPerSec: 0 },
        note: "Sideways request: swerve modules point left. Differential mode discards this lateral request.",
      },
      {
        id: "spin",
        label: "Spin in place",
        set: { vxMps: 0, vyMps: 0, omegaRadPerSec: 1.5 },
        note: "Pure rotation: modules point tangentially around the centre.",
      },
    ],
    plot: {
      unit: "rad, rad/s",
      min: -3.3,
      max: 3.3,
      series: [
        { label: "Heading (rad)", cls: "actual", get: (s) => s.angle ?? 0 },
        {
          label: "Commanded ω (rad/s)",
          cls: "aux",
          get: (s) => s.outputs?.omegaRadPerSec ?? 0,
        },
      ],
    },
    related(v) {
      const ids = [],
        notes = {
          alliance:
            "Not mapped: no alliance sign or joystick scaling in the model.",
          skew: "Not mapped: no skew compensation in the model.",
        };
      if (v.run && v.moving) {
        ids.push("frames");
        notes.frames =
          "Related, not identical: the model rotates robot-relative speeds by the heading to move the field pose.";
      }
      return { ids, notes };
    },
  },
  "climb-balance": {
    title: "Climber: mast, winch, cable, hook carriage and cage sensor",
    numbers: { targetHeightM: { label: "Lift target height", max: 1.2 } },
    scenarios: [
      {
        id: "ready",
        label: "Home + request",
        home: true,
        set: { ...HEALTHY },
        note: "Records the home switch with the request released, then holds the request. Lift still waits for the cage sensor.",
      },
      {
        id: "unhomed",
        label: "Gated: unhomed (new run)",
        fresh: true,
        set: { ...HEALTHY, request: true },
        note: "New run without a home reference: the request is held but nothing moves.",
      },
      {
        id: "cage",
        label: "Cage detected",
        set: { cageDetected: true },
        note: "Cage sensor input on: lifting is allowed. Detection is not proof of engagement.",
      },
      {
        id: "cage-lost",
        label: "Cage lost",
        set: { cageDetected: false },
        note: "Cage sensor input off: the model stops lifting and waits (no fault).",
      },
    ],
    plot: {
      unit: "m",
      min: 0,
      max: 1.3,
      series: [
        { label: "Lift height", cls: "actual", get: (s) => s.extension ?? 0 },
        {
          label: "Height goal (input)",
          cls: "goal",
          get: (s, i) => clamp(i.targetHeightM ?? 0, 0, 1.2),
        },
      ],
    },
    related(v) {
      const ids = [],
        notes = {
          gate: "Not mapped: the model has no current or roller-speed check.",
        };
      if (v.inputs.request && !v.homed && !v.fault) {
        ids.push("homed");
        notes.homed =
          "Model: request held while unhomed → stays idle, like the source's IDLED branch.";
      } else
        notes.homed = v.homed
          ? "Model home recorded; this check passes."
          : "Model is unhomed.";
      if (v.run) {
        ids.push("cage");
        notes.cage = v.inputs.cageDetected
          ? "Model: cage sensor input true → lift may move. The source infers a cage from current and speed instead."
          : "Model: waiting for the cage sensor input.";
      }
      return { ids, notes };
    },
  },
};

const NUMBERS = {
  targetHeadingRad: {
    label: "Chassis target heading",
    unit: "rad",
    min: -3.14,
    max: 3.14,
    step: 0.01,
    deg: true,
  },
  targetRadPerSec: {
    label: "Flywheel target speed",
    unit: "rad/s",
    min: 0,
    max: 400,
    step: 5,
  },
  targetAngleRad: {
    label: "Turret target (robot-relative)",
    unit: "rad",
    min: -8,
    max: 8,
    step: 0.001,
    deg: true,
  },
  targetHeightM: {
    label: "Target height",
    unit: "m",
    min: 0,
    max: 1.5,
    step: 0.01,
  },
  targetWristRad: {
    label: "Wrist target angle",
    unit: "rad",
    min: -1.2,
    max: 1.2,
    step: 0.01,
    deg: true,
  },
  targetExtensionM: {
    label: "Target extension",
    unit: "m",
    min: 0,
    max: 1,
    step: 0.01,
  },
  vxMps: {
    label: "Forward speed vx (robot frame)",
    unit: "m/s",
    min: -3,
    max: 3,
    step: 0.1,
  },
  vyMps: {
    label: "Left speed vy (robot frame)",
    unit: "m/s",
    min: -3,
    max: 3,
    step: 0.1,
  },
  omegaRadPerSec: {
    label: "Turn rate ω (counter-clockwise +)",
    unit: "rad/s",
    min: -3,
    max: 3,
    step: 0.05,
    deg: false,
  },
};
const BOOLS = {
  differential: {
    group: "operator",
    label: "Differential drive (no strafe)",
    help: "Discards lateral velocity; forward and turning requests remain available.",
  },
  enabled: {
    group: "operator",
    label: "Robot enabled",
    help: "Disable stops outputs. Release the request before restarting; disable itself is not a fault.",
  },
  sensorValid: {
    label: "Sensor reports valid",
    help: "Clear = invalid reading.",
  },
  stale: {
    label: "Signal stale",
    help: "Reading too old to trust.",
    fault: true,
  },
  obstructed: {
    label: "Obstruction reported",
    help: "Input only; no contact is simulated.",
    fault: true,
  },
  pieceDetected: { label: "Piece sensor detects a piece" },
  frontLeft: { label: "Front-left (FL) range sensor tripped" },
  frontRight: { label: "Front-right (FR) range sensor tripped" },
  backSensor: { label: "Back range sensor tripped" },
  cageDetected: {
    label: "Cage sensor detects the cage",
    help: "Detection is not proof of engagement.",
  },
};
const PULSES = {
  reset: {
    label: "Reset fault",
    help: "Clears a latched fault only after the cause is gone and the request is released.",
  },
  home: {
    label: "Record home switch",
    help: "Records an assumed home-switch event (no homing motion). Ignored while the request is held.",
  },
};
const NAMES = {
  frontLeft: "Front-left (FL)",
  frontRight: "Front-right (FR)",
  backSensor: "Back",
  flywheelTargetRadPerSec: "Flywheel target",
  feed: "Feed rollers",
  roller: "Roller power",
  elevatorMps: "Elevator speed",
  wristRadPerSec: "Wrist speed",
  shoulderRadPerSec: "Shoulder speed",
  extensionMps: "Extension speed",
  vxMps: "Forward vx",
  vyMps: "Left vy",
  omegaRadPerSec: "Turn rate ω",
  liftMps: "Lift speed",
};
const humanize = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
function controlSpec(key, value) {
  if (key === "request") return { group: "operator", kind: "request" };
  if (PULSES[key]) return { group: "operator", kind: "pulse", ...PULSES[key] };
  if (typeof value === "boolean")
    return {
      group: "sensors",
      kind: "bool",
      label: humanize(key),
      ...BOOLS[key],
    };
  const base =
    NUMBERS[key] ||
    (() => {
      const span = Math.max(1, Math.abs(value) * 2);
      return {
        label: humanize(key),
        unit: "",
        min: -span,
        max: span,
        step: span / 100,
      };
    })();
  return {
    group: "goal",
    kind: "num",
    ...base,
    ...(DEMOS[DEMO]?.numbers?.[key] || {}),
  };
}

// ---------- engine ----------
let M = null,
  config = DEMOS[DEMO],
  defaults = {},
  state,
  inputs,
  sampledInputs = {},
  pulses = {},
  afterStep = [],
  history = [],
  vis,
  running = false,
  onScreen = true,
  rafId = 0,
  lastFrame = null,
  accumulator = 0,
  update = null,
  lastAnnounce = "",
  lastHighlight = "",
  sourceSteps = null;
const ui = {};

function freshVisuals() {
  return {
    wheel: 0,
    feed: 0,
    roller: 0,
    turretMoving: false,
    path: [{ x: 0, y: 0 }],
    steps: 0,
    modules: [0, 0, 0, 0],
  };
}
function resetExperiment(announceIt = true) {
  setRunning(false);
  state = M.createState(DEMO);
  inputs = M.defaultInputs(DEMO);
  sampledInputs = { ...inputs };
  pulses = {};
  afterStep = [];
  vis = freshVisuals();
  history = [];
  record();
  syncControls();
  setText(ui.scenarioNote, "");
  if (announceIt)
    announce("Experiment reset: new model state and default inputs.");
  render();
}
function record() {
  const fault = !!state.fault;
  history.push({
    v: config.plot.series.map((s) => s.get(state, inputs)),
    fault,
  });
  if (history.length > HISTORY) history.shift();
}
function step() {
  const applied = { ...inputs, ...pulses };
  pulses = {};
  const prev = state;
  state = M.stepDemo(DEMO, prev, applied, DT);
  sampledInputs = { ...applied, reset: false, home: false };
  const out = state.outputs || {};
  vis.wheel += ((state.velocityRadPerSec || 0) * DT) / WHEEL_SLOWDOWN;
  vis.feed += (out.feed || 0) * DT * 9;
  vis.roller += (out.roller || 0) * DT * 6;
  vis.turretMoving =
    Math.abs(wrap((state.angle || 0) - (prev.angle || 0))) > 1e-7;
  vis.steps++;
  if (DEMO === "drivetrain" && vis.steps % 3 === 0) {
    vis.path.push({ x: state.x, y: state.y });
    if (vis.path.length > 500) vis.path.shift();
  }
  record();
  const callbacks = afterStep;
  afterStep = [];
  for (const fn of callbacks) fn();
}
const isActive = () => running && onScreen && !document.hidden;
function schedule() {
  if (isActive() && !rafId) {
    lastFrame = null;
    rafId = requestAnimationFrame(frame);
  }
  paintRunState();
}
function frame(t) {
  rafId = 0;
  if (!isActive()) {
    lastFrame = null;
    paintRunState();
    return;
  }
  if (lastFrame !== null) {
    accumulator += Math.min((t - lastFrame) / 1000, MAX_FRAME);
    while (accumulator >= DT) {
      step();
      accumulator -= DT;
    }
  }
  lastFrame = t;
  render();
  rafId = requestAnimationFrame(frame);
}
function setRunning(on) {
  running = on;
  accumulator = 0;
  lastFrame = null;
  setText(ui.run, on ? "Pause" : "Run");
  ui.run.setAttribute("aria-pressed", String(on));
  schedule();
}
function paintRunState() {
  const text = !running
    ? reducedMotion.matches && vis?.steps === 0
      ? "Paused (reduced motion) — press Run"
      : "Paused"
    : document.hidden
      ? "Paused while the tab is hidden"
      : !onScreen
        ? "Paused while off-screen"
        : "Running";
  setText(ui.runState, text);
  ui.main.dataset.running = String(isActive());
}
function announce(text) {
  ui.announce.textContent = text;
}

// ---------- controls ----------
function buildControls() {
  const host = ui.inputs;
  host.textContent = "";
  const groups = { operator: [], goal: [], sensors: [] };
  for (const [key, value] of Object.entries(defaults)) {
    const spec = controlSpec(key, value);
    groups[spec.group].push([key, spec]);
  }
  ui.controls = {};
  const operator = h("fieldset", {}, host);
  h("legend", {}, operator, "Operator");
  const stack = h("div", { class: "mech-stack" }, operator);
  const pulseRow = h("div", { class: "mech-row" });
  const notes = [];
  for (const [key, spec] of groups.operator) {
    if (spec.kind === "request") {
      const button = h(
        "button",
        {
          type: "button",
          id: "in-request",
          class: "mech-request",
          "aria-pressed": "false",
          "aria-describedby": "request-help",
        },
        stack,
      );
      h("span", { class: "mech-request-dot", "aria-hidden": "true" }, button);
      h("span", {}, button, "Hold request");
      ui.requestState = h(
        "span",
        { class: "mech-request-state", "aria-hidden": "true" },
        button,
        "released",
      );
      h(
        "p",
        { class: "note", id: "request-help" },
        stack,
        "Press to hold the operator request; press again to release it.",
      );
      button.addEventListener("click", () =>
        setInput("request", !inputs.request),
      );
      ui.controls.request = { kind: "request", button };
    } else if (spec.kind === "pulse") {
      const button = h(
        "button",
        {
          type: "button",
          id: `pulse-${key}`,
          class: "secondary mech-pulse",
          "aria-describedby": `pulse-${key}-help`,
        },
        pulseRow,
        spec.label,
      );
      notes.push(
        h("p", { class: "note", id: `pulse-${key}-help` }, null, spec.help),
      );
      button.addEventListener("click", () => firePulse(key));
    } else stack.append(boolControl(key, spec));
  }
  if (pulseRow.childElementCount) stack.append(pulseRow, ...notes);
  if (groups.goal.length) {
    const fs = h("fieldset", {}, host);
    h("legend", {}, fs, "Goal / setpoints");
    const box = h("div", { class: "mech-stack" }, fs);
    for (const [key, spec] of groups.goal) box.append(numberControl(key, spec));
  }
  const sensors = h("fieldset", {}, host);
  h("legend", {}, sensors, "Sensor inputs and faults");
  const box = h("div", { class: "mech-stack" }, sensors);
  for (const [key, spec] of groups.sensors) box.append(boolControl(key, spec));
}
function boolControl(key, spec) {
  const label = h("label", {
    class: "mech-bool",
    for: `in-${key}`,
    "data-kind": spec.fault ? "fault" : "input",
  });
  const input = h("input", { type: "checkbox", id: `in-${key}` }, label);
  const text = h("span", {}, label, spec.label);
  if (spec.help) h("small", {}, text, spec.help);
  input.addEventListener("change", () => setInput(key, input.checked));
  ui.controls[key] = { kind: "bool", input };
  return label;
}
function numberControl(key, spec) {
  const wrapEl = h("div", { class: "mech-num" });
  const head = h("div", { class: "mech-num-head" }, wrapEl);
  h("label", { for: `in-${key}` }, head, spec.label);
  if (spec.unit) h("span", { class: "mech-unit" }, head, `(${spec.unit})`);
  const hint = h("span", { class: "mech-hint", id: `hint-${key}` }, head);
  const row = h("div", { class: "mech-num-row" }, wrapEl);
  const attrs = { min: spec.min, max: spec.max, step: spec.step };
  const range = h(
    "input",
    {
      type: "range",
      id: `in-${key}`,
      ...attrs,
      "aria-describedby": `hint-${key}`,
    },
    row,
  );
  const num = h(
    "input",
    {
      type: "number",
      id: `in-${key}-num`,
      ...attrs,
      inputmode: "decimal",
      "aria-label": `${spec.label}${spec.unit ? ` (${spec.unit})` : ""}, exact value`,
    },
    row,
  );
  const apply = (raw) => {
    const n = Number(raw);
    setInput(
      key,
      Number.isFinite(n) ? clamp(n, spec.min, spec.max) : inputs[key],
    );
  };
  range.addEventListener("input", () => apply(range.value));
  num.addEventListener("change", () => apply(num.value));
  num.addEventListener("keydown", (event) => {
    if (event.key === "Enter") apply(num.value);
  });
  ui.controls[key] = { kind: "num", range, num, hint, spec };
  return wrapEl;
}
function decimals(step) {
  const s = String(step);
  return s.includes(".") ? s.split(".")[1].length : 0;
}
function syncControls() {
  for (const [key, c] of Object.entries(ui.controls || {})) {
    const value = inputs[key];
    if (c.kind === "request") {
      c.button.setAttribute("aria-pressed", String(!!value));
      setText(ui.requestState, value ? "held" : "released");
    } else if (c.kind === "bool") c.input.checked = !!value;
    else if (c.kind === "num") {
      const d = decimals(c.spec.step),
        text = fmt(value, d);
      if (document.activeElement !== c.num) c.num.value = text;
      c.range.value = String(value);
      const valueText =
        `${text} ${c.spec.unit}`.trim() +
        (c.spec.deg ? ` (${degText(value)})` : "");
      c.range.setAttribute("aria-valuetext", valueText);
      setText(c.hint, c.spec.deg ? `≈ ${degText(value)}` : "");
    }
  }
}
function setInput(key, value) {
  inputs[key] = value;
  syncControls();
  if (!isActive()) render();
}
// Momentary inputs (reset fault, record home) are applied for exactly one 20 ms step.
// While paused, that step happens immediately so the effect is visible.
function firePulse(key) {
  pulses[key] = true;
  const before = { fault: !!state.fault, homed: !!state.homed };
  afterStep.push(() => {
    if (key === "reset")
      announce(
        before.fault && !state.fault
          ? "Fault cleared. Hold the request to start again."
          : before.fault
            ? `Fault not cleared: ${inputs.request ? "release the request first" : "a cause is still present"}.`
            : "No fault was latched.",
      );
    if (key === "home")
      announce(
        state.homed && !before.homed
          ? "Home switch recorded."
          : state.homed
            ? "Home already recorded."
            : `Home not recorded: ${inputs.request ? "release the request first" : state.fault ? "clear the fault first" : "inputs are not healthy"}.`,
      );
  });
  if (!isActive()) {
    step();
    render();
  }
}
function applyScenario(sc) {
  if (sc.fresh) resetExperiment(false);
  Object.assign(inputs, sc.set);
  if (sc.home && !state.homed) {
    // Home needs the request released for one step, then the request is held.
    inputs.request = false;
    pulses.home = true;
    afterStep.push(() => {
      inputs.request = true;
      syncControls();
    });
    if (!isActive()) step();
  } else if (sc.home) inputs.request = true;
  syncControls();
  setText(ui.scenarioNote, sc.note || "");
  announce(
    `Scenario: ${sc.label}. ${sc.note || ""}${state.fault ? " A fault is still latched." : ""}`,
  );
  render();
}
function buildScenarios() {
  const host = ui.scenarios;
  host.textContent = "";
  for (const sc of [...config.scenarios, ...COMMON_SCENARIOS]) {
    const button = h(
      "button",
      { type: "button", "data-scenario": sc.id },
      host,
      sc.label,
    );
    button.addEventListener("click", () => applyScenario(sc));
  }
}

// ---------- readouts ----------
function view() {
  const desc = M.describeDemo(DEMO, state, sampledInputs);
  const out = Object.fromEntries(
    (desc.outputs || []).map((o) => [o.name, o.value]),
  );
  const gate = Object.fromEntries((desc.gates || []).map((g) => [g.id, g.ok]));
  const fault =
    typeof state.fault === "boolean" ? state.fault : gate.armed === false;
  return {
    state,
    inputs: sampledInputs,
    desc,
    out,
    gate,
    fault,
    run:
      !!sampledInputs.request &&
      !!sampledInputs.enabled &&
      !fault &&
      !state.needsRelease &&
      (!("home" in defaults) || !!state.homed),
    homed: !!state.homed,
    needsHome: "home" in defaults,
    trusted: sampledInputs.sensorValid !== false && !sampledInputs.stale,
    moving: (desc.activeTrace || []).includes("motion"),
    vis,
    reduced: reducedMotion.matches,
    geometry: desc.geometry || {},
  };
}
function valueCell(td, value, unit) {
  if (typeof value === "boolean") {
    const span = td.firstChild?.classList?.contains("mech-bool-val")
      ? td.firstChild
      : null;
    if (!span) {
      td.textContent = "";
      h("span", { class: "mech-bool-val" }, td);
    }
    const node = td.firstChild;
    node.dataset.v = String(value);
    setText(node, value ? "● true" : "○ false");
    return;
  }
  let text =
    typeof value === "number"
      ? fmt(value, unit === "rad/s" && Math.abs(value) > 20 ? 1 : 3)
      : String(value);
  if (unit && unit !== "fraction" && unit !== "boolean") text += ` ${unit}`;
  if (unit === "rad" && typeof value === "number")
    text += ` (${degText(value)})`;
  setText(td, text);
}
function fillTable(tbody, rows, cacheKey) {
  const signature = rows.map((r) => r.name).join("|");
  if (tbody.dataset.sig !== signature) {
    tbody.textContent = "";
    for (const r of rows) {
      const tr = h("tr", {}, tbody),
        th = h("th", { scope: "row" }, tr);
      h("span", {}, th, NAMES[r.name] || r.name);
      if (NAMES[r.name]) {
        th.append(" ");
        h("code", {}, th, r.name);
      }
      h("td", { class: "num" }, tr);
    }
    if (!rows.length)
      h(
        "td",
        { colspan: 2, class: "note" },
        h("tr", {}, tbody),
        cacheKey === "outputs" ? "No outputs requested." : "—",
      );
    tbody.dataset.sig = signature;
  }
  rows.forEach((r, i) => valueCell(tbody.rows[i].cells[1], r.value, r.unit));
}
function renderGates(v) {
  const list = ui.gates,
    gates = v.desc.gates || [];
  const signature = gates.map((g) => g.id).join("|");
  if (list.dataset.sig !== signature) {
    list.textContent = "";
    for (const g of gates) {
      const li = h("li", {}, list);
      h("span", { class: "mark", "aria-hidden": "true" }, li);
      h("span", {}, li, g.label);
      h("span", { class: "visually-hidden" }, li);
    }
    list.dataset.sig = signature;
  }
  gates.forEach((g, i) => {
    const li = list.children[i];
    li.dataset.ok = String(!!g.ok);
    setText(li.children[0], g.ok ? "✓" : "✕");
    setText(li.children[2], g.ok ? " (met)" : " (not met)");
  });
}
function renderHelp(v) {
  const box = ui.help,
    causes = [];
  if (!v.inputs.enabled) causes.push("robot disabled");
  if (!v.inputs.sensorValid) causes.push("sensor invalid");
  if (v.inputs.stale) causes.push("signal stale");
  if (v.inputs.obstructed) causes.push("obstruction reported");
  let html = null;
  if (v.fault)
    html = {
      tone: "fault",
      title: "Fault latched — outputs stopped. To recover:",
      steps: [
        [
          causes.length
            ? `Remove the cause (${causes.join(", ")}).`
            : "Cause removed.",
          !causes.length,
        ],
        [
          v.inputs.request ? "Release the request." : "Request released.",
          !v.inputs.request,
        ],
        ["Press Reset fault.", false],
        ["Hold the request again.", false],
      ],
    };
  else if (v.needsHome && !v.homed)
    html = {
      tone: "wait",
      title: "No home reference — motion is blocked.",
      steps: [
        [
          v.inputs.request
            ? "Release the request (home is ignored while it is held)."
            : "Request released.",
          !v.inputs.request,
        ],
        ["Press Record home switch.", false],
      ],
    };
  const signature = html ? JSON.stringify(html) : "";
  if (box.dataset.sig === signature) return;
  box.dataset.sig = signature;
  box.hidden = !html;
  box.textContent = "";
  if (!html) return;
  box.dataset.tone = html.tone;
  h("strong", {}, box, html.title);
  const ol = h("ol", {}, box);
  for (const [text, done] of html.steps)
    h("li", { "data-done": String(done) }, ol, text);
}
function renderPath(v) {
  const active = new Set(v.desc.activeTrace || []);
  const blocked = (v.desc.gates || []).filter((g) => !g.ok);
  const sensorsOn = (v.desc.sensors || [])
    .filter(
      (s) =>
        typeof s.value === "boolean" &&
        !/^(Sensor valid|Signal stale)$/.test(s.name),
    )
    .map((s) => `${NAMES[s.name] || s.name} ${s.value ? "on" : "off"}`);
  const outputs = (v.desc.outputs || []).map(
    (o) => `${NAMES[o.name] || o.name} ${fmt(o.value, 2)}`,
  );
  const details = {
    input: `Request ${v.inputs.request ? "held" : "released"}${v.inputs.enabled ? "" : " · robot disabled"}`,
    sensor: [
      v.trusted ? "Readings valid and fresh" : `Reading ${untrustedText(v)}`,
      ...sensorsOn,
    ].join(" · "),
    condition: blocked.length
      ? `Blocked by: ${blocked.map((g) => g.label).join("; ")}`
      : "All gates met",
    output: outputs.length ? outputs.join(" · ") : "No outputs (stopped)",
    motion: v.moving ? "Mechanism moving in the model" : "Still",
  };
  for (const li of ui.path.children) {
    const stage = li.dataset.stage;
    li.dataset.active = String(active.has(stage));
    li.dataset.blocked = String(stage === "condition" && blocked.length > 0);
    const d = li.querySelector(".detail");
    if (d) setText(d, details[stage] || "");
  }
}
function renderPlot() {
  const p = config.plot,
    n = history.length,
    X0 = 44,
    X1 = 472,
    Y0 = 10,
    Y1 = 104;
  const x = (i) => X0 + ((HISTORY - n + i) / (HISTORY - 1)) * (X1 - X0),
    y = (val) =>
      Y1 - ((clamp(val, p.min, p.max) - p.min) / (p.max - p.min)) * (Y1 - Y0);
  ui.plotLines.forEach((line, k) => {
    set(line, {
      points: history.map((s, i) => `${r1(x(i))},${r1(y(s.v[k]))}`).join(" "),
    });
  });
  let d = "",
    start = -1;
  history.forEach((s, i) => {
    if (s.fault && start < 0) start = i;
    if ((!s.fault || i === n - 1) && start >= 0) {
      const end = s.fault ? i : i - 1;
      d += `M${r1(x(start))} ${Y0}H${r1(x(end) + 1.5)}V${Y1}H${r1(x(start))}Z`;
      start = -1;
    }
  });
  set(ui.plotFault, { d });
}
function buildPlot() {
  const svg = ui.plot,
    p = config.plot;
  svg.textContent = "";
  S("rect", { x: 44, y: 10, width: 428, height: 94, class: "p-area" }, svg);
  ui.plotFault = S("path", { class: "p-fault" }, svg);
  if (p.min < 0 && p.max > 0) {
    const yz = 104 - ((0 - p.min) / (p.max - p.min)) * 94;
    S("line", { x1: 44, x2: 472, y1: yz, y2: yz, class: "p-zero" }, svg);
  }
  S(
    "text",
    { x: 40, y: 16, "text-anchor": "end", class: "m-label" },
    svg,
    fmt(p.max, 1),
  );
  S(
    "text",
    { x: 40, y: 106, "text-anchor": "end", class: "m-label" },
    svg,
    fmt(p.min, 1),
  );
  S(
    "text",
    { x: 472, y: 122, "text-anchor": "end", class: "m-label" },
    svg,
    "now",
  );
  S("text", { x: 44, y: 122, class: "m-label" }, svg, `−6 s · ${p.unit}`);
  ui.plotLines = p.series.map((s) =>
    S("polyline", { class: `p-${s.cls}` }, svg),
  );
  const cap = ui.plotCaption;
  cap.textContent = "";
  const ul = h("ul", { class: "mech-legend" }, cap);
  for (const s of p.series) {
    const li = h("li", {}, ul);
    h(
      "span",
      {
        class:
          "mech-swatch" +
          (s.cls === "goal" ? " is-goal" : s.cls === "aux" ? " is-sense" : ""),
        "aria-hidden": "true",
      },
      li,
    );
    li.append(s.label);
  }
  const li = h("li", {}, ul);
  h("span", { class: "mech-swatch is-fault", "aria-hidden": "true" }, li);
  li.append("Fault latched (shaded)");
  set(svg, {
    "aria-label": `Last 6 seconds of ${p.series.map((s) => s.label).join(", ")} (${p.unit}). The same values are listed in the tables above.`,
  });
}
function phaseTone(v) {
  if (v.fault) return "fault";
  if (
    [
      "unreachable",
      "incompatible",
      "aligning",
      "raising",
      "stowing",
      "waiting",
      "preparing",
      "spent",
    ].includes(v.desc.phase)
  )
    return "wait";
  if (v.run) return "active";
  if (v.inputs.request || (v.needsHome && !v.homed)) return "wait";
  return "";
}
function render() {
  if (!M) return;
  const v = view();
  update?.(v);
  ui.previewUpdate?.(v);
  const pending = Object.keys(inputs).some(
    (key) =>
      !["reset", "home"].includes(key) && inputs[key] !== sampledInputs[key],
  );
  ui.main.dataset.pending = String(pending);
  if (ui.pending) ui.pending.hidden = !pending;
  const tone = phaseTone(v);
  ui.tag?.(
    v.fault ? "FAULT" : String(v.desc.phase).toUpperCase(),
    tone === "wait" ? "" : tone,
  );
  ui.previewTag?.(
    v.fault ? "FAULT" : String(v.desc.phase).toUpperCase(),
    tone === "wait" ? "" : tone,
  );
  ui.svg.classList.toggle("is-fault", v.fault);
  setText(
    ui.phase,
    v.fault ? `${v.desc.phase} · fault latched` : String(v.desc.phase),
  );
  ui.phase.dataset.tone = tone;
  setText(ui.reason, v.desc.reason || "");
  setText(ui.time, fmt(state.time || 0, 2));
  renderGates(v);
  renderHelp(v);
  fillTable(ui.sensors, v.desc.sensors || [], "sensors");
  fillTable(ui.outputs, v.desc.outputs || [], "outputs");
  renderPath(v);
  renderPlot();
  renderSourceHighlight(v);
  Object.assign(ui.main.dataset, {
    phase: v.desc.phase,
    fault: String(v.fault),
    homed: String(v.homed),
  });
  // Announce only state changes, never every 20 ms update.
  const key = `${v.desc.phase}|${v.fault}|${v.homed}`;
  if (key !== lastAnnounce) {
    if (lastAnnounce)
      announce(
        `${v.fault ? "Fault latched. " : ""}Phase ${v.desc.phase}. ${v.desc.reason || ""}`,
      );
    lastAnnounce = key;
  }
}

// ---------- related real source (read-only text) ----------
function lineRanges(lines) {
  const sorted = [...new Set(lines)].sort((a, b) => a - b),
    parts = [];
  for (let i = 0; i < sorted.length; i++) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(i === j ? `${sorted[i]}` : `${sorted[i]}–${sorted[j]}`);
    i = j;
  }
  return parts.join(", ");
}
async function loadSource() {
  const host = ui.source;
  let src = null;
  try {
    const response = await fetch("mechanism-sources.json", {
      cache: "no-cache",
    });
    if (!response.ok) throw new Error(String(response.status));
    src = (await response.json())?.demos?.[DEMO] || null;
  } catch {}
  if (!src) {
    const p = h(
      "p",
      { class: "note" },
      host,
      "The source excerpt could not be loaded here. Use the pinned link above.",
    );
    return p;
  }
  ui.sourceFallback?.remove();
  const meta = h("p", { class: "mech-source-meta" }, host);
  h(
    "strong",
    {},
    meta,
    `${src.team || "Team"} · ${src.season || ""} · ${src.title || ""}`,
  );
  meta.append(h("br"));
  const file = String(src.file || "")
    .split("/")
    .pop();
  h("code", {}, meta, file);
  meta.append(`, lines ${src.startLine}–${src.endLine} at revision `);
  h("code", {}, meta, String(src.revision || "").slice(0, 7));
  meta.append(". ");
  if (/^https:\/\/github\.com\//.test(src.url || ""))
    link(src.url, "Pinned source", meta);
  const licenseHref = /^labs\/licenses\/[\w.-]+$/.test(src.licenseFile || "")
    ? src.licenseFile.replace(/^labs\//, "")
    : null;
  if (licenseHref) {
    meta.append(" · ");
    link(licenseHref, `${src.license || "License"} license`, meta);
  } else if (src.license) meta.append(` · ${src.license} license`);
  if (src.explanation) h("p", { class: "note" }, host, src.explanation);
  const lines =
    typeof src.excerpt === "string"
      ? src.excerpt.replace(/\n$/, "").split("\n")
      : [];
  ui.codeLines = new Map();
  if (lines.length && Number.isInteger(src.startLine)) {
    const pre = h(
      "pre",
      {
        class: "mech-code",
        id: "mech-code",
        tabindex: "0",
        role: "region",
        "aria-label": `${file} lines ${src.startLine}–${src.endLine}, Java, read-only`,
      },
      host,
    );
    const code = h("code", {}, pre);
    lines.forEach((text, i) => {
      const n = src.startLine + i,
        row = h("span", { class: "ln", "data-line": n }, code);
      h("span", { class: "ln-no", "aria-hidden": "true" }, row, String(n));
      h("span", { class: "ln-text" }, row, text || " ");
      ui.codeLines.set(n, row);
    });
    ui.code = pre;
  } else
    h(
      "p",
      { class: "note" },
      host,
      "No excerpt is available; follow the pinned link to read the code.",
    );
  h(
    "p",
    { class: "note" },
    host,
    "Highlighted lines and steps mark a conceptual correspondence chosen for teaching between the browser model's current decision and this code. The Java is not executed.",
  );
  const steps = h("ol", { class: "mech-steps", id: "mech-source-steps" }, host);
  sourceSteps = (Array.isArray(src.trace) ? src.trace : []).map((t) => {
    const li = h(
      "li",
      { "data-trace-id": t.id, "data-active": "false" },
      steps,
    );
    const head = h("div", { class: "step-head" }, li);
    h("span", {}, head, t.label || t.id);
    h(
      "span",
      { class: "step-lines" },
      head,
      Array.isArray(t.sourceLines) && t.sourceLines.length
        ? `lines ${lineRanges(t.sourceLines)}`
        : "",
    );
    if (t.explanation) h("span", {}, li, t.explanation);
    const model = h("span", { class: "step-model" }, li);
    return {
      id: t.id,
      lines: Array.isArray(t.sourceLines) ? t.sourceLines : [],
      li,
      model,
    };
  });
  if (Array.isArray(src.differences) && src.differences.length) {
    const details = h("details", {}, host);
    h("summary", {}, details, "How the real code differs from this model");
    const ul = h("ul", {}, details);
    for (const d of src.differences) h("li", {}, ul, d);
  }
  lastHighlight = "";
  render();
}
function renderSourceHighlight(v) {
  if (!sourceSteps) return;
  const { ids = [], notes = {} } = config.related?.(v) || {};
  const active = new Set(
    ids.filter((id) => sourceSteps.some((s) => s.id === id)),
  );
  for (const s of sourceSteps)
    setText(s.model, notes[s.id] ? `This model now: ${notes[s.id]}` : "");
  const key = [...active].join("|");
  if (key === lastHighlight) return;
  lastHighlight = key;
  const lit = new Set();
  for (const s of sourceSteps) {
    s.li.dataset.active = String(active.has(s.id));
    if (active.has(s.id)) s.lines.forEach((n) => lit.add(n));
  }
  let first = null;
  for (const [n, row] of ui.codeLines || []) {
    row.classList.toggle("is-hl", lit.has(n));
    if (lit.has(n) && !first) first = row;
  }
  // Scroll only inside the code pane, never the page.
  const pre = ui.code;
  if (pre && first) {
    const top = first.offsetTop,
      bottom = top + first.offsetHeight;
    if (top < pre.scrollTop || bottom > pre.scrollTop + pre.clientHeight)
      pre.scrollTop = Math.max(0, top - 24);
  }
}

// ---------- start ----------
async function start() {
  Object.assign(ui, {
    main: $("mech"),
    svg: $("mech-svg"),
    run: $("mech-run"),
    stepBtn: $("mech-step"),
    reset: $("mech-reset"),
    runState: $("mech-runstate"),
    time: $("mech-time"),
    phase: $("mech-phase"),
    reason: $("mech-reason"),
    gates: $("mech-gates"),
    help: $("mech-help"),
    announce: $("mech-announce"),
    pending: $("mech-pending"),
    previewSvg: $("mech-code-svg"),
    inputs: $("mech-inputs"),
    scenarios: $("mech-scenarios"),
    scenarioNote: $("mech-scenario-note"),
    sensors: $("mech-sensors"),
    outputs: $("mech-outputs"),
    plot: $("mech-plot"),
    plotCaption: $("mech-plot-caption"),
    path: $("mech-path"),
    source: $("mech-source"),
    sourceFallback: $("mech-source-fallback"),
  });
  if (!config || !ui.main) return;
  try {
    M = await import("./mechanism-models.mjs");
    if (!M.DEMO_IDS?.includes(DEMO))
      throw new Error(`Unknown mechanism: ${DEMO}`);
    defaults = M.defaultInputs(DEMO);
  } catch (error) {
    M = null;
    const p = h(
      "p",
      { class: "mech-error", role: "alert" },
      null,
      `The behavior model could not be loaded (${error.message}). The static description and source link still apply.`,
    );
    ui.main.prepend(p);
    return;
  }
  // Drawing: keep the static <title>/<desc>, replace the rest.
  for (const node of [...ui.svg.childNodes])
    if (!/^(title|desc)$/i.test(node.nodeName)) node.remove();
  addDefs(ui.svg);
  update = RENDER[DEMO]?.(ui.svg) || null;
  ui.tag = phaseTag(ui.svg, Number(ui.svg.viewBox.baseVal?.width) || 480);
  // The same renderer/state is visible beside the real source, with separate SVG IDs.
  if (ui.previewSvg) {
    addDefs(ui.previewSvg);
    ui.previewUpdate = RENDER[DEMO]?.(ui.previewSvg);
    const names = new Map();
    for (const el of ui.previewSvg.querySelectorAll("[id]")) {
      const old = el.id;
      names.set(old, `preview-${old}`);
      el.id = `preview-${old}`;
    }
    for (const el of [ui.previewSvg, ...ui.previewSvg.querySelectorAll("*")])
      for (const attr of [...el.attributes]) {
        let value = attr.value.replace(
          /url\(#([^)]+)\)/g,
          (all, id) => `url(#${names.get(id) || id})`,
        );
        if (attr.name === "aria-labelledby")
          value = value
            .split(" ")
            .map((id) => names.get(id) || id)
            .join(" ");
        if (value !== attr.value) el.setAttribute(attr.name, value);
      }
    ui.previewTag = phaseTag(ui.previewSvg, 480);
  }
  for (const figure of document.querySelectorAll(".mech-figure svg"))
    for (const text of figure.querySelectorAll("text"))
      if (
        Number(text.getAttribute("x")) >= 300 &&
        !["middle", "end"].includes(text.getAttribute("text-anchor"))
      )
        text.classList.add("m-column-label");
  $("mech-code-step")?.addEventListener("click", () => {
    setRunning(false);
    step();
    render();
  });
  buildControls();
  buildScenarios();
  buildPlot();
  resetExperiment(false);
  for (const b of [ui.run, ui.stepBtn, ui.reset]) b.disabled = false;
  ui.run.addEventListener("click", () => setRunning(!running));
  ui.stepBtn.addEventListener("click", () => {
    if (running) setRunning(false);
    step();
    render();
  });
  ui.reset.addEventListener("click", () => resetExperiment(true));
  document.addEventListener("visibilitychange", schedule);
  if ("IntersectionObserver" in window)
    new IntersectionObserver((entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      schedule();
    }).observe(ui.main);
  reducedMotion.addEventListener?.("change", () => render());
  setText(ui.run, running ? "Pause" : "Run");
  ui.main.dataset.ready = "1";
  schedule();
  render();
  loadSource();
  // Debug controls for automated browser checks; nothing here is persisted.
  window.mechanismDemo = Object.freeze({
    id: DEMO,
    state: () => structuredClone(state),
    inputs: () => ({ ...inputs }),
    describe: () => M.describeDemo(DEMO, state, sampledInputs),
    step: (n = 1) => {
      setRunning(false);
      for (let i = 0; i < n; i++) step();
      render();
    },
  });
}
start();
