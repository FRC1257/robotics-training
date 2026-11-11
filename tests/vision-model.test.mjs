import test from "node:test";
import assert from "node:assert/strict";
import {
  compose,
  inverse,
  visionSnapshot,
  STEPS,
} from "../docs/labs/vision-model.mjs";
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);
test("camera observation recovers camera before the robot mount is removed", () => {
  const s = visionSnapshot(3);
  near(s.pixelWidth, 41.25);
  near(s.recoveredDepth, 3.6);
  near(s.recoveredCamera.x, 2.4);
  near(s.recoveredCamera.y, 2.2);
  near(s.recoveredRobot.x, 2);
  near(s.recoveredRobot.y, 2);
  near(s.placementError, 0);
  assert.equal(s.corners.length, 4);
});
test("a mount configuration error changes the robot pose, not the ideal camera observation", () => {
  const bad = visionSnapshot(4, { mount: 1 }),
    fixed = visionSnapshot(4, { mount: 1, fixMount: true });
  near(bad.recoveredRobot.x, 2.6);
  near(bad.placementError, 0.6);
  near(fixed.placementError, 0);
  near(bad.pixelWidth, 49.5);
  assert.deepEqual(bad.corners, fixed.corners);
  const rear = visionSnapshot(4, { mount: 0 });
  near(rear.recoveredRobot.x, 1.6);
  near(rear.placementError, 0.4);
});
test("capture-time history corrects delay only under the stated ideal motion assumption", () => {
  for (const delay of [0, 40, 200, 400]) {
    const late = visionSnapshot(5, { latency: delay });
    near(late.currentError, (2 * delay) / 1000);
    const fixed = visionSnapshot(6, { latency: delay });
    near(fixed.currentError, 0);
    near(fixed.recoveredRobot.x, 2);
    near(fixed.now.x, 2 + (2 * delay) / 1000);
    near(fixed.arrivalTime - fixed.captureTime, delay / 1000);
    const wrong = visionSnapshot(6, { latency: delay, useCapture: false });
    near(wrong.currentError, late.currentError);
  }
});
test("transform inversion handles rotated mounts instead of subtracting field coordinates blindly", () => {
  const robot = { x: 2, y: 1, yaw: Math.PI / 2 },
    mount = { x: 0.4, y: 0.2, yaw: 0.3 };
  const cam = compose(robot, mount);
  near(cam.x, 1.8);
  near(cam.y, 1.4);
  const recovered = compose(cam, inverse(mount));
  near(recovered.x, robot.x);
  near(recovered.y, robot.y);
  near(recovered.yaw, robot.yaw);
});
test("all seven stages are deterministic and numerical inputs remain bounded", () => {
  assert.equal(STEPS.length, 7);
  for (let i = 0; i < 7; i++)
    assert.deepEqual(visionSnapshot(i), visionSnapshot(i));
  const s = visionSnapshot(6, { mount: Infinity, latency: NaN });
  near(s.physicalForward, 1);
  near(s.delayMs, 200);
  assert.equal(visionSnapshot(90).step, 6);
  assert.equal(visionSnapshot(-4).step, 0);
  near(visionSnapshot(5, { latency: 9999 }).delayMs, 400);
});
