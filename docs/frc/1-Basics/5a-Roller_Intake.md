# Roller intake behavior

Continue [the simulated intake project](5-First_Subsystem.md). The subsystem owns the output; the command determines when to run and stop it. In the starter `setSpeed(0.5)` requests half normalized output, and `setSpeed(0)` stops it. This number is not a measured roller velocity or motor voltage. The example clamps requests but does not model current, friction, inertia, game pieces or wiring.

**Task:** predict the output after the two-second timeout and after disabling early, then run both cases. Both should end at zero. If the command fails to run, check that the simulator is enabled. If it runs indefinitely, inspect the timeout and interruption action. On hardware, a mentor must review wiring, motor configuration, limits and the safe disable procedure first.

Compare the team’s [2026 HopperIntake IO interface and implementations](https://github.com/FRC1257/2026-Robot/tree/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/Hopper/HopperIntake): these are robot-specific vendor and logging code, not dependencies of the starter.

[Archived original lesson](../archive/Roller_Intake_legacy.md) (historical APIs; unverified).
