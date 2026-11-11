# Homing and zeroing sensors

**Prerequisites:** [digital input polarity](5-Boolean_Sensors.md) and [encoders](3-Encoders.md). An incremental encoder reports position relative to a reference; a startup reading of zero does not prove the mechanism is at a known physical position. Homing deliberately finds a reference using a validated switch or other sensor and associates that event with a measured position. Absolute sensors have different reference and calibration needs.

Choose the edge that represents the repeatable contact event after interpreting raw polarity. Sample once per loop, compare the current interpreted `pressed` with the previous state, and update the stored state. A switch that is already pressed on startup needs a separately specified recovery procedure; it will not necessarily create a new rising edge. Debounce where appropriate, enforce travel/time/output limits and detect stuck or disconnected sensors. A reference reset can create a discontinuity in feedback; decide how the controller handles the mode change.

```java
// Conceptual excerpt: pressed must already reflect the verified wiring polarity.
boolean justPressed = pressed && !previousPressed;
if (justPressed && homing) {
    // Record the motor encoder's current reading as homeMotorTurns.
    homeMotorTurns = motorTurns;
    homed = true;
}
previousPressed = pressed;
```

For a 6:1 reduction defined as six **motor turns per output turn**, a 0.10 m diameter drum and a motor reading 12 turns beyond the recorded home, output rotation is `12 / 6 = 2` turns and ideal cable travel is `2 * π * 0.10 ≈ 0.628 m`. Inversion, spool layers, stretching and backlash can change this relationship. The reference position must be measured and documented; zero motor turns does not automatically mean zero mechanism height. [Try the encoder and homing lab](../../labs/encoder.html).

**Exercise:** if a switch stays pressed for three loops, how many rising edges occur? One after an unpressed sample; none if it was already pressed at startup. Test both situations with motors disabled. If home changes repeatedly, inspect switch bounce and edge handling. Hardware homing requires a mentor-reviewed safe procedure and immediate disable plan. Source: [WPILib digital input documentation](https://docs.wpilib.org/en/stable/docs/software/hardware-apis/sensors/digital-inputs-software.html).