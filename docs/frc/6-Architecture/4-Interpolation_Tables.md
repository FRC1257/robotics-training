<!-- ai-assisted -->
# Interpolation tables and calibration

**Prerequisites:** functions, units, [feedforward](../3-Closed_Loop_Control/4-Feedforward.md). **Time:** 50 minutes. **Outcome:** interpolate between two samples, detect invalid tables and explain what happens outside the measured range.

A calibration table maps a measured independent variable to a chosen output. For example, a hypothetical table might map distance in meters to a flywheel setpoint in radians per second. The entries must come from a stated test and configuration before being treated as calibrated values. The numbers below are invented to practice arithmetic; they are not Team 1257's settings.

| Distance (m) | Desired flywheel speed (rad/s) |
| ---: | ---: |
| 1.0 | 100 |
| 3.0 | 200 |

For a query `x` between `(x0,y0)` and `(x1,y1)`, compute `t = (x − x0)/(x1 − x0)` and `y = y0 + t*(y1 − y0)`. At 2 m, `t = 0.5` and the result is 150 rad/s. This assumes linear behavior between those points; the calculation alone does not establish that the interpolated value works physically. For cyclic angles crossing −π/π, ordinary numeric interpolation can take the long way around; choose an appropriate angle representation and interpolation rule.

## What WPILib does at the boundaries

WPILib 2026.2.1's `InterpolatingDoubleTreeMap` uses a sorted map and linear interpolation. Its parent implementation returns the nearest endpoint when the query is below or above its keys; an empty map returns `null`, and inserting the same key again replaces the previous value. Endpoint clamping is **not** an out-of-range warning or extrapolation. A system may instead reject a query, enter a safe fallback, or explicitly clamp, but it must choose and document that policy. Blindly unboxing an empty result can throw an exception.

The runnable `CalibrationTable.java` validates finite values, at least two paired samples and strictly increasing distances before building a WPILib map. It returns `OptionalDouble.empty()` for non-finite or out-of-domain queries, so the caller must decide what to do. Run `./gradlew test --tests frc.robot.ArchitectureLessonsTest` in `examples/robot-starter`: the tests check 100, 150 and 200 rad/s, reject outside queries and duplicate keys, and separately demonstrate WPILib's endpoint behavior. The code's strict rejection is **our example policy**, not the default of WPILib's map.

## Use the checked table

The runnable `CalibrationTable` wraps WPILib's `InterpolatingDoubleTreeMap`. This excerpt from its actual `lookup` method rejects a query outside the validated domain before asking the map:

```java
public OptionalDouble lookup(double distanceMeters) {
    if (!Double.isFinite(distanceMeters)
            || distanceMeters < minimumMeters
            || distanceMeters > maximumMeters)
        return OptionalDouble.empty();
    return OptionalDouble.of(table.get(distanceMeters));
}
```

Its constructor checks that the two arrays have the same length, contain at least two finite samples and have strictly increasing distances. A caller can explicitly handle the missing result:

```java
CalibrationTable table = new CalibrationTable(
        new double[] {1.0, 3.0}, new double[] {100.0, 200.0});
OptionalDouble result = table.lookup(2.0);
if (result.isPresent()) {
    System.out.println(result.getAsDouble()); // 150.0 rad/s
} else {
    System.out.println("No validated setpoint for this distance");
}
```

This is a caller excerpt; add `import java.util.OptionalDouble;` in a complete class. For a real mechanism the `else` branch must invoke a mechanism-specific, reviewed fallback; printing alone is not one. Expected results for the hypothetical table:

| Query (m) | Wrapper result | Reason |
| ---: | --- | --- |
| 1.0 | 100 rad/s | Exact first key |
| 2.0 | 150 rad/s | Midpoint interpolation |
| 3.0 | 200 rad/s | Exact last key |
| 4.0 | Empty | Outside the stated domain |

Unwrapped WPILib would return 200 at 4 m. Run the named tests and compare both behaviors before altering the wrapper.

## Read a real team table

The pinned [2026 ShooterTrajectoryCalculator](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/Shooter/ShooterTrajectoryCalculator.java) declares distance-to-hood-angle, flywheel-speed and time-of-flight maps. Its [UnitInterpolation](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/util/misc/UnitInterpolation.java) uses base-unit magnitudes for interpolation. Read both to identify the declared units and query points. The pinned time-of-flight initialization repeatedly inserts the same zero key and value; because a duplicate key replaces the prior entry, that initialization does not establish a measured flight-time curve. Do not fill the gaps with guessed values or assume the team's operational intent from that observation.

## Build and validate a table

Record the robot and mechanism configuration, sensor/target reference points, units, software revision, battery/test conditions, repeated trials and uncertainty. Check independent-variable order, duplicates, finite values, physical bounds and sensor confidence; review sudden changes and repeatability before deployment. A monotonic input axis does not imply the output must always be monotonic. Store the source observations separately from fitted or averaged entries. Select validation points between the calibration points and independently compare predicted with measured behavior; do not use the same data alone as proof of accuracy.

**Exercise:** using the hypothetical table above, predict the result at 2.5 m (175 rad/s); then query 4 m. Our wrapper returns empty, while the unwrapped WPILib map returns the 3 m endpoint. Explain why silently treating that endpoint as validated at 4 m would be misleading. If tests fail, check units, duplicate keys and bounds before changing constants. A mentor must review any real-world measurement procedure and operational limits.

Sources: [WPILib 2026.2.1 InterpolatingTreeMap source](https://github.com/wpilibsuite/allwpilib/blob/c89401250fbd412ba050f595551d0a451b7307a2/wpimath/src/main/java/edu/wpi/first/math/interpolation/InterpolatingTreeMap.java), [InterpolatingDoubleTreeMap source](https://github.com/wpilibsuite/allwpilib/blob/c89401250fbd412ba050f595551d0a451b7307a2/wpimath/src/main/java/edu/wpi/first/math/interpolation/InterpolatingDoubleTreeMap.java), and team sources above. Next: [integration project](5-Integration_Project.md).
