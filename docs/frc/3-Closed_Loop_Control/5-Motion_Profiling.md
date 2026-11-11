<!-- ai-assisted -->
# Motion profiles: plan a reference, then track it

**Prerequisites:** [PID](2-Basics_of_PID.md), [feedforward](4-Feedforward.md) and position/velocity units. **Time:** 40 minutes. **Baseline:** WPILib 2026.2.1, Java 17. **Outcome:** predict a profile's shape and explain why a real mechanism can still fail to follow it.

A motion profile describes a desired position and velocity over time subject to selected velocity and acceleration constraints. A position controller can then track that moving reference. A sudden position step may demand aggressive motion with some controller and mechanism combinations; it does not imply every PID controller will accelerate too quickly. Constraints make the *reference* smoother and more predictable, but they do not enforce physical limits on a mechanism that is unable to track it.

For an ideal rest-to-rest trapezoidal profile, accelerate at the chosen magnitude, cruise at the speed limit if there is enough distance, then decelerate. A short move becomes triangular: it begins slowing before reaching the speed limit. This simple model assumes instantaneous changes in acceleration; it does not limit jerk.

## Work the numbers

For a positive travel distance $d$, positive acceleration limit $a$ and positive speed limit $v_{\max}$, with both endpoints at rest, the transition distance is:

$$d_{\mathrm{switch}} = \frac{v_{\max}^{2}}{a}$$

At or below that distance the move is triangular, with $v_{\mathrm{peak}}=\sqrt{ad}$ and $T=2\sqrt{d/a}$. Above it, the move includes cruise time:

$$T = \frac{2v_{\max}}{a} + \frac{d-v_{\max}^{2}/a}{v_{\max}}$$

The distance is in meters, speed in meters per second, acceleration in meters per second squared and duration in seconds. These formulas apply to this rest-to-rest reference; a moving initial state needs the more general profile calculation.

Assume a 1 m/s² acceleration limit, 2 m/s speed limit and zero starting and ending velocity:

| Move | Profile | Peak speed | Total time |
| ---: | --- | ---: | ---: |
| 3 m | Triangular | √3 ≈ 1.732 m/s | 2√3 ≈ 3.464 s |
| 8 m | Trapezoidal | 2 m/s | 6 s |

For 3 m, acceleration and deceleration each cover half the distance: `3 = peakSpeed² / 1`, so `peakSpeed = √3`. For 8 m, reaching 2 m/s takes 2 s and covers 2 m; slowing takes another 2 s and 2 m. The remaining 4 m takes 2 s at cruise speed, for 6 s total. These are ideal reference times, not measured travel times. The [motion-profile lab](../../labs/motion.html ':ignore') implements this rest-to-rest model; its numeric table uses SI units.

<!-- lab: motion -->

## Generate and follow a reference

The following **partial Java example** uses the WPILib 2026 `TrapezoidProfile` API. Put the fields in a class, supply a measured position and a valid output limit, and call the method at 20 ms intervals. It does not create a motor or command hardware.

```java
import edu.wpi.first.math.MathUtil;
import edu.wpi.first.math.controller.PIDController;
import edu.wpi.first.math.trajectory.TrapezoidProfile;

// Fields, initialized once; position in m, velocity in m/s, time in s.
private static final double DT = 0.02;
private final TrapezoidProfile profile = new TrapezoidProfile(
    new TrapezoidProfile.Constraints(2.0, 1.0));
private TrapezoidProfile.State reference = new TrapezoidProfile.State(0.0, 0.0);
private final TrapezoidProfile.State goal = new TrapezoidProfile.State(3.0, 0.0);
// Interpret this example's proportional gain as volts per meter.
private final PIDController feedback = new PIDController(2.0, 0.0, 0.0, DT);

// Call once per 20 ms. availableVolts must be finite and nonnegative.
private double nextVoltage(double measuredPositionMeters, double availableVolts) {
    reference = profile.calculate(DT, reference, goal);
    double feedbackVolts = feedback.calculate(measuredPositionMeters, reference.position);
    return MathUtil.clamp(feedbackVolts, -availableVolts, availableVolts);
}
```

`calculate(DT, reference, goal)` advances the previous **reference**, rather than assuming the mechanism achieved it. The returned `reference.velocity` is in m/s. A real mechanism normally needs a suitable, characterized feedforward in volts, based on the model and desired motion, added to the feedback voltage before applying the reviewed actuator limit. Arm and elevator gravity terms differ; see [feedforward](4-Feedforward.md). Check output sign, conversions, mechanism travel and sensor validity, and use an appropriate voltage-control API. This snippet leaves those hardware decisions out intentionally.

## What happens when the real mechanism falls behind?

A voltage-limited actuator may not supply the acceleration in the profile, particularly under load or reduced battery voltage. Profiling does not restore battery voltage, guarantee current limits, prevent collisions, or ensure a setpoint is reachable. Log measured position and velocity, reference position and velocity, requested and applied voltage, and saturation or fault state. Persistent reference error while voltage is at its limit suggests insufficient headroom or an infeasible constraint; inspect battery, load, wiring and the model before changing gains. A suitable feedforward can reduce feedback's workload, but it cannot create unavailable voltage or substitute for safe limits.

When a goal changes, replan deliberately from a defined current reference or measured state; document how the control loop handles tracking error and sensor uncertainty. At enable or after a reset, initialize the profile and controller from a valid state under the mechanism's reviewed procedure rather than assuming the mechanism is at zero. A zero-velocity goal means the **reference** has stopped; the mechanism may still be moving or off target. Define a tolerance, settling window, hold policy and behavior for interruption or disable. A gravity-loaded axis may not hold when disabled.

## Exercise

In the lab, set distance to 3 m, maximum speed to 2 m/s and maximum acceleration to 1 m/s². Predict a triangular profile, peak `1.732 m/s` and duration `3.464 s`. Change distance to 8 m: expect a 2 m/s peak, 2 s cruise and 6 s duration. Then suppose a logged mechanism lags the 8 m reference while applied voltage is saturated: identify at least two possible causes and a measurement to check. The lab models reference motion only; it cannot verify traction, battery behavior, physical travel or safe gains.

Sources: [WPILib trapezoidal motion profiles](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/trapezoidal-profiles.html), [WPILib 2026.2.1 `TrapezoidProfile` source](https://github.com/wpilibsuite/allwpilib/blob/c89401250fbd412ba050f595551d0a451b7307a2/wpimath/src/main/java/edu/wpi/first/math/trajectory/TrapezoidProfile.java), and [WPILib feedforward](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/feedforward.html).
