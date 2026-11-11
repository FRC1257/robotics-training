package frc.robot;

import edu.wpi.first.math.interpolation.InterpolatingDoubleTreeMap;
import java.util.OptionalDouble;

/** Illustrative meters-to-rad/s table; reject queries outside the measured domain. */
public final class CalibrationTable {
  private final InterpolatingDoubleTreeMap table = new InterpolatingDoubleTreeMap();
  private final double minimumMeters;
  private final double maximumMeters;

  public CalibrationTable(double[] distanceMeters, double[] speedRadPerSec) {
    if (distanceMeters == null || speedRadPerSec == null || distanceMeters.length < 2
        || distanceMeters.length != speedRadPerSec.length) {
      throw new IllegalArgumentException("Need at least two paired samples");
    }
    for (int i = 0; i < distanceMeters.length; i++) {
      if (!Double.isFinite(distanceMeters[i]) || !Double.isFinite(speedRadPerSec[i])
          || (i > 0 && distanceMeters[i] <= distanceMeters[i - 1])) {
        throw new IllegalArgumentException("Samples must be finite and distances strictly increasing");
      }
      table.put(distanceMeters[i], speedRadPerSec[i]);
    }
    minimumMeters = distanceMeters[0];
    maximumMeters = distanceMeters[distanceMeters.length - 1];
  }

  public OptionalDouble lookup(double distanceMeters) {
    if (!Double.isFinite(distanceMeters)
        || distanceMeters < minimumMeters || distanceMeters > maximumMeters) {
      return OptionalDouble.empty();
    }
    return OptionalDouble.of(table.get(distanceMeters));
  }
}
