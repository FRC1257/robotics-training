<!-- ai-assisted -->
# Subsystem IO: separate the decision from the device

**Prerequisites:** Java interfaces and [commands/subsystems](../1-Basics/5-First_Subsystem.md). **Time:** 45–60 minutes. **Baseline:** Java 17 and WPILib 2026.2.1. **Outcome:** trace a sensor sample into a command decision and explain why the same subsystem can run with different IO implementations.

A subsystem contains behavior: for example, it decides the voltage to request and exposes commands to the rest of the robot. Its IO boundary describes what it needs to observe and what it can ask hardware to do. A real implementation talks to motor controllers and sensors; a simulation implementation supplies simulated inputs and consumes outputs; a replay setup supplies recorded inputs. This is an architecture choice used by AdvantageKit, not a requirement imposed by WPILib. A fake implementation can make a decision testable without creating a motor controller object.

A small interface can make the contract clear:

```java
public record Inputs(double velocityRadPerSec, double appliedVolts) {}
public interface RollerIO {
    Inputs updateInputs();
    void setVoltage(double volts);
}
```

This excerpt comes from the original, runnable `RollerIOTraining.java` in `examples/robot-starter`. Names specify units: a speed in radians per second is not motor revolutions per minute. The immutable record is one sample; returning a new record avoids unexpectedly changing it after the subsystem reads it. Real code also needs connection status, timestamps, range checks and a documented policy for stale readings. `setVoltage` is a request, not evidence the motor received that voltage or that the mechanism moved.

## Follow the actual implementation

The runnable constructor receives dependencies instead of creating a motor. Its `periodic` method samples once, passes that exact record to the observer and requests the output for the next interval. This excerpt is from `RollerIOTraining.java`; its enclosing class and imports are in the starter:

```java
public RollerIOTraining(RollerIO io, Consumer<Inputs> inputObserver) {
    this.io = Objects.requireNonNull(io);
    this.inputObserver = Objects.requireNonNull(inputObserver);
}

public Inputs periodic(double targetRadPerSec) {
    if (!Double.isFinite(targetRadPerSec))
        throw new IllegalArgumentException("target must be finite");
    Inputs inputs = io.updateInputs();
    inputObserver.accept(inputs);
    io.setVoltage(0.1 * (targetRadPerSec - inputs.velocityRadPerSec()));
    return inputs;
}
```

For a 100 rad/s target starting at rest, the first record is `(velocity=0, appliedVolts=0)`. The calculation requests 10 V; the model applies that over the following interval. The second record contains the resulting speed and 10 V. The observer in this example is only a test hook; it does not perform AdvantageKit replay. Notice that the target itself is an input to the decision. A real replayable subsystem must capture or deterministically supply it too.

## Trace Team 1257's code

At [2026-Robot commit `0c9a024`](https://github.com/FRC1257/2026-Robot/tree/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/Hopper/HopperIntake), read `HopperIntakeIO`, `HopperIntakeIOSparkMax`, `HopperIntakeIOSim`, and `HopperIntake`. The interface defines an inputs class with velocity, voltage, current, temperature and connection fields plus output methods. The subsystem takes an IO object in its constructor and uses the inputs after updating and processing them. In the pinned [RobotContainer](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/RobotContainer.java), real mode selects the Spark MAX implementation and sim mode selects the simulation implementation. A default/no-op implementation is not a physics model.

The team example uses AdvantageKit `@AutoLog` and typed WPILib units. The runnable teaching example deliberately uses neither AdvantageKit nor vendor devices: its `Consumer<Inputs>` only observes a sample; it cannot read a replay log. This distinction matters when comparing examples.

## Try it

In a checkout, `cd examples/robot-starter` and run `./gradlew test --tests frc.robot.ArchitectureLessonsTest`. On Windows use `gradlew.bat`. In `simulationSamplesThenComputesNextOutput`, the first sample is zero; after the controller requests 10 V, the next sample reports 10 V and approximately 9.516 rad/s. The plant updates before each sample, and the controller's new voltage applies during the next 20 ms interval.

Draw `command → subsystem → IO output → plant/device → IO inputs → subsystem`. Which parts change on a real robot? **Answer:** the real IO implementation and device, while the subsystem can keep the same contract. What should happen when a sensor is disconnected? The real contract must expose and handle that condition; this teaching model does not implement it. If your test cannot resolve dependencies, confirm JDK 17 and the 2026 WPILib installation before editing the example.

Sources: [AdvantageKit IO interfaces](https://docs.advantagekit.org/data-flow/recording-inputs/io-interfaces/) and [WPILib subsystems](https://docs.wpilib.org/en/stable/docs/software/commandbased/subsystems.html). Next: [simulation IO](2-Simulation_IO.md).
