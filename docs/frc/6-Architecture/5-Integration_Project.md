<!-- ai-assisted -->
# Project: trace a target through IO and a table

**Prerequisites:** [IO](1-IO_Interfaces.md), [simulation](2-Simulation_IO.md), [replay](3-Logging_Replay.md), and [interpolation](4-Interpolation_Tables.md). **Time:** 60–90 minutes. **Outcome:** specify the data flow and verify safe behavior for valid, missing and out-of-range data. This is a simulation and design exercise; it does not authorize running a physical shooter.

## Establish the contract

Use the hypothetical table `(1 m → 100 rad/s, 3 m → 200 rad/s)`. A distance of 2 m requests 150 rad/s; the source is assumed valid only for this exercise. The actual starter's `RollerIOTraining` plant and table are separate examples; they are not wired together as a robot command. Before connecting them, write a contract: distance in meters, timestamp and validity; chosen speed in rad/s; observed speed and applied/requested voltage; a defined disabled behavior; and a response when the table returns empty. The example plant cannot reach 150 rad/s at its ±12 V ideal steady-state limit, so do not expect it to reach that target.

The following pseudo-code shows decision order, not an AdvantageKit implementation or an executable safety routine:

```text
sample = read IO once
record or replay sample before using it
if disabled or distance invalid or table lookup is empty:
    request zero output
else:
    target = table lookup in rad/s
    calculate bounded output from target and sample
record decision and reason
```

A real design must define sensor age, confidence, actuator limits and what “safe” means for that mechanism. Zero voltage may not hold a gravity-loaded mechanism. Interruption, sensor loss and reset must be reviewed explicitly, including independent physical protections.

## Trace and test

1. Run `./gradlew test --tests frc.robot.ArchitectureLessonsTest` from `examples/robot-starter`. Inspect `simulationSamplesThenComputesNextOutput` and `calibrationInterpolatesAndRejectsUnmeasuredRange`. The former publishes the old-interval sample before requesting the next voltage; the latter makes the missing result visible.
2. On paper, trace a valid 2 m sample and the next two roller cycles. The target would be 150 rad/s, the first observed velocity is 0 and the example's proportional calculation requests 15 V, clamped by its simulated IO to 12 V for the next interval. The next observed velocity is about `120*(1−exp(−0.1)) = 11.420 rad/s`. This is model output, not measured performance.
3. Trace a 4 m sample, `NaN`, and a missing sensor. In a complete integration each must take the documented fallback; the isolated table only returns empty for the first two and has no sensor connection input. Don't claim an end-to-end safety check until the integration itself is written and tested.
4. Design tests for the disabled transition, sensor loss while moving, and resuming after an interrupted command. For each, state initial inputs, transition, output, and why an old command cannot persist. Use deterministic injected IO instead of a real motor in the unit test. A human must inspect the physical procedure separately.

## Debugging and source trail

If the observed sample does not change, check that the plant advances and that its requested voltage is nonzero; if the target is empty, inspect domain and units; if a replay uses stale data, inspect the input-processing order and captured sources. Log sample timestamp, interpreted sensor state, target, request, and fallback reason. A graph can suggest a cause but cannot prove one without corroborating evidence.

Compare this design with the pinned team [HopperIntake IO family](https://github.com/FRC1257/2026-Robot/tree/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/Hopper/HopperIntake) and [ShooterTrajectoryCalculator](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/Shooter/ShooterTrajectoryCalculator.java). They are separate 2026 mechanisms, not an implementation of this invented combined example. [AdvantageKit's IO guidance](https://docs.advantagekit.org/data-flow/recording-inputs/io-interfaces/) describes the real logging pattern. Next: [time, state and filtering](6-Timing_And_State.md).
