import { visionSnapshot, STEPS, TAG, CAPTURE } from "./vision-model.mjs";
const $ = (id) => document.getElementById(id),
  svg = $("vision-view");
let index = 0;
const fmt = (n, d = 2) => n.toFixed(d);
const pair = (p) => `(${fmt(p.x)}, ${fmt(p.y)}) m`;
const el = (tag, attrs = {}, text = "") => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs))
    node.setAttribute(key, String(value));
  node.textContent = text;
  svg.append(node);
  return node;
};
function renderImage(s) {
  svg.setAttribute("viewBox", "170 90 300 220");
  el("rect", {
    x: 170,
    y: 90,
    width: 300,
    height: 220,
    class: "image-background",
  });
  for (let u = 180; u < 470; u += 20)
    el("line", { x1: u, x2: u, y1: 90, y2: 310, class: "field-line" });
  for (let v = 100; v < 310; v += 20)
    el("line", { x1: 170, x2: 470, y1: v, y2: v, class: "field-line" });
  const us = s.corners.map((p) => p.u),
    vs = s.corners.map((p) => p.v),
    w = s.pixelWidth * 1.25;
  el("image", {
    href: "../media/vision/tag36h11-id7.png",
    x: 320 - w / 2,
    y: 200 - w / 2,
    width: w,
    height: w,
    "image-rendering": "pixelated",
  });
  if (index === 1) {
    el("polygon", {
      points: s.corners.map((p) => `${p.u},${p.v}`).join(" "),
      class: "corners",
    });
    for (const p of s.corners)
      el("circle", { cx: p.u, cy: p.v, r: 2.6, class: "corner" });
    el(
      "text",
      {
        x: 320,
        y: Math.min(...vs) - 17,
        "text-anchor": "middle",
        style: "font-size:12px",
      },
      "ID 7",
    );
  }
  $("vision-view-title").textContent =
    index === 0
      ? "The camera sees pixels"
      : "Four corners, one decoded identity";
  $("vision-caption").textContent =
    "Synthetic image crop. The grid represents image coordinates, not field distance.";
  $("vision-result").textContent =
    index === 0
      ? "Tag position is not yet a robot position."
      : `ID 7 · black-border width ${fmt(s.pixelWidth)} px`;
}
function renderField(s) {
  svg.setAttribute("viewBox", "0 0 560 360");
  const delayed = index >= 5;
  const xmin = delayed ? 1.4 : 0,
    xmax = delayed ? 3.4 : 7,
    ymin = delayed ? 1.3 : 0,
    ymax = delayed ? 2.7 : 4;
  const x = (v) => 48 + ((v - xmin) / (xmax - xmin)) * 464,
    y = (v) => 305 - ((v - ymin) / (ymax - ymin)) * 260;
  el("rect", {
    x: 48,
    y: 45,
    width: 464,
    height: 260,
    fill: "none",
    class: "field-line",
  });
  for (let xx = Math.ceil(xmin); xx < xmax; xx++)
    el("line", { x1: x(xx), x2: x(xx), y1: 45, y2: 305, class: "field-line" });
  el(
    "text",
    { x: 50, y: 337, class: "muted", style: "font-size:17px" },
    delayed ? "Zoomed field view · +x →" : "Field view · +x → · +y ↑",
  );
  const robot = (p, cls) =>
    el("rect", {
      x: x(p.x) - 17,
      y: y(p.y) - 14,
      width: 34,
      height: 28,
      rx: 5,
      class: cls,
    });
  if (!delayed) {
    el("line", {
      x1: x(s.camera.x),
      y1: y(s.camera.y),
      x2: x(TAG.x),
      y2: y(TAG.y),
      class: "camera-line",
    });
    el("image", {
      href: "../media/vision/tag36h11-id7.png",
      x: x(TAG.x) - 13,
      y: y(TAG.y) - 13,
      width: 26,
      height: 26,
      "image-rendering": "pixelated",
    });
    el(
      "text",
      { x: x(TAG.x), y: y(TAG.y) - 28, "text-anchor": "middle" },
      "Known tag",
    );
    el("circle", {
      cx: x(s.camera.x),
      cy: y(s.camera.y),
      r: 7,
      class: "camera",
    });
    el("line", {
      x1: x(s.camera.x),
      y1: y(s.camera.y) - 10,
      x2: x(s.camera.x),
      y2: 85,
      class: "camera-line",
    });
    el("text", { x: x(s.camera.x), y: 72, "text-anchor": "middle" }, "Camera");
    if (index >= 3) {
      robot(CAPTURE, "actual");
      el(
        "text",
        { x: x(CAPTURE.x), y: y(CAPTURE.y) + 48, "text-anchor": "middle" },
        "Robot center",
      );
      if (index === 4) {
        robot(s.recoveredRobot, "estimate");
        el(
          "text",
          { x: x(s.recoveredRobot.x) + 24, y: y(s.recoveredRobot.y) - 40 },
          "Estimate",
        );
      }
    }
    if (index === 2) {
      $("vision-view-title").textContent = "Use the known landmark";
      $("vision-caption").textContent =
        `The assumed field layout puts this tag at (6.00, 2.20) m. Depth = 900 px × 0.165 m ÷ ${fmt(s.pixelWidth)} px = ${fmt(s.recoveredDepth)} m.`;
      $("vision-result").textContent =
        `Camera field position ${pair(s.recoveredCamera)}`;
    } else {
      $("vision-view-title").textContent =
        index === 3
          ? "Remove the camera mount offset"
          : "Placement error becomes pose error";
      $("vision-caption").textContent =
        `Filled blue: true robot center. Green: physical camera. ${index === 4 ? "Dashed orange: estimated center. " : ""}Symbols are not to scale.`;
      $("vision-result").textContent =
        index === 3
          ? `Camera ${pair(s.camera)} → robot ${pair(s.recoveredRobot)}`
          : `Position error ${fmt(s.placementError)} m · code assumes ${fmt(s.configuredForward)} m forward`;
    }
  } else {
    robot(CAPTURE, "actual ghost");
    robot(s.now, "actual");
    robot(s.displayed, "estimate");
    const a = x(CAPTURE.x),
      b = x(s.now.x);
    el("line", { x1: a, y1: 93, x2: b, y2: 93, class: "travel" });
    if (b > a + 2)
      el("path", { d: `M${b - 8} 87 L${b} 93 L${b - 8} 99`, class: "travel" });
    el(
      "text",
      { x: 280, y: 64, "text-anchor": "middle" },
      `Moved ${fmt(s.now.x - CAPTURE.x)} m since capture`,
    );
    el("text", { x: a, y: 252, "text-anchor": "middle" }, "At capture");
    el("text", { x: b, y: 286, "text-anchor": "middle" }, "Now");
    $("vision-view-title").textContent = s.timestamped
      ? "Place old evidence at the right time"
      : "Old position ≠ current position";
    $("vision-caption").textContent =
      `Capture ${fmt(s.captureTime, 3)} s → arrival ${fmt(s.arrivalTime, 3)} s. Solid blue: current truth. Dashed orange: current estimate. Faded blue: capture position.`;
    $("vision-result").textContent =
      `Current position error ${fmt(s.currentError)} m${s.timestamped ? " · exact motion history applied" : ""}`;
  }
}
function render() {
  const s = visionSnapshot(index, {
    mount: Number($("camera-mount").value),
    fixMount: $("fix-mount").checked,
    latency: Number($("camera-latency").value),
    useCapture: $("use-capture").checked,
  });
  svg.replaceChildren();
  el("title", { id: "vision-svg-title" }, STEPS[index].title);
  el("desc", { id: "vision-svg-desc" }, STEPS[index].explanation);
  if (index < 2) renderImage(s);
  else renderField(s);
  $("vision-progress").textContent = `Step ${index + 1} of ${STEPS.length}`;
  $("guided-heading").textContent = STEPS[index].title;
  $("vision-explanation").textContent = STEPS[index].explanation;
  $("placement-controls").hidden = index !== 4;
  $("latency-controls").hidden = index !== 5;
  $("timestamp-controls").hidden = index !== 6;
  $("mount-value").textContent = `${fmt(s.physicalForward)} m`;
  $("latency-value").textContent = `${s.delayMs} ms`;
  $("vision-back").disabled = index === 0;
  $("vision-next").disabled = index === STEPS.length - 1;
  document.body.dataset.visionStep = String(index + 1);
  document.body.dataset.positionError = String(
    index === 4 ? s.placementError : s.currentError,
  );
  document.body.dataset.labMode = "guided";
}
$("vision-back").onclick = () => {
  if (index > 0) {
    index--;
    render();
  }
};
$("vision-next").onclick = () => {
  if (index < STEPS.length - 1) {
    index++;
    render();
  }
};
for (const id of ["camera-mount", "fix-mount", "camera-latency", "use-capture"])
  $(id).addEventListener("input", render);
document.body.classList.add("guided-ready", "guided-mode");
render();
