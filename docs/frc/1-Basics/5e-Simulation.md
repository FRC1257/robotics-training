# Run the simulated intake

**Prerequisites:** JDK 17 and the 2026 WPILib toolchain. **Time:** 30 minutes. Follow [the starter README](https://github.com/FRC1257/robotics-training/tree/main/examples/robot-starter) for `./gradlew build` and `./gradlew simulateJava`. Enable the simulated Driver Station and trigger the dashboard command. Check output is 0.5 while running and 0 after timeout or early disable.

This simulation represents only a bounded requested output. It does not simulate a motor, current, inertia, battery, or field. A passing simulation is not evidence of hardware safety. For a physics model, specify motor, gearing, inertia, units, time step and sensor model, then compare its predictions to measured behavior. WPILib provides simulation classes, but their assumptions must be reviewed.

**Troubleshooting:** dependency download failures require network access and installed toolchain; GUI problems may be platform-specific. If the command does not execute, check that the robot is enabled. Source: [WPILib physics simulation](https://docs.wpilib.org/en/stable/docs/software/wpilib-tools/robot-simulation/physics-sim.html).
