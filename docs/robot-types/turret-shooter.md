<!-- ai-assisted -->

# Program a turreted shooter

Team 254's [2024 public software README](https://github.com/Team254/FRC-2024-Public) describes continuous speaker aiming, hood/turret and shooter-speed readiness checks, motion compensation, and paths that can react to a piece sensor (`2024-0254-code`). Its [technical binder](https://media.team254.com/2024/10/8f2607a0-2024-Tech-Binder.pdf), pages 10–15, describes a feeder that transfers while the turret points independently and bidirectional turret cable management (`2024-0254-binder`). These are team descriptions of a historical design; the research review did not build or run that repository, and this lesson does not reproduce its implementation.

## What the extra axis changes

An independently rotating turret can aim while the chassis uses a different heading, but its controller must know field heading, robot heading and turret angle in consistent radians and frames. Track encoder validity and homing, hood angle, wheel speed, pose estimate, target and observation timestamp. For a centered, aligned turret the conceptual relation is `turret_relative = target_field_bearing − robot_heading`. In general, transform the measured turret/shooter pivot offset from the robot frame into the field frame using the robot pose, then compute the target bearing from that actual pivot—not the chassis origin. Apply the calibrated encoder zero, sign and turret-to-robot-forward offset when converting the relative bearing to a motor target. Ignoring pivot translation can produce significant near-target angular error. Consider equivalent angles that produce the same bearing and choose a reachable, cable-safe path within the mechanism’s actual limits. The shortest mathematical angle is not necessarily safe if its path crosses a cable limit or hard stop. Use verified soft limits, physical stops and a reviewed cable plan; stale pose or uncertain zero makes an otherwise plausible number unsafe to trust.

**Illustrative pseudocode — not executable and not Team 254 code:**

```text
if not (pose_fresh and turret_homed and hood_valid and wheel_valid):
    inhibit_feed; show_reason; return
solution = solve_target(pose, target, robot_velocity)
path = choose_reachable_cable_safe_equivalent(solution, measured_turret_angle)
if no_valid_path or solution.outside_hood_envelope:
    inhibit_feed; request_safe_chassis_reorientation; return
continuously_monitor_limits_and_sensor_freshness_during_motion()
if envelope_breached_or_sensor_invalid: stop_motion; inhibit_feed; fault; return
request(path.target, hood_angle, wheel_speed)
if operator_requests and aim_stable and wheel_ready and piece_confirmed:
    feed_for_bounded_interval_with_exit_check
```

Distinguish the requested field bearing from the robot-relative turret setpoint; log both and the reason a gate failed. Motion compensation depends on capture time, robot velocity and calibration, not simply changing a setpoint during a turn. Avoid sudden target jumps from unsuitable or stale vision. An autonomous sequence must provide a start pose, handle a missed piece and cancel safely; an alignment-ready flag is not evidence of a successful shot.

## Test the interfaces

With fake IO, test heading wraparound with one reachable cable-safe equivalent: expect that equivalent and a safe path to be selected. Then test a target with no safe equivalent, old pose data, a hood encoder fault and a failed piece-sensing system: expect a specific inhibited/recovery state rather than an unbounded turret request or false readiness. An ordinary digital input by itself cannot reliably identify every broken-wire fault; test actual diagnostics and preserve unknown status where detection is unavailable. Compare a simulated chassis turn while holding a fixed field bearing against your own expected geometry. A visualization tests coordinate logic, not cable stresses, game-piece flight or measured accuracy. Keep a manual fallback and safe stop under mentor review. For a simpler contrast, see [chassis-aimed shooting](fixed-shooter.md).

## Predict, experiment, explain

**Predict:** Can every requested angle be represented inside a turret's physical travel envelope? Is the shortest wrapped motion necessarily a safe route?

**Experiment:** Enable the model, mark a piece detected and request aiming. Its **hypothetical** turret envelope is `−2.6` to `+2.6 rad`. A request of `3.1 rad` has no equivalent within that interval: expect `unreachable` and zero turn and feed requests. A request of `2π + 0.5` rad (approximately `6.783`) is equivalent to `0.5 rad` and is reachable. These are model assumptions, not the limits of the cited robot.

To examine path choice, first request `+2.5 rad` and let the modeled turret arrive; then request `−2.5 rad`. It travels the longer route through the allowed interval instead of wrapping across the hard stop. After one modeled feed, clear the piece-detected input before representing another piece. Introduce a stale sensor, then release the request and clear the condition before resetting the latched fault.

**Explain:** Why is an equivalent angle sometimes valid but a shorter wrapped *path* invalid? Distinguish a relative setpoint from a field bearing; this browser model accepts the former and does not simulate field-to-robot conversion or physical cable motion. It does not execute the linked Java.

**Compare the source:** [Team 254 2024 `TurretIOHardware.java`](https://github.com/Team254/FRC-2024-Public/blob/040f653744c9b18182be5f6bc51a7e505e346e59/src/main/java/com/team254/frc2024/subsystems/turret/TurretIOHardware.java#L153-L167). The real hardware IO clamps the requested turret position in radians, converts units and gearing, and sends a position/velocity request to the controller. The demo adapts this idea and does not implement the source method.

<!-- lab: mechanism-turret-shooter -->
