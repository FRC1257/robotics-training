<!-- ai-assisted -->

# Program an elevator and wrist scorer

Team 254's [2023 season page](https://www.team254.com/first/2023/) lists an elevator, horizontal laterator and gripper (`E23-254-SEASON`). Its [public code README](https://github.com/Team254/FRC-2023-Public) describes vision-corrected pose estimation and coordinated subsystem state machines (`E23-254-CODE`). Team 1323's [2025 technical discussion](https://www.chiefdelphi.com/t/1323-2025-tech-binder/500435) describes sensor-triggered acquisition and handoff (`2025-1323-release`). Their mechanisms differ; neither source is this proposed fixed-elevator program.

## Contracts and safe poses

Define elevator height in metres, wrist angle in radians, roller speed, piece sensors, each axis’s homing/limit status and sensor timestamp. An ordinary digital limit or beam input cannot inherently distinguish every disconnect from an inactive level; use appropriate hardware diagnostics where available and preserve unknown status where they are not. The IO layer reports what the mechanism measured; a planner selects a goal only inside a geometry- and load-reviewed envelope. A wrist may collide with a frame as the elevator lowers even when both independent setpoints are within their own limits. Define named configurations and clearance preconditions, not just a list of individual motor positions.

**Illustrative pseudocode — not executable and not team code:**

```text
if sensor_invalid: enter FAULT
if axis_unhomed: inhibit ordinary scoring; allow only supervised HOMING procedure
HOMING: use reviewed direction, restricted output, travel/time limits and abort
HOMING -> READY only after valid reference confirmed; otherwise FAULT
RECEIVE -> VERIFY_HELD when receiving_sensor confirms
VERIFY_HELD -> RETRACT_FOR_TRAVEL
on requested scoring pose:
    retract slide / wrist to reviewed clearance pose
    move elevator to safe clearance height
    extend and set wrist only when clearance is confirmed
    continuously monitor clearance, sensor freshness and limits during all motion
    if clearance is lost or sensing becomes stale: stop/inhibit and enter reviewed recovery
    release only when aligned, at_goal, and driver authorizes
    verify empty, retract, then return to travel
on timeout or contradictory sensors: inhibit release; offer reviewed recovery
```

A sensor in the intake proves occupancy only there; handoff requires its own confirmation. A target branch/level is a request, not proof the destination is clear. Vision alignment should use a timestamped pose and reject invalid data; a reduced manual alignment mode can preserve choice when localization is uncertain. Autonomous should choose safe starting configuration and explicitly handle missing acquisition. Log goal and measured axes, sensor health, state and inhibition reason.

## Prove the contract

Use fake IO to test a low-height extension request, clearance lost during motion, missing handoff confirmation, a homing timeout and a sudden invalid camera estimate. Test that an unhomed axis can enter only the explicitly supervised, bounded homing procedure—not an ordinary scoring move. Expect the planner to defer unsafe goals or fault rather than announce a successful placement. Test that interruptions lead to an intentionally designed hold/retract response without assuming software can hold a disabled mechanism. A geometry simulation verifies only modeled envelopes; physical piece grip, elevator load, hard stops and disabled retention need independent engineering review and controlled tests. Compare with the [telescoping arm](telescoping-arm.md), where shoulder angle and extension both change the endpoint and tipping demand.

## Predict, experiment, explain

**Predict:** What must be known before automatic motion can be requested? Why can independently valid axis targets still violate a clearance envelope?

**Experiment:** With the request released, enable and record the simulated asserted home switch. Request a height of `0.2 m` with a wrist target of `0.5 rad`: the model reports `incompatible` and requests zero motion. Now choose `1.0 m` and `0.5 rad`. The model raises the elevator to at least `0.3 m` before allowing the wrist to cross `0.2 rad`. For a later low-height request it stows the wrist first. These thresholds are **hypothetical teaching assumptions**, not measured robot geometry.

Add an obstruction or stale sensor during motion; inspect the latched fault and outputs. Clear the condition, release request and reset. The home control records an assumed switch event; it does not simulate an automatic homing movement.

**Explain:** Name the condition that prevented or stopped movement and which axis depends on clearance. The browser’s simplified geometry is not team Java execution or a collision-verified robot model.

**Compare the source:** [Team 254 2024 `ElevatorSubsystem.java`](https://github.com/Team254/FRC-2024-Public/blob/040f653744c9b18182be5f6bc51a7e505e346e59/src/main/java/com/team254/frc2024/subsystems/elevator/ElevatorSubsystem.java#L38-L47). The periodic method converts a stored position from inches to metres, while a command ends when the position reaches a supplied tolerance. The demo adapts this idea and does not implement the source method.

<!-- lab: mechanism-elevator-wrist -->
