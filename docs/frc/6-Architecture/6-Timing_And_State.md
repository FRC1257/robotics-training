<!-- ai-assisted -->
# Time, state and stable decisions

**Prerequisites:** [integration project](5-Integration_Project.md), commands, booleans. **Time:** 50–70 minutes. **Outcome:** design a deterministic test for a timed state transition and distinguish filtering, hysteresis and debounce.

## Inject dependencies and time

Constructor injection lets a subsystem receive an IO implementation rather than create hardware internally. The runnable `RollerIOTraining` takes `RollerIO` and an input observer in its constructor; tests can supply a deterministic implementation. `SubsystemIO` and `SubsystemIOSim` are naming conventions for this pattern, not standard WPILib classes. The interface should state units, update cadence, valid ranges and fault behavior. In tests, provide known readings and inspect requests; do not use the actual vendor motor library to prove pure control logic.

Time is also an input. For a timeout or sensor age check, a small design can accept a clock function, for example `DoubleSupplier nowSeconds`; a test supplies a controllable value while production supplies an appropriate monotonic robot clock. Define whether timestamps use the same epoch and what happens when time is invalid or moves backwards. A fake clock can advance directly to just before and just after a deadline without sleeping. The clock is part of the contract, not proof that a replay has captured all timing sources.

For AdvantageKit, `@AutoLog` inputs are typically mutable fields populated by IO and then by `Logger.processInputs` during replay. Code should treat the post-processing values as a stable sample for that loop. Our training example instead returns an immutable Java record to its observer; its observer is not a replay engine. Both approaches need clear ownership: retaining a reference to a mutable inputs object and changing it later can invalidate a historical observation.

## State and command lifecycle

A state machine names states and permitted transitions. Consider `IDLE → RUNNING → FAULT`: enable plus valid sensor enters `RUNNING`; a stale or disconnected sensor enters `FAULT`; the fault's output policy is explicit. A timeout should be measured from a clearly defined entry event. Commands can coordinate this behavior using requirements, composition and end actions. Test interruption and disable as transitions, not only the happy path. A timeout is not a substitute for physical limits or a reviewed safety design.

**Worked test design:** fake time starts at 0.00 s; a valid reading enters `RUNNING`; the stale threshold is 0.50 s. At 0.49 s expect `RUNNING`; at 0.51 s without a new sample expect `FAULT` and the specified stop request. Also test a fresh timestamp at 0.49 s, invalid timestamps, disabled state, and whether explicit reset is required. These are test specifications, not behavior implemented by `RollerIOTraining`.

## Three different tools

- A **filter** smooths a numeric signal, usually adding delay. A moving average of noisy velocity can reduce fluctuations but can hide a fast change.
- **Hysteresis** uses different enter and exit thresholds. For example, enter “ready” above 100 rad/s and leave below 95 rad/s; values between keep the previous state. Choose signs and thresholds from the actual mechanism, not these illustrative values.
- **Debounce** requires a boolean input to remain in a state for a specified time before reporting a transition. It can suppress switch bounce but delays recognition. WPILib supports different rising/falling debounce choices; select the one matching the failure mode.

**Exercise:** a velocity sequence is `94, 101, 98, 94` rad/s. Starting not ready with the above hysteresis, the states are `false, true, true, false`. A boolean switch that briefly flickers is a debounce problem; averaging its numeric representation is not automatically the right solution. For stale data, use timestamp validity in addition to smoothing: a stable old value can still be wrong.

If a test flakes, inspect real clock reads, uncontrolled threads, random input and shared mutable objects. Add tests at exact thresholds and for interrupted commands. Sources: [WPILib debounce](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/filters/debouncer.html), [command composition](https://docs.wpilib.org/en/stable/docs/software/commandbased/command-compositions.html), [AdvantageKit nondeterministic sources](https://docs.advantagekit.org/getting-started/common-issues/non-deterministic-data-sources/), and [AdvantageKit IO interfaces](https://docs.advantagekit.org/data-flow/recording-inputs/io-interfaces/).
