/** Idealized teaching models. Units are documented on each lab page. */
export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Semi-implicit Euler, one controller update per call. Derivative starts at zero.
export function pidStep(state, p, dt = 0.02) {
  const error = p.setpoint - state.position;
  const derivative =
    state.previousError == null ? 0 : (error - state.previousError) / dt;
  const candidate = state.integral + error * dt;
  const raw = p.kp * error + p.ki * candidate + p.kd * derivative + p.ff;
  // Conditional integration: don't accumulate when it would drive further into saturation.
  const blocked =
    p.antiwindup &&
    ((raw > p.limit && error > 0) || (raw < -p.limit && error < 0));
  const integral = blocked ? state.integral : candidate;
  const output = clamp(
    p.kp * error + p.ki * integral + p.kd * derivative + p.ff,
    -p.limit,
    p.limit,
  );
  const acceleration =
    (output - p.gravity - p.drag * state.velocity + p.disturbance) / p.mass;
  const velocity = state.velocity + acceleration * dt;
  const position = state.position + velocity * dt;
  return {
    position,
    velocity,
    integral,
    previousError: error,
    output,
    error,
    time: state.time + dt,
    saturated: Math.abs(output) >= p.limit - 1e-9,
  };
}
export const initialPID = () => ({
  position: 0,
  velocity: 0,
  integral: 0,
  previousError: null,
  output: 0,
  error: 0,
  time: 0,
  saturated: false,
});

// x forward, y left, positive omega counterclockwise; positions relative to center.
export function swerve({
  vx,
  vy,
  omega,
  heading = 0,
  fieldRelative = false,
  length = 0.6,
  width = 0.6,
  centerX = 0,
  centerY = 0,
  maxSpeed = 4,
  currentAngle = 0,
  optimize = true,
}) {
  if (fieldRelative)
    [vx, vy] = [
      vx * Math.cos(heading) + vy * Math.sin(heading),
      -vx * Math.sin(heading) + vy * Math.cos(heading),
    ];
  const locations = [
    ["Front left", length / 2, width / 2],
    ["Front right", length / 2, -width / 2],
    ["Back left", -length / 2, width / 2],
    ["Back right", -length / 2, -width / 2],
  ];
  let modules = locations.map(([name, x, y]) => {
    const dx = vx - omega * (y - centerY),
      dy = vy + omega * (x - centerX);
    let speed = Math.hypot(dx, dy),
      angle = speed < 1e-9 ? currentAngle : Math.atan2(dy, dx);
    if (optimize && Math.abs(wrap(angle - currentAngle)) > Math.PI / 2) {
      speed = -speed;
      angle = wrap(angle + Math.PI);
    }
    return { name, x, y, speed, angle, vx: dx, vy: dy };
  });
  const peak = Math.max(...modules.map((m) => Math.abs(m.speed)));
  const scale = peak > maxSpeed ? maxSpeed / peak : 1;
  modules = modules.map((m) => ({
    ...m,
    speed: m.speed * scale,
    vx: m.vx * scale,
    vy: m.vy * scale,
  }));
  return { modules, scale, robotVx: vx, robotVy: vy };
}

// A deliberately small scheduler for one motor requirement. Bindings use while-held
// edge semantics: interruption does not reschedule until a new press.
export const initialScheduler = () => ({
  tick: 0,
  held: false,
  active: null,
  motor: 0,
  events: [],
});
export function schedulerStep(previous, action = "tick") {
  const s = { ...previous, events: [] };
  const end = (reason) => {
    if (s.active) {
      s.events.push(`${s.active}.end(${reason})`);
      s.active = null;
      s.motor = 0;
    }
  };
  const start = (name) => {
    end("interrupted");
    s.active = name;
    s.events.push(`${name}.initialize()`);
  };
  if (action === "press" && !s.held) {
    s.held = true;
    start("held");
  }
  if (action === "release" && s.held) {
    s.held = false;
    if (s.active === "held") end("interrupted");
  }
  if (action === "conflict") start("conflict");
  if (action === "finish" && s.active === "conflict") end("finished");
  s.tick++;
  if (s.active) {
    s.motor = s.active === "held" ? 1 : -1;
    s.events.push(`${s.active}.execute()`);
  }
  if (!s.active) {
    s.active = "default";
    s.events.push("default.initialize()");
    s.motor = 0;
  }
  return s;
}

// Encoder reading is motor revolutions; ratio is motor revolutions per output turn.
export function encoderReading({
  motorTurns,
  ratio,
  diameter,
  inverted = false,
  homeMotorTurns = 0,
  homed = false,
  rawSwitch = false,
  activeLow = false,
}) {
  const outputTurns =
    ((motorTurns - (homed ? homeMotorTurns : 0)) / ratio) * (inverted ? -1 : 1);
  return {
    outputTurns,
    distance: outputTurns * Math.PI * diameter,
    pressed: activeLow ? !rawSwitch : rawSwitch,
    reference: homed ? "measured home" : "assumed zero",
  };
}

// Rest-to-rest positive-distance 1D trapezoid; triangular if distance is short.
export function motionProfile(distance, maxVelocity, maxAcceleration, t) {
  const accelerationTime = Math.min(
    maxVelocity / maxAcceleration,
    Math.sqrt(distance / maxAcceleration),
  );
  const peakVelocity = accelerationTime * maxAcceleration;
  const cruiseTime = Math.max(
    0,
    (distance - peakVelocity * accelerationTime) / peakVelocity,
  );
  const duration = 2 * accelerationTime + cruiseTime;
  const time = clamp(t, 0, duration);
  let position, velocity, acceleration;
  if (time < accelerationTime) {
    acceleration = maxAcceleration;
    velocity = acceleration * time;
    position = 0.5 * acceleration * time * time;
  } else if (time < accelerationTime + cruiseTime) {
    acceleration = 0;
    velocity = peakVelocity;
    position =
      0.5 * maxAcceleration * accelerationTime ** 2 +
      peakVelocity * (time - accelerationTime);
  } else if (time < duration) {
    const remaining = duration - time;
    acceleration = -maxAcceleration;
    velocity = maxAcceleration * remaining;
    position = distance - 0.5 * maxAcceleration * remaining ** 2;
  } else {
    acceleration = 0;
    velocity = 0;
    position = distance;
  }
  return {
    position,
    velocity,
    acceleration,
    duration,
    peakVelocity,
    cruiseTime,
  };
}

// Strict, bounded long-form CSV reader, including RFC-style quoted fields.
export function parseLogCSV(text) {
  if (typeof text !== "string" || text.length > 1_000_000)
    throw new Error("CSV must be text no larger than 1 MB.");
  const rows = [];
  let row = [],
    field = "",
    quoted = false,
    closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else field += c;
      continue;
    }
    if (c === '"') {
      if (field || closed) throw new Error("Invalid CSV quote.");
      quoted = true;
      continue;
    }
    if (c === "," || c === "\n" || c === "\r") {
      row.push(field);
      field = "";
      closed = false;
      if (c !== ",") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        if (row.some((v) => v !== "")) rows.push(row);
        row = [];
      }
      continue;
    }
    if (closed) throw new Error("Characters after closing CSV quote.");
    field += c;
  }
  if (quoted) throw new Error("Unclosed CSV quote.");
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length < 2 || rows[0].join(",") !== "timestamp_us,signal,value,type")
    throw new Error("Expected timestamp_us,signal,value,type header and data.");
  const kinds = {
    "/DriverStation/Enabled": "boolean",
    "/SystemStats/BatteryVoltage": "double",
    "/Drive/Module0/DriveVelocityRadPerSec": "double",
  };
  const data = rows.slice(1).map((r, i) => {
    if (r.length !== 4) throw new Error(`Row ${i + 2}: expected four fields.`);
    const [timestamp, signal, value, type] = r;
    if (!/^\d+$/.test(timestamp) || !Number.isSafeInteger(Number(timestamp)))
      throw new Error(`Row ${i + 2}: invalid microsecond timestamp.`);
    if (!kinds[signal] || type !== kinds[signal])
      throw new Error(`Row ${i + 2}: unsupported signal or type.`);
    let parsed;
    if (type === "boolean") {
      if (!/^(true|false)$/i.test(value))
        throw new Error(`Row ${i + 2}: invalid boolean.`);
      parsed = value.toLowerCase() === "true";
    } else {
      if (!value.trim() || !Number.isFinite(Number(value)))
        throw new Error(`Row ${i + 2}: invalid numeric value.`);
      parsed = Number(value);
    }
    return {
      timestampUs: Number(timestamp),
      seconds: Number(timestamp) / 1e6,
      signal,
      value: parsed,
      type,
    };
  });
  for (const signal of Object.keys(kinds))
    if (!data.some((r) => r.signal === signal))
      throw new Error(`Missing signal: ${signal}`);
  return data.sort((a, b) => a.timestampUs - b.timestampUs);
}

// Toy deterministic 2-D correction: delayed observations adjust stored positions
// from capture time onward. This is not a Kalman filter or WPILib pose estimator.
export function odometryExperiment({
  steps = 100,
  dt = 0.1,
  drift = 0.04,
  latencySteps = 5,
  gain = 0.5,
} = {}) {
  const truth = [{ x: 0, y: 0 }],
    odom = [{ x: 0, y: 0 }],
    corrected = [{ x: 0, y: 0 }],
    queue = [],
    observations = [];
  for (let i = 1; i <= steps; i++) {
    const angle = 0.02 * i,
      dx = Math.cos(angle) * dt,
      dy = Math.sin(angle) * dt;
    truth.push({ x: truth[i - 1].x + dx, y: truth[i - 1].y + dy });
    odom.push({
      x: odom[i - 1].x + dx + drift * dt,
      y: odom[i - 1].y + dy - drift * 0.5 * dt,
    });
    corrected.push({
      x: corrected[i - 1].x + dx + drift * dt,
      y: corrected[i - 1].y + dy - drift * 0.5 * dt,
    });
    if (i % 10 === 0)
      queue.push({
        capture: i,
        delivery: i + latencySteps,
        x: truth[i].x + 0.04 * Math.sin(i),
        y: truth[i].y + 0.04 * Math.cos(i),
      });
    for (const v of queue.filter((v) => v.delivery === i)) {
      const ex = gain * (v.x - corrected[v.capture].x),
        ey = gain * (v.y - corrected[v.capture].y);
      for (let j = v.capture; j <= i; j++) {
        corrected[j] = { x: corrected[j].x + ex, y: corrected[j].y + ey };
      }
      observations.push({
        ...v,
        captureTime: v.capture * dt,
        deliveryTime: v.delivery * dt,
      });
    }
  }
  const error = (path) =>
    Math.hypot(path[steps].x - truth[steps].x, path[steps].y - truth[steps].y);
  return {
    truth,
    odom,
    corrected,
    observations,
    odometryError: error(odom),
    correctedError: error(corrected),
  };
}
