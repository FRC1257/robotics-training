# 2026 simulation starter

Java 17, Gradle 8.11 wrapper, GradleRIO/WPILib 2026.2.1 and WPILib New Commands (vendordep file); no third-party vendor libraries. The wrapper, settings and commands vendordep derive from [Team 1257's 2026 project at 0c9a024](https://github.com/FRC1257/2026-Robot/tree/0c9a024dec1f58648d573ce26fcfd02639c5ca66). The starter has no deploy configuration or hardware access. It models requested intake output only, not motor physics.

Install the 2026 WPILib tools and JDK 17. From a terminal, clone the training repository and enter the starter directory:

```sh
git clone https://github.com/FRC1257/robotics-training.git
cd robotics-training/examples/robot-starter
```

If you already have a clone, begin with `cd` to its `examples/robot-starter` directory. Then run:

```sh
./gradlew build
./gradlew simulateJava
```

On Windows use `gradlew.bat`. In the simulated Driver Station enable the robot. Open a compatible dashboard/Glass and the SmartDashboard command named `Run intake for 2 seconds`, then activate it. The published `Intake output` should show 0.5 while running and 0 after timeout. Start again and disable early: output should return to 0. If the button is missing, inspect the dashboard's NetworkTables/SmartDashboard view and ensure it is connected to the local simulation. GUI and dashboard interaction depend on the installed WPILib tools.

On November 10, 2026, `./gradlew build` passed on macOS with Temurin 17.0.18. Tests check clamping, timeout, cancellation, conflicting requirements and disabling. `simulateJava` initialized the GUI and robot program on the same machine; the dashboard interaction was not exercised. This does not verify a physical robot. See [the lesson](../../docs/frc/1-Basics/5-First_Subsystem.md) for the task and troubleshooting.

See [third-party notices and licenses](gradle/NOTICE.md) for the wrapper and WPILib vendordep.
