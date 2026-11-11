<!-- ai-assisted -->
# Control-loop design: from goal to measured motion

**Prerequisites:** [PID basics](../3-Closed_Loop_Control/2-Basics_of_PID.md), [feedforward](../3-Closed_Loop_Control/4-Feedforward.md), and [IO interfaces](1-IO_Interfaces.md). **Time:** 45–60 minutes. **Outcome:** trace a goal through a reference, controller, actuator and measurement, then diagnose a mismatch without assuming that a request became motion. Numerical values below are hypothetical teaching examples, not robot tuning defaults.

A controller asks a mechanism to behave a certain way. The **goal** is the desired eventual state, such as an elevator height. A **reference** or setpoint is the desired value for the current control instant; a motion profile can turn a distant goal into a changing sequence of position and velocity references. The **measurement** is what the sensor reports. The **plant** is the physical system responding to the actuator, including its load and losses.

The controller calculates a request from the reference, measurements and model. A motor controller and mechanism may not deliver that request: output limits, battery voltage, current limits, gravity, friction, collisions, faults and wiring all matter. Logging a requested voltage is not evidence of achieved voltage or movement. [WPILib's PID documentation](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/pidcontroller.html) describes the feedback controller; [feedforward guidance](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/feedforward.html) explains how a mechanism model contributes an effort estimate.

## Follow one loop

Read the diagram left to right for the request and back along the lower line for feedback. It describes a conceptual architecture, not a claim that every robot or controller implements every block.

```text
goal → profile → reference ─┬─→ feedforward ─┐
                            └─→ feedback ─────┼→ sum & limits → actuator → plant → motion
                                ↑             │                              │
                                └──── checked, timestamped sensor ←──────────┘
```

A profile defines a desired trajectory subject to selected velocity and acceleration constraints; it does not force a mechanism to follow it. [WPILib trapezoidal profiles](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/trapezoidal-profiles.html) generate constrained reference states. The [motion-profile lab](../../labs/motion.html) shows an ideal rest-to-rest reference; it does not include tracking error, available torque or a real motor.

**Feedback** reacts to the difference between a reference and a measurement. With `error = reference − measurement`, a positive proportional contribution is `kP × error`, provided the signs and units match the mechanism. **Feedforward** uses a model and intended motion or other relevant information to predict effort, such as the voltage needed to oppose gravity. Feedback corrects remaining error; feedforward can reduce the correction needed. Feedforward can also use a measured angle in a model, so it is not defined by a ban on sensor inputs. WPILib shows [adding compatible feedforward and PID voltage outputs](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/combining-feedforward-feedback.html).

A velocity profile value in m/s cannot be compared directly with a position in meters. For an elevator, decide whether the loop controls position, velocity, or another variable; convert sensor rotations through gear ratio and mechanism geometry before comparing like units. If a motor API expects a normalized fraction, do not silently pass a voltage value. Make conversions, direction conventions and bounds explicit at the [IO interface](1-IO_Interfaces.md).

## Worked example: a bounded elevator request

At one hypothetical control instant, a profile requests **0.80 m** and the validated position measurement is **0.70 m**. Thus the position error is **0.10 m**. Suppose the proportional gain is **20 V/m**, so the proportional term is `20 V/m × 0.10 m = 2 V`. A model predicts **3 V** to hold the load; adding these gives a requested **5 V**. If the allowed range is ±4 V, the bounded request is **4 V**, not 5 V. No derivative or integral contribution is assumed in this calculation.

This arithmetic does not tell us actual motor voltage, acceleration or final position. The model's gravity estimate may be wrong, the available battery voltage may be lower, or the mechanism may be blocked. These numbers illustrate units and output saturation; they are not recommended gains or a commissioning procedure. Compare reference, measurement, feedforward, feedback, unclamped request, bounded request, applied output, sensor status and time in a log. A reference changing smoothly while the measurement stays still is a diagnosis starting point, not proof of a particular fault.

## Why saturation changes the loop

A controller is **saturated** when its request exceeds what the actuator or an intentional bound can deliver. Suppose persistent positive error causes the integral to accumulate while the output remains capped. Even when the mechanism eventually approaches the goal, that accumulated term may continue to demand the old direction and cause overshoot. This is integral windup. Common mitigations include limiting the integral contribution, conditional integration or a deliberately designed back-calculation scheme; each has assumptions and tradeoffs. Reset state on intentional mode changes where the design requires it, and check behavior when a sensor becomes invalid. See [WPILib PIDController integral guidance](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/pidcontroller.html).

Open the [PID and feedforward lab](../../labs/pid.html). Predict the response with no gravity feedforward, then add the lab's stated **2 N** compensation. The lab works in **force**, not motor voltage: do not copy its numerical gains or feedforward into the hypothetical voltage example or a robot. Compare anti-windup on and off with the windup preset, using the saturation time and response table. Its 1 kg plant, constant gravity and fixed timestep are deliberately simplified; it has no travel stops or hardware fidelity.

<!-- lab: pid -->

## Periods, state and validity

A controller is a sequence of timed calculations, not a formula floating outside time. WPILib's `PIDController` assumes `calculate()` is called at the configured interval; its default period is 20 ms unless another is specified. Calling it irregularly can change integral and derivative behavior. A sensor or motor controller may update on a different schedule, so a new robot-loop iteration does not guarantee a new sample. Track sample time and status, and reject stale, non-finite or implausible values according to the mechanism's needs. See [WPILib PID timing](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/pidcontroller.html) and [filtering and validity](7-Filtering_And_Validity.md).

Some designs use **nested loops**: an outer position loop requests velocity, and an inner velocity loop requests motor effort. Identify who owns each loop and its units, rate, limits and state. A motor controller's built-in loop may already close feedback; blindly adding another loop around it can cause conflicting assumptions or hidden saturation. A faster inner loop is a common design choice, not a substitute for analyzing dynamics and communication delays. Test interactions, sign conventions and transitions deliberately.

Limit switches, soft travel limits, sensor faults and disable behavior need explicit policies independent of a profile's requested path. If a required measurement becomes stale, a design might inhibit a sensor-dependent action and report a fault; the appropriate fallback depends on the mechanism and mentor review. A sensor value of zero is not automatically an invalid reading, and missing data must not silently become zero. Homing needs a documented reference and a reviewed safe procedure. [IOSim](2-Simulation_IO.md) makes a model and sample period testable; it does not prove a real mechanism is safe or accurately modeled.

| Observation | Plausible cause to investigate | Evidence or next check |
| --- | --- | --- |
| Output at limit, large persistent error | Load, obstruction, wrong model, voltage/current limit | Compare bounded and applied output, motion, current and physical limits. |
| Motion moves away from goal | Sensor or actuator sign, wrong unit conversion | Verify directions and units under a mentor-reviewed low-output procedure. |
| Output oscillates when a filtered measurement lags | Delay, gain, sample period or mechanism dynamics | Compare raw and filtered timestamps and references before changing gains. |
| Good simulation, poor physical tracking | Model assumptions, friction, gearing, battery or sensor differences | Compare logged real signals with the model; do not assume one is truth without a reference. |
| Calculated table setpoint seems plausible but is outside its measured domain | Extrapolation or silent endpoint clamping | Use the explicit reject/fallback policy in [interpolation tables](4-Interpolation_Tables.md). |

## Quick review

1. A profile requests 0.80 m, but the sensor reads 0.70 m. Which is the reference, and which is the measurement? Does either prove the physical height?
2. With the example's 3 V feedforward and 2 V proportional term, what is the bounded request under a ±4 V limit? What has not been measured?
3. A mechanism remains below its target while output is capped. Why can an unconstrained integral cause trouble after it begins moving?
4. A 20 ms controller repeatedly consumes a sensor sample that updates every 100 ms. How many loop calls might see the same sample, and why does that matter?
5. A motion profile stays within its acceleration limit, but the mechanism hits a physical stop. Why was the profile alone insufficient?
6. When an outer position loop requests velocity from an inner controller, which interfaces and limits must be checked?

<details><summary>Check your reasoning</summary>

1. 0.80 m is the current reference and 0.70 m is the sensor measurement. The latter is evidence with calibration and validity limits, not independent ground truth.
2. The request is 4 V after clipping 5 V. Applied voltage and resulting motion have not been established.
3. Error can keep accumulating while extra requested output cannot be delivered, causing continuing effort and possible overshoot later. Choose and test an anti-windup policy.
4. Roughly five calls under regular, aligned timing; actual scheduling and timestamp ages matter. Repeated values are not five independent measurements.
5. A reference constraint cannot guarantee tracking or replace physical travel sensing, limits, fault handling and mechanism review.
6. Verify position/velocity/effort units, sensor freshness, signs, controller ownership and periods, output constraints, saturation handling and disable/recovery behavior.

</details>

## Sources and related pages

- [WPILib PIDController](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/pidcontroller.html), [feedforward control](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/feedforward.html), [combining feedforward and feedback](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/combining-feedforward-feedback.html), and [trapezoidal profiles](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/trapezoidal-profiles.html).
- [State estimation](8-State_Estimation.md), [IO simulation](2-Simulation_IO.md), [filtering and validity](7-Filtering_And_Validity.md), and [interpolation tables](4-Interpolation_Tables.md).
