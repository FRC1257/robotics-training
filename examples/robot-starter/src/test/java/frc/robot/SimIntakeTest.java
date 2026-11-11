package frc.robot;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
class SimIntakeTest {
 @Test void clampsAndStops() {
  SimIntake intake = new SimIntake();
  intake.setSpeed(2); assertEquals(1.0, intake.getSpeed());
  intake.setSpeed(0); assertEquals(0.0, intake.getSpeed());
 }
}
