# Boolean sensors and polarity

**Prerequisites:** electrical signals, Java booleans and the [encoder lab](../../labs/encoder.html). **Time:** 25 minutes. A digital input reads an electrical logic level; the physical meaning depends on the sensor, wiring and pull-up or pull-down configuration. A normally open switch wired to ground on a pull-up input commonly reads `false` when pressed, but this is an example, not a universal rule. A break-beam output's polarity likewise depends on its device and wiring. Consult its documentation and verify both states with a mentor before commanding a mechanism.

## Interpret a switch

For an explicitly verified active-low input only:

```java
boolean rawHigh = limitSwitch.get();  // DigitalInput; electrical level
boolean pressed = !rawHigh;           // this wiring only
```

This is an excerpt requiring a project-defined `DigitalInput`, not a complete robot program. For active-high wiring use `pressed = rawHigh`. Label and log both the raw level and interpreted state. Test switch released and pressed with motors disabled; test an unplugged wire as well because some wiring can appear pressed or unpressed on a fault. A switch reading alone does not prove a mechanism is safe or homed.

## Limits and homing

Once polarity and motion direction are confirmed, a reviewed control can prevent movement *toward* the limit while permitting movement away. Define explicit fail-safe behavior for disconnected, stuck or contradictory switches, and use appropriate independent hardware protections. A switch edge can establish a reference only if it corresponds to a known physical position; account for hysteresis, bounce and repeatability. See [zeroing sensors](8-Zeroing_Sensors.md).

**Exercise:** with active-low wiring, raw `true` means not pressed and raw `false` means pressed. Verify this truth table in the encoder lab; change to active-high and predict the result before checking. If the result seems inverted, review wiring and measured voltage before changing software. A pressed limit should inhibit further motion toward it, not necessarily motion away. Source: [WPILib digital inputs](https://docs.wpilib.org/en/stable/docs/software/hardware-apis/sensors/digital-inputs-software.html).