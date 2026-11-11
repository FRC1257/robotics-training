# Robot architecture: start simple

**Baseline:** Java 17 and WPILib/GradleRIO 2026.2.1. **Status:** educational starter; see its README for build results. **Prerequisites:** Java objects and lambdas. **Time:** 20 minutes.

A subsystem owns a mechanism and its state. A command declares the subsystems it needs, starts, runs over scheduler iterations, and stops when finished or interrupted. `Robot.robotPeriodic` runs the scheduler; bindings and autonomous routines schedule commands. This arrangement keeps two commands from controlling the same mechanism simultaneously. The starter's simulated intake is a small example. Begin with [the first subsystem](5-First_Subsystem.md); follow [simulation](5e-Simulation.md).

Team 1257's [2026 robot at commit 0c9a024](https://github.com/FRC1257/2026-Robot/tree/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/Hopper/HopperIntake) adds an IO interface with separate Spark MAX and simulation implementations. That boundary supports AdvantageKit input logging and replay. It is team-specific architecture, not a requirement for every WPILib subsystem. Read the interface and its implementations after the simple exercise; identify which class owns the command behavior and which exchanges hardware inputs and outputs. Do not assume an interface alone accurately simulates the physical mechanism.

**Check:** Why must a command declare its subsystem requirement? Expected: the scheduler can cancel a conflicting command before starting another. See [WPILib command-based programming](https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html).

## Follow one signal through the starter

1. `Robot` creates one `SimIntake`. It registers a command on the dashboard in `robotInit` and calls `CommandScheduler.getInstance().run()` in `robotPeriodic`.
2. A dashboard activation schedules the command. The scheduler checks its `intake` requirement. If a different command owns that subsystem, the scheduler interrupts it before allowing the new command to proceed.
3. During each scheduler iteration the command calls `setSpeed(0.5)`. The subsystem clamps the request and publishes the current value. The number is a command, not a measurement.
4. The timeout finishes the command; `runEnd` calls `setSpeed(0)`. Interruption uses the same stop action. The robot's `disabledInit` adds an explicit stop.

Draw this chain: button → scheduler → command → subsystem → published output. Which arrow would change when a real motor is added? The subsystem-to-output boundary: the motor controller needs a reviewed configuration, and input sensors need their own units and validity checks. The scheduler still coordinates commands. A hardware output is not proof that the mechanism actually moved; add measured velocity/current where appropriate.

## Read the team architecture

In the linked team code, `HopperIntakeIO` describes inputs and operations. `HopperIntakeIOSparkMax` talks to the controller; `HopperIntakeIOSim` supplies a simulation implementation. `HopperIntake` owns higher-level behavior. Locate the `updateInputs` call and the logger call in that class. Sketch arrows from a real sensor through IO inputs to the logger and subsystem. Then trace an output request in the reverse direction. You should be able to name which boundary would change for different hardware. Do not assume replay restores unrecorded state or that the simulated plant has been calibrated.

**Worked answer:** IO gives the rest of the subsystem a common interface, allowing a hardware-specific implementation to be replaced by a simulator. That separation helps testing and replay only if the relevant observations and outputs are actually represented and logged. The starter intentionally does not add that complexity until the command lifecycle is understood.

| Symptom | First check |
| --- | --- |
| Output never changes | Is the scheduler running, robot enabled, and command scheduled? |
| Two controls fight | Do both commands require the same subsystem? |
| Output remains active after interruption | Does the command's end action stop it? |
| Logged value is plausible but behavior is wrong | Is it a requested output or an independent measured input? |

For another guided walkthrough of the same revision, see the [2026 team code case study](../../robots/2026-code.md).
