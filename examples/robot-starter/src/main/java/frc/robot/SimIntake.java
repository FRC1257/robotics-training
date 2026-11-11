package frc.robot;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.SubsystemBase;
/** Bounded simulated output, without motor physics. */
public class SimIntake extends SubsystemBase {
 private double speed;
 public void setSpeed(double requested) { speed = Math.max(-1, Math.min(1, requested)); }
 public double getSpeed() { return speed; }
 @Override public void periodic() { SmartDashboard.putNumber("Intake output", speed); }
}
