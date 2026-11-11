# Feedforward: predict the effort

**Prerequisites:** [PID](2-Basics_of_PID.md), units and motor control. **Time:** 35 minutes. **Baseline:** WPILib 2026.2.1; the linked stable docs may change in future seasons. A model predicts how much voltage is needed for a requested motion; feedback corrects the error that remains when the model or real conditions are imperfect. A motion profile creates a feasible sequence of desired positions and velocities subject to its chosen limits; it is not itself a motor controller.

## A simple model

A commonly used model for a simple motor or drivetrain is:

```text
V_ff = kS * sign(v_desired) + kV * v_desired + kA * a_desired
V_request = V_ff + V_feedback
```

`V_ff` and `V_feedback` are volts. With velocity in m/s and acceleration in m/s², `kS` is volts, `kV` is V/(m/s), and `kA` is V/(m/s²). For a rotating mechanism, use radians, rad/s and rad/s² consistently instead. A voltage request is limited by battery voltage, controller capability and safety constraints; the applied voltage may differ from the request. The static-friction term's zero-velocity behavior is model/API-specific, so don't infer starting torque from `sign(0)` alone.

An elevator model adds approximately constant `kG` volts to support gravity. A single-jointed arm has a gravity term `kG * cos(theta)` **when theta is measured from horizontal**, with positive conventions matched to the model. The actual arm may have counterweights, variable friction or other loads not captured by the simple model. Never assume the elevator and arm gravity terms are interchangeable. The gravity compensation may use a measured angle: feedforward describes prediction from a model/reference and is not defined by a ban on sensor inputs. Different vendor controllers use the term “arbitrary feedforward” for an additional supplied contribution; it can depend on a setpoint, velocity, angle or other modeled quantity. Check the specific API and units.

## Worked example

Suppose hypothetical characterization yields `kS = 0.2 V`, `kV = 1.0 V/(m/s)` and `kA = 0.1 V/(m/s²)`. At desired +2 m/s and +1 m/s², predicted feedforward is `0.2 + 2.0 + 0.1 = 2.3 V`. If feedback contributes +0.4 V, the combined request is 2.7 V before limits. These are invented arithmetic values, not robot gains. For negative motion, the static term changes sign; acceleration can independently have either sign.

In a version-matched WPILib project, `SimpleMotorFeedforward`, `ElevatorFeedforward`, and `ArmFeedforward` implement models with documented units and calculation methods. Use the season's API documentation: acceleration support and signatures differ across versions. Sum compatible voltage outputs and use an appropriate voltage-control API instead of treating volts as a normalized motor percentage. The motor, sensor conversion, sign, travel limits, current limits and disable behavior require a separate hardware review.

## Try it

1. Compute the simple model above at +1 m/s and zero acceleration. Expected: 1.2 V.
2. At −1 m/s and zero acceleration, expected: −1.2 V with the stated model and sign convention.
3. Why might the mechanism still miss its target? The model omits disturbances and parameter error; feedback can correct error within actuator limits. A saturated actuator cannot necessarily follow an infeasible reference.
4. In simulation compare a profile with and without feedforward while plotting desired position, measured position and voltage. Record the model and sample period; do not treat the result as hardware tuning. If output drives the wrong way, check sensor and motor signs before changing gains.

Next: [SysId and characterization](../5-Advanced_&_Misc/Sysid.md) and [motion profiles](5-Motion_Profiling.md). Sources: [WPILib feedforward](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/feedforward.html), [WPILib system identification](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/system-identification/introduction.html).