// Original educational behavior models. These do not execute team code or model hardware.
export const DEMO_IDS = Object.freeze([
  "fixed-shooter",
  "turret-shooter",
  "piece-handling",
  "elevator-wrist",
  "telescoping-arm",
  "drivetrain",
  "climb-balance",
]);
const clip = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const approach = (v, target, amount) => v + clip(target - v, -amount, amount);
function check(id) {
  if (!DEMO_IDS.includes(id)) throw new RangeError(`Unknown mechanism: ${id}`);
}
export function defaultInputs(id) {
  check(id);
  const shared = {
    enabled: true,
    request: false,
    reset: false,
    sensorValid: true,
    stale: false,
    obstructed: false,
  };
  const specific = {
    "fixed-shooter": {
      targetRadPerSec: 200,
      targetHeadingRad: 0,
      pieceDetected: true,
    },
    "turret-shooter": {
      targetRadPerSec: 200,
      targetAngleRad: 0.8,
      pieceDetected: true,
    },
    "piece-handling": {
      frontLeft: false,
      frontRight: false,
      backSensor: false,
    },
    "elevator-wrist": { home: false, targetHeightM: 1, targetWristRad: 0.5 },
    "telescoping-arm": {
      home: false,
      targetAngleRad: 0.8,
      targetExtensionM: 0.8,
    },
    drivetrain: {
      vxMps: 1,
      vyMps: 0,
      omegaRadPerSec: 0.4,
      differential: false,
    },
    "climb-balance": { home: false, targetHeightM: 1, cageDetected: false },
  };
  return { ...shared, ...specific[id] };
}
export function createState(id) {
  check(id);
  return {
    time: 0,
    x: 0,
    y: 0,
    angle: 0,
    extension: 0,
    pieceProgress: 0,
    velocityRadPerSec: 0,
    flywheelAngleRad: 0,
    chassisHeadingRad: 0,
    homed: false,
    fault: false,
    needsRelease: false,
    phase: "idle",
    reason: "Waiting for a request.",
    outputs: {},
    gates: [],
  };
}
function clean(id, inputs) {
  const defaults = defaultInputs(id),
    p = {};
  for (const [key, def] of Object.entries(defaults)) {
    const supplied = inputs?.[key];
    p[key] =
      typeof def === "boolean"
        ? typeof supplied === "boolean"
          ? supplied
          : def
        : typeof supplied === "number" && Number.isFinite(supplied)
          ? supplied
          : def;
  }
  return p;
}
export function stepDemo(id, state, inputs, dt = 0.02) {
  check(id);
  if (!Number.isFinite(dt) || dt <= 0 || dt > 0.1)
    throw new RangeError("dt must be positive and at most 0.1 seconds");
  const p = clean(id, inputs);
  const s = { ...state, time: state.time + dt, outputs: {}, gates: [] };
  const sensorsOK = p.sensorValid && !p.stale,
    clear = !p.obstructed,
    healthy = p.enabled && sensorsOK && clear;
  if (!sensorsOK || !clear) s.fault = true;
  else if (healthy && p.reset && !p.request) s.fault = false;
  if (!p.enabled) s.needsRelease = true;
  else if (!p.request) s.needsRelease = false;
  const needsHome = [
    "elevator-wrist",
    "telescoping-arm",
    "climb-balance",
  ].includes(id);
  if (needsHome && healthy && !s.fault && p.home && !p.request) {
    s.homed = true;
    s.extension = 0;
  }
  const armed = !s.fault,
    run =
      healthy &&
      armed &&
      !s.needsRelease &&
      p.request &&
      (!needsHome || s.homed);
  s.gates = [
    { id: "enabled", label: "Enabled", ok: p.enabled },
    { id: "sensor", label: "Sensor valid and fresh", ok: sensorsOK },
    { id: "clear", label: "Path clear", ok: clear },
    { id: "armed", label: "Fault cleared", ok: armed },
    {
      id: "release",
      label: "Request released since disable",
      ok: !s.needsRelease,
    },
    ...(needsHome
      ? [{ id: "homed", label: "Home reference recorded", ok: s.homed }]
      : []),
  ];
  s.phase = !p.enabled
    ? "disabled"
    : !armed
      ? "fault"
      : run
        ? "active"
        : "idle";
  s.reason = !p.enabled
    ? "Disabled; release request before restarting."
    : !sensorsOK
      ? "Invalid or stale sensor; output stopped and fault latched."
      : !clear
        ? "Obstruction; output stopped and fault latched."
        : !armed
          ? "Fault latched; release request and reset."
          : s.needsRelease
            ? "Release the request before restarting."
            : needsHome && !s.homed
              ? "Home reference required before motion."
              : !p.request
                ? "Waiting for a request."
                : "Request and interlocks permit the model to run.";
  if (id === "fixed-shooter" || id === "turret-shooter") {
    const target = run ? clip(p.targetRadPerSec, 0, 400) : 0;
    if (!p.enabled) s.velocityRadPerSec = 0;
    else
      s.velocityRadPerSec +=
        (target - s.velocityRadPerSec) * (1 - Math.exp(-dt / 0.4));
    if (p.enabled)
      s.flywheelAngleRad = wrap(s.flywheelAngleRad + s.velocityRadPerSec * dt);
    if (!p.pieceDetected) s.pieceProgress = 0;
    let feasible = true,
      aimed = false,
      turn = 0;
    if (id === "fixed-shooter") {
      const before = s.chassisHeadingRad,
        error = wrap(p.targetHeadingRad - before);
      if (run) {
        const delta = clip(error, -1.5 * dt, 1.5 * dt);
        s.chassisHeadingRad = wrap(before + delta);
        turn = delta / dt;
      }
      aimed = Math.abs(wrap(p.targetHeadingRad - s.chassisHeadingRad)) <= 0.05;
    } else {
      // This teaching turret has hard stops; never wrap its current angle through them.
      const normalized = wrap(p.targetAngleRad),
        candidates = [
          normalized - 2 * Math.PI,
          normalized,
          normalized + 2 * Math.PI,
        ].filter((a) => a >= -2.6 && a <= 2.6);
      feasible = candidates.length > 0;
      const reachable = feasible
        ? candidates.reduce((best, a) =>
            Math.abs(a - s.angle) < Math.abs(best - s.angle) ? a : best,
          )
        : null;
      const before = s.angle;
      if (run && feasible)
        s.angle = clip(approach(s.angle, reachable, 1.5 * dt), -2.6, 2.6);
      turn = (s.angle - before) / dt;
      aimed = feasible && Math.abs(reachable - s.angle) <= 0.05;
    }
    const atSpeed =
      target > 0 && Math.abs(s.velocityRadPerSec - target) <= target * 0.04;
    const feed =
      run &&
      feasible &&
      atSpeed &&
      aimed &&
      p.pieceDetected &&
      s.pieceProgress < 1;
    if (feed) s.pieceProgress = clip(s.pieceProgress + dt, 0, 1);
    s.outputs = {
      flywheelTargetRadPerSec: target,
      turnRadPerSec: turn,
      feed: feed ? 1 : 0,
    };
    s.gates.push(
      { id: "speed", label: "Within 4% of target speed", ok: atSpeed },
      { id: "aim", label: "Aim within tolerance", ok: aimed },
      {
        id: "piece",
        label: "Piece detected and available",
        ok: p.pieceDetected && s.pieceProgress < 1,
      },
    );
    if (id === "turret-shooter")
      s.gates.push({
        id: "limit",
        label: "Target reachable within turret travel",
        ok: feasible,
      });
    if (run) {
      if (!feasible) {
        s.phase = "unreachable";
        s.reason =
          "No equivalent target lies within the turret travel envelope; turn and feed are stopped.";
      } else if (s.pieceProgress >= 1 && p.pieceDetected) {
        s.phase = "spent";
        s.reason =
          "Piece fed; clear the simulated piece sensor before reloading.";
      } else {
        s.phase = feed ? "feeding" : "preparing";
        s.reason = feed
          ? "Speed, aim and piece gates permit feed."
          : "Waiting for speed, aim and a detected piece.";
      }
    }
  } else if (id === "piece-handling") {
    let action = "stopped",
      power = 0;
    if (run) {
      if (p.backSensor) {
        action = "hold";
        power = 0;
      } else if (p.frontLeft && p.frontRight) {
        action = "handoff";
        power = 0.4;
      } else {
        action = "collect";
        power = 1;
      }
      s.pieceProgress = clip(s.pieceProgress + power * dt * 0.35, 0, 1);
      s.phase = action;
      s.reason =
        action === "hold"
          ? "Back sensor takes priority; hold."
          : action === "handoff"
            ? "Both front sensors detected; handoff."
            : "Collect until a sensor condition changes.";
    }
    s.outputs = { roller: power };
    s.gates.push({
      id: "back",
      label: "Back sensor clear for motion",
      ok: !p.backSensor,
    });
  } else if (id === "elevator-wrist") {
    const beforeHeight = s.extension,
      beforeWrist = s.angle,
      targetHeight = clip(p.targetHeightM, 0, 1.5),
      targetWrist = clip(p.targetWristRad, -1.2, 1.2),
      incompatible = targetHeight < 0.3 && targetWrist > 0.2;
    const mustStow = targetHeight < 0.3 && s.angle > 0.2,
      needsClearance = targetWrist > 0.2 && s.extension < 0.3;
    if (run && !incompatible) {
      if (mustStow) s.angle = approach(s.angle, 0.2, dt);
      else {
        s.extension = approach(s.extension, targetHeight, 0.5 * dt);
        s.angle = approach(
          s.angle,
          needsClearance ? Math.min(targetWrist, 0.2) : targetWrist,
          dt,
        );
      }
    }
    s.outputs = {
      elevatorMps: (s.extension - beforeHeight) / dt,
      wristRadPerSec: (s.angle - beforeWrist) / dt,
    };
    s.gates.push(
      {
        id: "compatible",
        label: "Height and wrist goal compatible",
        ok: !incompatible,
      },
      {
        id: "clearance",
        label: "Clearance available for requested motion",
        ok: !mustStow && !needsClearance,
      },
    );
    if (run && incompatible) {
      s.phase = "incompatible";
      s.reason =
        "Wrist goals above 0.2 rad require a height goal of at least 0.3 m.";
    } else if (run && mustStow) {
      s.phase = "stowing";
      s.reason = "Stow the wrist to 0.2 rad before lowering below 0.3 m.";
    } else if (run && needsClearance) {
      s.phase = "raising";
      s.reason = "Raise to 0.3 m before moving the wrist above 0.2 rad.";
    }
  } else if (id === "telescoping-arm") {
    const beforeAngle = s.angle,
      beforeExtension = s.extension,
      targetAngle = clip(p.targetAngleRad, -1, 1.4),
      targetExtension = clip(p.targetExtensionM, 0, 1);
    if (run) s.angle = approach(s.angle, targetAngle, 0.8 * dt);
    const aligned = Math.abs(targetAngle - s.angle) <= 0.1;
    if (run)
      s.extension = approach(
        s.extension,
        aligned ? targetExtension : 0,
        0.35 * dt,
      );
    s.outputs = {
      shoulderRadPerSec: (s.angle - beforeAngle) / dt,
      extensionMps: (s.extension - beforeExtension) / dt,
    };
    s.gates.push({
      id: "shoulder",
      label: "Shoulder within 0.1 rad before extension",
      ok: aligned,
    });
    if (run && !aligned) {
      s.phase = "aligning";
      s.reason = "Shoulder alignment is required; extension moves toward zero.";
    }
  } else if (id === "drivetrain") {
    const vx = run ? clip(p.vxMps, -3, 3) : 0,
      vy = run && !p.differential ? clip(p.vyMps, -3, 3) : 0,
      omega = run ? clip(p.omegaRadPerSec, -3, 3) : 0;
    const a = s.angle;
    if (Math.abs(omega) < 1e-9) {
      s.x += (vx * Math.cos(a) - vy * Math.sin(a)) * dt;
      s.y += (vx * Math.sin(a) + vy * Math.cos(a)) * dt;
    } else {
      const b = a + omega * dt;
      s.x +=
        (vx * (Math.sin(b) - Math.sin(a)) + vy * (Math.cos(b) - Math.cos(a))) /
        omega;
      s.y +=
        (vx * (Math.cos(a) - Math.cos(b)) + vy * (Math.sin(b) - Math.sin(a))) /
        omega;
    }
    s.angle = wrap(a + omega * dt);
    s.outputs = { vxMps: vx, vyMps: vy, omegaRadPerSec: omega };
    s.gates.push({
      id: "lateral",
      label: "Requested lateral motion supported",
      ok: !p.differential || Math.abs(p.vyMps) < 1e-9,
    });
    if (run && p.differential && Math.abs(p.vyMps) >= 1e-9)
      s.reason =
        "Differential drive cannot command robot-relative lateral velocity; lateral input is discarded while forward and rotation remain available.";
  } else if (id === "climb-balance") {
    const beforeHeight = s.extension,
      target = clip(p.targetHeightM, 0, 1.2);
    const lift = run && p.cageDetected;
    if (lift) s.extension = approach(s.extension, target, 0.25 * dt);
    s.outputs = { liftMps: (s.extension - beforeHeight) / dt };
    s.gates.push({
      id: "cage",
      label: "Cage sensor reports detected",
      ok: p.cageDetected,
    });
    if (run && !p.cageDetected) {
      s.phase = "waiting";
      s.reason =
        "Waiting for the cage sensor; detection does not prove secure engagement.";
    }
  }
  return s;
}
export function describeDemo(id, state, inputs) {
  check(id);
  const p = clean(id, inputs),
    s = state;
  const sensors = [
    { name: "Sensor valid", value: p.sensorValid, unit: "boolean" },
    { name: "Signal stale", value: p.stale, unit: "boolean" },
  ];
  if (id.includes("shooter"))
    sensors.push(
      { name: "Flywheel velocity", value: s.velocityRadPerSec, unit: "rad/s" },
      {
        name: "Flywheel velocity (source RPS)",
        value: s.velocityRadPerSec / (2 * Math.PI),
        unit: "RPS",
      },
      { name: "Piece detected", value: p.pieceDetected, unit: "boolean" },
    );
  if (id === "fixed-shooter")
    sensors.push({
      name: "Chassis heading",
      value: s.chassisHeadingRad,
      unit: "rad",
    });
  if (id === "turret-shooter")
    sensors.push({ name: "Turret angle", value: s.angle, unit: "rad" });
  if (id === "piece-handling")
    sensors.push(
      ...["frontLeft", "frontRight", "backSensor"].map((name) => ({
        name,
        value: p[name],
        unit: "boolean",
      })),
    );
  if (["elevator-wrist", "telescoping-arm", "climb-balance"].includes(id))
    sensors.push(
      { name: "Home recorded", value: s.homed, unit: "boolean" },
      { name: "Extension / height", value: s.extension, unit: "m" },
    );
  if (id === "elevator-wrist")
    sensors.push({
      name: "Height (source comparison)",
      value: s.extension / 0.0254,
      unit: "in",
    });
  if (id === "climb-balance")
    sensors.push({
      name: "Cage detected",
      value: p.cageDetected,
      unit: "boolean",
    });
  if (id === "drivetrain")
    sensors.push(
      { name: "Heading", value: s.angle, unit: "rad" },
      {
        name: "Drive kind",
        value: p.differential ? "differential" : "swerve",
        unit: "mode",
      },
    );
  const unit = (key) =>
    key.endsWith("RadPerSec")
      ? "rad/s"
      : key.endsWith("Mps")
        ? "m/s"
        : "fraction";
  const outputs = Object.entries(s.outputs).map(([name, value]) => ({
    name,
    value,
    unit: unit(name),
  }));
  const moving = Object.values(s.outputs).some(
    (v) => typeof v === "number" && v !== 0,
  );
  return {
    phase: s.phase,
    reason: s.reason,
    sensors,
    outputs,
    activeTrace: [
      "input",
      "sensor",
      "condition",
      ...(moving ? ["output", "motion"] : []),
    ],
    gates: s.gates.map((g) => ({ ...g })),
    geometry: {
      kind: id,
      differential: id === "drivetrain" && p.differential,
      x: s.x,
      y: s.y,
      angle: id === "fixed-shooter" ? s.flywheelAngleRad : s.angle,
      chassisHeadingRad: s.chassisHeadingRad,
      flywheelAngleRad: s.flywheelAngleRad,
      extension: s.extension,
      piece: {
        x: s.pieceProgress,
        y: 0,
        visible:
          id === "piece-handling" ||
          ((id === "fixed-shooter" || id === "turret-shooter") &&
            p.pieceDetected),
      },
    },
  };
}
