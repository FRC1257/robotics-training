# First subsystem: simulated intake

**Prerequisites:** [architecture](4b-Architecture.md), Java methods and lambdas. **Time:** 45 minutes. **Baseline:** Java 17, WPILib 2026.2.1. This exercise has no physical motor. Follow the [starter README](https://github.com/FRC1257/robotics-training/tree/master/examples/robot-starter) to build and run it.

Open `SimIntake.java`: it extends `SubsystemBase`, stores an output in the range −1 to 1, and publishes it from `periodic`. Open `Robot.java`: the scheduler runs every robot loop, and the command uses `runEnd` with the intake as a requirement. It starts at 0.5 and stops at timeout or interruption. Disabled initialization also stops the output. No motor, sensor, or plant dynamics are modeled.

**Try it:** enable the simulated Driver Station and start the dashboard command. Expect output 0.5, followed by 0 after two seconds. Run it again and disable before the timeout; expect 0. Change speed to 0.25 and rebuild. A mentor should check the result. If the output remains 0, confirm the simulated robot is enabled and the command was started. Never use this starter to control hardware without a separately reviewed hardware implementation, limits and electrical checks.

Next: [how commands work](5c-Making_Commands.md), [simulation](5e-Simulation.md). Reference: [WPILib subsystems](https://docs.wpilib.org/en/stable/docs/software/commandbased/subsystems.html).

## Work through the code

From a terminal in `examples/robot-starter`, execute `./gradlew build`. A successful build ends with `BUILD SUCCESSFUL`; the test report lists the output, cancellation, requirement-conflict and disabled tests. Open `src/main/java/frc/robot/SimIntake.java`. Its core is:

```java
private double speed;
public void setSpeed(double requested) {
    speed = Math.max(-1, Math.min(1, requested));
}
public double getSpeed() { return speed; }
@Override public void periodic() {
    SmartDashboard.putNumber("Intake output", speed);
}
```

`setSpeed` clamps the dimensionless request; `periodic` publishes it. It does not tell us the physical speed. In `Robot.java`, this is the command:

```java
Commands.runEnd(() -> intake.setSpeed(0.5),
    () -> intake.setSpeed(0), intake).withTimeout(2)
```

The first lambda runs while scheduled, the second runs at end including interruption, the final argument is the requirement, and the timeout is seconds. The scheduler must be called every loop. Read `CommandLifecycleTest`: it provides executable examples of scheduling, interrupting and disabling.

## Predict → experiment → explain

| Scenario | Prediction | Evidence to look for |
| --- | --- | --- |
| Start while enabled | 0.5 until timeout | Dashboard value changes and returns to 0 |
| Disable early | 0 | Disabled transition and output change |
| A second command requires the intake | First is interrupted | First stop action runs before second executes |
| Request 2.0 | 1.0 | Unit test checks the clamp |

Run `./gradlew test` and inspect `build/reports/tests/test/index.html`. Change the command's request to `0.25`; rerun the tests and simulation. The display should show 0.25 then 0. The existing lifecycle tests deliberately exercise their own command at 0.5, so they do not prove this new dashboard value; observe it separately. Change it back after the experiment.

**Challenge:** write a second command that requires the intake and runs at −0.25. Predict what happens if it starts while the first runs. The scheduler ends the first, runs its stop action, then the second can execute. Explain why the stop action matters even if another command will soon run: a command might be interrupted by disable or canceled without replacement. Review this trace with a mentor before adding physical hardware.

| Problem | Investigation |
| --- | --- |
| `javac` or Gradle version error | Select JDK 17 and use the included wrapper. |
| Dependencies cannot be resolved | Check network and installed WPILib 2026 tools; save the actual error. |
| Dashboard value stays zero | Enable the simulated Driver Station; connect the dashboard and schedule the button. |
| Test fails after editing | Read the failing assertion and compare expected lifecycle to the changed behavior. |
