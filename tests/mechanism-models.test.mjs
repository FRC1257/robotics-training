import test from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_IDS,
  defaultInputs,
  createState,
  stepDemo,
  describeDemo,
} from "../docs/labs/mechanism-models.mjs";
const close = (a, b, t = 1e-9) =>
  assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
function advance(id, s, p, n = 1, dt = 0.02) {
  for (let i = 0; i < n; i++) s = stepDemo(id, s, p, dt);
  return s;
}
test("all models export fresh state, stable descriptions and bounded steps", () => {
  assert.equal(DEMO_IDS.length, 7);
  for (const id of DEMO_IDS) {
    const p = defaultInputs(id),
      before = createState(id),
      s = stepDemo(id, before, p);
    assert.notEqual(s, before);
    assert.equal(before.time, 0);
    assert.equal(s.time, 0.02);
    const d = describeDemo(id, s, p);
    assert.equal(d.geometry.kind, id);
    assert.ok(
      Array.isArray(d.sensors) &&
        Array.isArray(d.gates) &&
        Array.isArray(d.outputs),
    );
    assert.ok(d.activeTrace.includes("condition"));
    assert.ok(Number.isFinite(d.geometry.x));
    assert.throws(() => stepDemo(id, s, p, 0), /dt/);
    assert.throws(() => stepDemo(id, s, p, 0.2), /dt/);
  }
});
test("normal disable does not fault and a held request cannot restart", () => {
  const id = "drivetrain",
    p = { ...defaultInputs(id), request: true },
    initial = createState(id);
  let s = advance(id, initial, p, 5);
  assert.ok(s.x > 0);
  const movingX = s.x;
  s = stepDemo(id, s, { ...p, enabled: false });
  assert.equal(s.phase, "disabled");
  assert.equal(s.fault, false);
  assert.equal(s.outputs.vxMps, 0);
  close(s.x, movingX);
  s = stepDemo(id, s, p);
  assert.equal(s.outputs.vxMps, 0);
  s = stepDemo(id, s, { ...p, request: false });
  s = stepDemo(id, s, p);
  assert.ok(s.outputs.vxMps > 0);
});
test("stale, invalid or obstructed input latches until explicit reset while released", () => {
  for (const bad of [
    { stale: true },
    { sensorValid: false },
    { obstructed: true },
  ]) {
    const id = "drivetrain",
      p = { ...defaultInputs(id), request: true };
    let s = stepDemo(id, createState(id), { ...p, ...bad });
    assert.equal(s.phase, "fault");
    assert.equal(s.outputs.vxMps, 0);
    s = stepDemo(id, s, p);
    assert.equal(s.fault, true);
    s = stepDemo(id, s, { ...p, reset: true });
    assert.equal(s.fault, true);
    s = stepDemo(id, s, { ...p, request: false, reset: true });
    assert.equal(s.fault, false);
    assert.equal(s.outputs.vxMps, 0);
    s = stepDemo(id, s, p);
    assert.ok(s.outputs.vxMps > 0);
  }
});
test("fixed shooter reaches analytical first-order speed and only feeds after readiness", () => {
  const id = "fixed-shooter",
    p = { ...defaultInputs(id), request: true, targetRadPerSec: 100 };
  let s = stepDemo(id, createState(id), p);
  close(s.velocityRadPerSec, 100 * (1 - Math.exp(-0.02 / 0.4)));
  assert.equal(s.outputs.feed, 0);
  s = advance(id, s, p, 100);
  assert.equal(s.outputs.feed, 1);
  s = advance(id, s, { ...p, pieceDetected: false });
  assert.equal(s.outputs.feed, 0);
  assert.equal(s.pieceProgress, 0);
});
test("turret rejects unreachable targets, accepts equivalent angles, and never wraps through hard stops", () => {
  const id = "turret-shooter",
    p = { ...defaultInputs(id), request: true, targetAngleRad: 3.1 };
  let s = { ...createState(id), angle: 0, velocityRadPerSec: 200 };
  s = stepDemo(id, s, p, 0.1);
  assert.equal(s.phase, "unreachable");
  assert.equal(s.outputs.turnRadPerSec, 0);
  assert.equal(s.outputs.feed, 0);
  assert.equal(s.gates.find((g) => g.id === "limit").ok, false);
  s = stepDemo(
    id,
    { ...s, angle: 0.5 },
    { ...p, targetAngleRad: 2 * Math.PI + 0.5 },
    0.1,
  );
  close(s.angle, 0.5);
  assert.equal(s.gates.find((g) => g.id === "limit").ok, true);
  s = stepDemo(id, { ...s, angle: 2.5 }, { ...p, targetAngleRad: -2.5 }, 0.1);
  close(s.angle, 2.35);
  assert.equal(s.outputs.feed, 0);
  s = advance(id, s, { ...p, targetAngleRad: -2.5 }, 40, 0.1);
  close(s.angle, -2.5);
});
test("fixed shooter turns the chassis and cannot feed until heading and speed are ready", () => {
  const id = "fixed-shooter",
    p = { ...defaultInputs(id), request: true, targetHeadingRad: 1 };
  let s = { ...createState(id), velocityRadPerSec: 200 };
  s = stepDemo(id, s, p, 0.1);
  close(s.chassisHeadingRad, 0.15);
  assert.equal(s.outputs.feed, 0);
  assert.ok(s.outputs.turnRadPerSec > 0);
  s = advance(id, s, p, 7, 0.1);
  close(s.chassisHeadingRad, 1);
  assert.equal(s.outputs.feed, 1);
  const d = describeDemo(id, s, p);
  close(d.geometry.chassisHeadingRad, 1);
  close(d.geometry.flywheelAngleRad, s.flywheelAngleRad);
});
test("finished shooter piece requires clearing its sensor before reloading", () => {
  const id = "fixed-shooter",
    p = { ...defaultInputs(id), request: true };
  let s = { ...createState(id), velocityRadPerSec: 200, pieceProgress: 0.99 };
  s = stepDemo(id, s, p, 0.02);
  assert.equal(s.phase, "spent");
  assert.equal(s.gates.find((g) => g.id === "piece").ok, false);
  assert.match(s.reason, /clear/i);
  s = stepDemo(id, s, p, 0.02);
  assert.equal(s.outputs.feed, 0);
  s = stepDemo(id, s, { ...p, pieceDetected: false });
  assert.equal(s.pieceProgress, 0);
  s = stepDemo(id, s, p);
  assert.equal(s.outputs.feed, 1);
});
test("elevator raises for wrist clearance, stows before lowering, and rejects incompatible goals", () => {
  const id = "elevator-wrist",
    p = defaultInputs(id);
  let s = stepDemo(id, createState(id), { ...p, home: true });
  s = advance(id, s, { ...p, request: true }, 4, 0.1);
  assert.ok(s.extension < 0.3);
  assert.ok(s.angle <= 0.2);
  assert.equal(s.phase, "raising");
  s = advance(id, s, { ...p, request: true }, 15, 0.1);
  assert.ok(s.extension >= 0.3 && s.angle > 0.2);
  const before = s.extension;
  s = stepDemo(
    id,
    s,
    { ...p, request: true, targetHeightM: 0, targetWristRad: 0 },
    0.1,
  );
  assert.equal(s.phase, "stowing");
  close(s.extension, before);
  s = advance(
    id,
    s,
    { ...p, request: true, targetHeightM: 0, targetWristRad: 0 },
    30,
    0.1,
  );
  close(s.extension, 0);
  s = stepDemo(id, s, {
    ...p,
    request: true,
    targetHeightM: 0,
    targetWristRad: 1,
  });
  assert.equal(s.phase, "incompatible");
  assert.equal(s.outputs.elevatorMps, 0);
  assert.equal(s.outputs.wristRadPerSec, 0);
});
test("piece handling gives back sensor priority then front pair before collect", () => {
  const id = "piece-handling",
    p = { ...defaultInputs(id), request: true };
  let s = createState(id);
  s = stepDemo(id, s, {
    ...p,
    frontLeft: true,
    frontRight: true,
    backSensor: true,
  });
  assert.equal(s.phase, "hold");
  assert.equal(s.outputs.roller, 0);
  s = stepDemo(id, s, { ...p, frontLeft: true, frontRight: true });
  assert.equal(s.phase, "handoff");
  assert.equal(s.outputs.roller, 0.4);
  s = stepDemo(id, s, p);
  assert.equal(s.phase, "collect");
  assert.equal(s.outputs.roller, 1);
});
test("homed axes refuse movement before home and stay inside their ranges", () => {
  for (const id of ["elevator-wrist", "telescoping-arm", "climb-balance"]) {
    const p = {
      ...defaultInputs(id),
      request: true,
      cageDetected: true,
      targetHeightM: 100,
      targetExtensionM: 100,
    };
    let s = advance(id, createState(id), p, 20);
    close(s.extension, 0);
    assert.equal(s.homed, false);
    s = stepDemo(id, s, { ...p, home: true, request: false });
    assert.equal(s.homed, true);
    s = advance(id, s, { ...p, home: false }, 300);
    assert.ok(
      s.extension >= 0 &&
        s.extension <=
          { "elevator-wrist": 1.5, "telescoping-arm": 1, "climb-balance": 1.2 }[
            id
          ],
    );
  }
});
test("telescoping extension waits for shoulder alignment and retracts on a new far target", () => {
  const id = "telescoping-arm",
    p = {
      ...defaultInputs(id),
      request: false,
      home: true,
      targetAngleRad: 1,
      targetExtensionM: 0.8,
    };
  let s = stepDemo(id, createState(id), p);
  s = advance(id, s, { ...p, home: false, request: true }, 20);
  assert.equal(s.extension, 0);
  assert.equal(s.phase, "aligning");
  s = advance(id, s, { ...p, home: false, request: true }, 100);
  assert.ok(s.extension > 0);
  const old = s.extension;
  s = stepDemo(id, s, { ...p, home: false, request: true, targetAngleRad: -1 });
  assert.ok(s.extension < old);
});
test("climb sensor gate is distinct from the home reference", () => {
  const id = "climb-balance",
    p = defaultInputs(id);
  let s = stepDemo(id, createState(id), { ...p, home: true });
  s = stepDemo(id, s, { ...p, request: true, cageDetected: false });
  assert.equal(s.outputs.liftMps, 0);
  assert.match(s.reason, /does not prove/);
  s = stepDemo(id, s, { ...p, request: true, cageDetected: true });
  assert.ok(s.outputs.liftMps > 0);
});
test("drivetrain exact arc is consistent across steps and heading wraps", () => {
  const id = "drivetrain",
    p = {
      ...defaultInputs(id),
      request: true,
      vxMps: 1,
      vyMps: 0.4,
      omegaRadPerSec: 1,
    };
  const fine = advance(id, createState(id), p, 50, 0.02),
    coarse = advance(id, createState(id), p, 10, 0.1);
  close(fine.x, coarse.x);
  close(fine.y, coarse.y);
  close(fine.angle, 1);
  const wrapped = stepDemo(id, { ...fine, angle: Math.PI - 0.01 }, p, 0.1);
  assert.ok(wrapped.angle < 0);
});
test("disable freezes all simulated positions and preserves existing faults", () => {
  for (const id of DEMO_IDS) {
    let p = { ...defaultInputs(id), request: true, cageDetected: true };
    let s = createState(id);
    if ("home" in p) s = stepDemo(id, s, { ...p, home: true, request: false });
    s = advance(id, s, p, 20);
    const old = {
      x: s.x,
      y: s.y,
      angle: s.angle,
      extension: s.extension,
      pieceProgress: s.pieceProgress,
      flywheelAngleRad: s.flywheelAngleRad,
      chassisHeadingRad: s.chassisHeadingRad,
    };
    const disabled = stepDemo(id, s, { ...p, enabled: false });
    for (const [key, value] of Object.entries(old)) close(disabled[key], value);
    for (const v of Object.values(disabled.outputs)) close(v, 0);
    assert.equal(disabled.fault, false);
    let fault = stepDemo(id, s, { ...p, stale: true });
    fault = stepDemo(id, fault, { ...p, enabled: false });
    assert.equal(fault.fault, true);
  }
});

test("fixed chassis takes shortest path across heading wrap", () => {
  const id = "fixed-shooter",
    p = {
      ...defaultInputs(id),
      request: true,
      targetHeadingRad: -Math.PI + 0.05,
    };
  const s = stepDemo(
    id,
    { ...createState(id), chassisHeadingRad: Math.PI - 0.05 },
    p,
    0.1,
  );
  assert.ok(s.chassisHeadingRad < 0);
  close(s.chassisHeadingRad, p.targetHeadingRad);
});
test("differential drive drops robot-relative lateral velocity but keeps forward and turning", () => {
  const id = "drivetrain",
    p = {
      ...defaultInputs(id),
      request: true,
      vxMps: 0,
      vyMps: 1,
      omegaRadPerSec: 0,
    };
  const omni = stepDemo(id, createState(id), p, 0.1),
    diff = stepDemo(id, createState(id), { ...p, differential: true }, 0.1);
  close(omni.y, 0.1);
  close(diff.x, 0);
  close(diff.y, 0);
  close(diff.outputs.vyMps, 0);
  assert.equal(diff.gates.find((g) => g.id === "lateral").ok, false);
  assert.match(diff.reason, /lateral input is discarded/);
  const view = describeDemo(id, diff, { ...p, differential: true });
  assert.equal(view.geometry.differential, true);
  assert.equal(
    view.sensors.find((s) => s.name === "Drive kind").value,
    "differential",
  );
  const mixed = stepDemo(
    id,
    createState(id),
    { ...p, differential: true, vxMps: 1, omegaRadPerSec: 1 },
    0.1,
  );
  close(mixed.outputs.vyMps, 0);
  close(mixed.x, Math.sin(0.1));
  close(mixed.y, 1 - Math.cos(0.1));
  close(mixed.angle, 0.1);
});
test("source comparison readouts convert simulated units without changing state", () => {
  for (const id of ["fixed-shooter", "turret-shooter"]) {
    const state = { ...createState(id), velocityRadPerSec: 2 * Math.PI };
    const view = describeDemo(id, state, defaultInputs(id));
    const rps = view.sensors.find(
      (s) => s.name === "Flywheel velocity (source RPS)",
    );
    close(rps.value, 1);
    assert.equal(rps.unit, "RPS");
    close(state.velocityRadPerSec, 2 * Math.PI);
  }
  const id = "elevator-wrist",
    state = { ...createState(id), extension: 0.0254 },
    view = describeDemo(id, state, defaultInputs(id)),
    inches = view.sensors.find((s) => s.name === "Height (source comparison)");
  close(inches.value, 1);
  assert.equal(inches.unit, "in");
  close(state.extension, 0.0254);
});
