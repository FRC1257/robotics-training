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
