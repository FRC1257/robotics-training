package frc.robot;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import edu.wpi.first.math.interpolation.InterpolatingDoubleTreeMap;
import java.util.ArrayList;
import org.junit.jupiter.api.Test;

class ArchitectureLessonsTest {
  @Test
  void simulationSamplesThenComputesNextOutput() {
    var observed = new ArrayList<RollerIOTraining.Inputs>();
    var system = new RollerIOTraining(new RollerIOTraining.RollerIOSim(), observed::add);
    var first = system.periodic(100);
    assertEquals(0.0, first.velocityRadPerSec(), 1e-10);
    assertEquals(0.0, first.appliedVolts(), 1e-10);

    var second = system.periodic(100);
    assertEquals(10.0, second.appliedVolts(), 1e-10);
    assertEquals(100 * (1 - Math.exp(-0.1)), second.velocityRadPerSec(), 1e-10);
    assertEquals(second, observed.get(1));
  }

  @Test
  void simulationIsRepeatableBoundedAndRejectsInvalidVoltage() {
    var a = new RollerIOTraining.RollerIOSim();
    var b = new RollerIOTraining.RollerIOSim();
    a.setVoltage(100);
    b.setVoltage(12);
    for (int i = 0; i < 50; i++) {
      assertEquals(a.updateInputs(), b.updateInputs());
    }
    assertEquals(12, a.updateInputs().appliedVolts(), 1e-10);
    assertThrows(IllegalArgumentException.class, () -> a.setVoltage(Double.NaN));
  }

  @Test
  void calibrationInterpolatesAndRejectsUnmeasuredRange() {
    var table = new CalibrationTable(new double[] {1, 3}, new double[] {100, 200});
    assertEquals(100, table.lookup(1).orElseThrow(), 1e-10);
    assertEquals(150, table.lookup(2).orElseThrow(), 1e-10);
    assertEquals(200, table.lookup(3).orElseThrow(), 1e-10);
    assertTrue(table.lookup(0.99).isEmpty());
    assertTrue(table.lookup(3.01).isEmpty());
    assertTrue(table.lookup(Double.NaN).isEmpty());
  }

  @Test
  void rejectsInvalidOrDuplicateCalibrationSamples() {
    assertThrows(IllegalArgumentException.class,
        () -> new CalibrationTable(new double[] {1, 1}, new double[] {1, 2}));
    assertThrows(IllegalArgumentException.class,
        () -> new CalibrationTable(new double[] {1, 2}, new double[] {1, Double.NaN}));
    assertThrows(IllegalArgumentException.class,
        () -> new CalibrationTable(new double[] {1}, new double[] {1}));
  }

  @Test
  void wpilibTreeMapClampsAndReplacesDuplicates() {
    var map = new InterpolatingDoubleTreeMap();
    assertNull(map.get(0.0));
    map.put(1.0, 100.0);
    map.put(3.0, 200.0);
    map.put(1.0, 110.0);
    assertEquals(110.0, map.get(-5.0), 1e-10);
    assertEquals(200.0, map.get(9.0), 1e-10);
    assertEquals(155.0, map.get(2.0), 1e-10);
  }
}
