<!-- ai-assisted -->

# Program climbing and balance as separate tasks

Team 254's [2022 binder](https://media.team254.com/2022/10/8f2407a5-Team_254_Tech_Binder_2022.pdf), PDF pages 18–19 (printed headings 17–19), describes an elevator/reaction-arm/stinger climbing architecture (`E22-254-BINDER`). Team 2910's [2025 public software README](https://github.com/FRCTeam2910/2025CompetitionRobot-Public) describes climbing coordination after cage acquisition (`2025-2910-code`). The **2023** research concepts separately propose charge-station docking and balance. These are different tasks and seasons: do not transfer a field's rules, geometry or an engagement assumption into a different season.

## Climb: state and load are not the same

A program may observe motor position (m or rad), speed, limit switches, latch sensor and current (A), plus validity and time. A commanded position is not proof a hook engaged, and current alone is not proof that a load is safely retained. A single digital switch level cannot inherently detect every unplugged or broken wire; determine what the actual hardware can diagnose and treat unverified engagement as unknown. A real mechanism needs an engineered load path, stops and retention for loss of power; control code must be designed with that mechanical behavior, not used as its replacement.

**Illustrative pseudocode — not executable and not a team implementation:**

```text
STOWED -> DEPLOY when operator_authorizes and clearance_verified
DEPLOY -> VERIFY_CONTACT only on validated sensor evidence
VERIFY_CONTACT -> LIFT only when reviewed engagement conditions hold
LIFT -> SECURE when final measured conditions hold
throughout motion: monitor required sensor freshness, limits and clearance
if required evidence becomes stale or clearance is lost: stop/inhibit; enter reviewed recovery
any state -> ABORT / reviewed recovery on timeout, invalid sensor, or operator stop
```

A coordinator should reserve shared scoring axes and inhibit incompatible commands. Provide state, readiness, fault reason and elapsed time to the drive team; log sensor evidence and attempts. Define what happens during disable, a stalled actuator, incomplete engagement or interrupted sequence with a qualified mentor. An automated stop is not a substitute for mechanical retention, guarding, a controlled test area or an independent emergency procedure.

## Balance: measure orientation and approach

For a 2023-style docking exercise, an IMU can report pitch in radians and angular rate in rad/s; the controller needs a chosen sign convention, filtered/fresh data and a rate-limited drive request. A hypothetical state sequence is `APPROACH → CLIMB_PLATFORM → SETTLE → HOLD`, with abort on invalid pitch or timeout. A flat pitch measurement is not proof all wheels are supported or that a partner has clearance. The plan requires season-specific rules, geometry, clearances and a physical test; it is not a generic endgame routine for 2025 or 2026. [WPILib gyro overview](https://docs.wpilib.org/en/stable/docs/software/hardware-apis/sensors/gyros-software.html) explains reading orientation.

## Exercise

Write a fake-sensor test for a hook that never confirms engagement. Expected: lifting is not authorized and the state reports timeout or the reviewed fault. For a toy balance simulation inject a reversed pitch sign: the controller should fail a sign-check test before any physical attempt. Test disable and manual abort, then explicitly list what your simple model cannot show: hook loading, contact, structural strength, partner motion and disabled retention.

## Predict, experiment, explain

**Predict:** Is a command to lift proof that a hook is engaged? What happens when a required input becomes invalid during a climb request?

**Experiment:** With request released, enable and record the simulated asserted home switch; choose a height and request the sequence. Toggle cage detection and inspect phase, engagement-related inputs and requested output. Introduce an invalid sensor or obstruction and observe the latched fault and output. Clear the condition, release request and reset before a new attempt.

**Explain:** Which gate authorized motion, and what independent evidence would be needed to establish engagement? The home control records an assumed switch event, not an automatic homing movement. The model does not execute the linked team Java or simulate structural loading and retention.

**Compare the source:** [Team 2910 2025 `ClimberSubsystem.java`](https://github.com/FRCTeam2910/2025CompetitionRobot-Public/blob/1b9e161c7719da0522ec826e2a48d2afb63232a5/src/main/java/org/frc2910/robot/subsystems/climber/ClimberSubsystem.java#L128-L146). The source idles requests other than HOME while unhomed and then uses current and roller-speed conditions to manage an intake/cage candidate state. The demo adapts this idea and does not implement the source method.

<!-- lab: mechanism-climb-balance -->
