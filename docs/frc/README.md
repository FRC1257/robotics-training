<!-- ai-assisted -->
# FRC robot programming

Start here after you can write a Java class, call methods, use an interface, and explain a loop. The goal is to turn driver requests into predictable robot behavior, then use measurements and tests to explain that behavior.

## Start with one working mechanism

1. [Set up the programming tools](1-Basics/1a-Setup.md).
2. Read [command-based programming](1-Basics/4a-Command_Based.md) and [architecture](1-Basics/4b-Architecture.md).
3. Build the [first simulated subsystem](1-Basics/5-First_Subsystem.md). Run its tests before adapting it to hardware.
4. Explore [sensors](2-Sensors_And_Shuffleboard/1-Overview.md), [closed-loop control](3-Closed_Loop_Control/1-Overview.md), and [autonomous](4-Autonomous/1-Overview.md).

The included starter pins **Java 17 and WPILib 2026.2.1** so the examples have a reproducible environment. Season-specific vendor APIs and older team code have different requirements. Follow each lesson's version notes instead of mixing snippets from different years.

## Separate behavior from devices

Once one subsystem works, learn how teams keep the same behavior while changing its source of measurements and outputs:

- [IO interfaces and dependency injection](6-Architecture/1-IO_Interfaces.md): where `SubsystemIO` fits and what it owns.
- [Simulation IO](6-Architecture/2-Simulation_IO.md): implementing `SubsystemIOSim`, time steps, and model limits.
- [Logging and replay](6-Architecture/3-Logging_Replay.md): input snapshots, timestamps, and reproducibility.
- [Interpolation tables](6-Architecture/4-Interpolation_Tables.md): turning measured calibration data into a bounded lookup.
- [Integration project](6-Architecture/5-Integration_Project.md): connect the pieces and verify their contracts.
- [Timing and state](6-Architecture/6-Timing_And_State.md): deterministic logic and explicit transitions.

These IO names describe a design pattern, not a required WPILib superclass. The lessons distinguish ordinary Java/WPILib examples from AdvantageKit-specific APIs.

- [Filtering and validity](6-Architecture/7-Filtering_And_Validity.md): noise, delay, hysteresis, and stale measurements.

## Read actual team code

The [2026 robot walkthrough](../robots/2026-code.md) traces interfaces, subsystem periodic updates, logging and simulation in a pinned Team 1257 revision. Compare it with the [2025 walkthrough](../robots/2025-code.md) and investigate [a real 2024 log](../robots/2024-log.md). Code shows what was implemented; it does not establish that a mechanism performed successfully at an event.

## Use documentation while you program

[WPILib](https://docs.wpilib.org/en/stable/docs/software/wpilib-overview/what-is-wpilib.html) provides robot program structure, device interfaces, control math, simulation and testing support. Vendor libraries add device-specific APIs. The [WPILib Java reference](https://github.wpilib.org/allwpilib/docs/release/java/) gives exact method signatures.

Runnable examples include their imports and dependencies. Your editor can suggest imports, but check the package and API version: two classes with similar names can have different behavior. A compile error is useful evidence about the example's contract, rather than something to hide with a different import.

Use the [debugging playbooks](../guides/troubleshooting.md) when observed behavior differs from your prediction, and use the [mentor guide](../guides/mentors.md) to review an exercise with someone else.

## Connect measurements to decisions

Read [state estimation](6-Architecture/8-State_Estimation.md) to distinguish raw measurements, drift, bias and a calculated robot state. Follow it with [control-loop design](6-Architecture/9-Control_Loop_Design.md): a goal becomes a profile, feedforward and feedback produce an output, and the mechanism returns a new measurement. The [vision sequence](../vision/README.md) follows camera pixels through geometry, pose estimation and a controlled approach. Each lesson includes worked examples and questions, with simplified labs where useful.
