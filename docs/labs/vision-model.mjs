// Original ideal planar teaching model. This is not an AprilTag detector or PnP solver.
export const TAG = Object.freeze({
  x: 6,
  y: 2.2,
  yaw: Math.PI,
  id: 7,
  size: 0.165,
});
export const CAPTURE = Object.freeze({ x: 2, y: 2, yaw: 0 });
export const CAMERA = Object.freeze({
  fx: 900,
  fy: 900,
  cx: 320,
  cy: 200,
  width: 640,
  height: 400,
});
export const STEPS = [
  [
    "Capture an image",
    "A camera records pixels. The marker in this constructed image is an actual tag36h11 ID 7 pattern; no detector is running.",
  ],
  [
    "Find corners and read the ID",
    "A real detector finds the black border, refines four corners and decodes the cell pattern. Here those ideal corners and ID are supplied by the scene. Identity alone does not locate the robot.",
  ],
  [
    "Locate the camera",
    "Calibration and known tag size turn the corner geometry into a camera-to-tag pose. The field layout then locates the camera. This straight-on example uses ideal geometry, rather than a full 3D PnP solver.",
  ],
  [
    "Locate the robot",
    "The camera is 0.40 m ahead of the robot center and 0.20 m to its left. Undo that measured mount transform to recover the robot center. Camera position and robot position are different.",
  ],
  [
    "Move the camera",
    "Move the physical camera forward. If the code still assumes the old 0.40 m mount, the estimated robot center shifts. Update the measured offset and the error disappears in this ideal model.",
  ],
  [
    "Let the image arrive late",
    "The mount is now correctly configured. The frame still describes the robot at capture, while the robot keeps moving at 2 m/s. Treating that old position as current creates an error.",
  ],
  [
    "Keep the capture timestamp",
    "Use the capture time to associate the observation with past motion. This model adds the exactly known motion since capture; real estimators use retained odometry, synchronized clocks and measurement uncertainty.",
  ],
].map(([title, explanation]) => Object.freeze({ title, explanation }));
export function compose(a, b) {
  const c = Math.cos(a.yaw),
    s = Math.sin(a.yaw);
  return {
    x: a.x + c * b.x - s * b.y,
    y: a.y + s * b.x + c * b.y,
    yaw: a.yaw + b.yaw,
  };
}
export function inverse(p) {
  const c = Math.cos(p.yaw),
    s = Math.sin(p.yaw);
  return { x: -c * p.x - s * p.y, y: s * p.x - c * p.y, yaw: -p.yaw };
}
const bounded = (value, fallback, lo, hi) =>
  Number.isFinite(value) ? Math.min(hi, Math.max(lo, value)) : fallback;
export function visionSnapshot(index, controls = {}) {
  const step = Math.trunc(bounded(index, 0, 0, STEPS.length - 1));
  const physicalForward = step >= 4 ? bounded(controls.mount, 1, 0, 1) : 0.4;
  const configuredForward =
    step === 4 && !controls.fixMount ? 0.4 : physicalForward;
  const delayMs = step >= 5 ? bounded(controls.latency, 200, 0, 400) : 0;
  const captureTime = 10,
    delay = delayMs / 1000,
    arrivalTime = captureTime + delay;
  const mount = { x: physicalForward, y: 0.2, yaw: 0 };
  const configuredMount = { x: configuredForward, y: 0.2, yaw: 0 };
  const camera = compose(CAPTURE, mount);
  const cameraToTag = compose(inverse(camera), TAG);
  // The tag is frontal, camera and tag centers are at the same height, and yaw is zero.
  // Size measures the outside of the BLACK border, not the PNG's white margin.
  const corners = [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ].map(([side, up]) => ({
    u:
      CAMERA.cx -
      (CAMERA.fx * (cameraToTag.y + (side * TAG.size) / 2)) / cameraToTag.x,
    v: CAMERA.cy - (CAMERA.fy * ((up * TAG.size) / 2)) / cameraToTag.x,
  }));
  const pixelWidth = Math.abs(corners[1].u - corners[0].u);
  const recoveredDepth = (CAMERA.fx * TAG.size) / pixelWidth;
  const recoveredCamera = compose(TAG, inverse(cameraToTag));
  const recoveredRobot = compose(recoveredCamera, inverse(configuredMount));
  const now = { ...CAPTURE, x: CAPTURE.x + 2 * delay };
  const timestamped = step === 6 && controls.useCapture !== false;
  const displayed = {
    ...recoveredRobot,
    x: recoveredRobot.x + (timestamped ? 2 * delay : 0),
  };
  return {
    step,
    physicalForward,
    configuredForward,
    delayMs,
    captureTime,
    arrivalTime,
    camera,
    cameraToTag,
    corners,
    pixelWidth,
    recoveredDepth,
    recoveredCamera,
    recoveredRobot,
    now,
    displayed,
    timestamped,
    placementError: Math.hypot(
      recoveredRobot.x - CAPTURE.x,
      recoveredRobot.y - CAPTURE.y,
    ),
    currentError: Math.hypot(displayed.x - now.x, displayed.y - now.y),
  };
}
