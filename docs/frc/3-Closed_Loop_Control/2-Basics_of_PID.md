# PID: correct the error

**Prerequisites:** variables and feedback. **Time:** 30 minutes. **Status:** equations reviewed; robot tuning requires mentor review. Run the dependency-free example in [examples/PidDemo.java](https://github.com/FRC1257/robotics-training/blob/main/examples/PidDemo.java) and try the [PID lab](../../labs/pid.html).

A sensor measures position `x` in meters and the setpoint `r` is the desired position. Define error `e = r - x`. Assume positive output increases the measurement; verify sensor and motor directions before applying closed-loop control. A controller sampled every `dt` seconds can calculate:

```text
integral = integral + error * dt
derivative = (error - previousError) / dt
output = kP * error + kI * integral + kD * derivative
```

The first derivative should be initialized without a spurious jump; `dt` must be positive and consistent. For a fixed target, as the mechanism rises toward it, error decreases, derivative is negative, and positive `kD` reduces positive output. Derivative of *measurement* has the opposite sign for a fixed setpoint; changing a setpoint can cause a derivative kick. Noise is amplified by differentiation. Gain units depend on measurement, output, and seconds.

P responds to present error. I accumulates error over time and can help persistent error but may wind up when output saturates. Clamp the integral contribution and reset controller state on disable or an intentional mode change; this does not eliminate every form of windup. D responds to change in error and can add damping, but too much or noisy sensing can destabilize a real system. More of a gain is not invariably better. Gravity or friction feedforward may reduce persistent error without large I.

**Exercise:** with constant error 2 m for three 0.1 s samples, the integral increases by 0.2 m·s per sample to 0.6 m·s. With previous error 1 m and current error 0.8 m over 0.1 s, derivative is −2 m/s and `kD=0.1` contributes −0.2 output. Run `PidDemo`; compare its assertions and explain the signs. Then explore unstable values only in simulation.

<!-- lab: pid -->

For real mechanisms use WPILib's tested `PIDController`, appropriate feedforward, output limits, correct sensor units, and mechanical limits. Do not copy simulation gains onto a robot. With a mentor, clear the area, secure the robot, establish travel/output limits and an immediate disable plan, verify sensor polarity at low output, then use small gains and small setpoint changes. Stop immediately for unexpected movement or oscillation. Review logs before the next trial; do not deliberately create violent oscillation.

**Troubleshooting:** motion away from the target suggests incorrect polarity or units; noise-sensitive output suggests derivative/noise problems; sluggishness may be an output limit or insufficient feedforward. Check these before changing gains.

Source: [WPILib 2026 PID introduction](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/introduction-to-pid.html), [PIDController documentation](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/pidcontroller.html).
