package frc.robot;
import edu.wpi.first.wpilibj.TimedRobot;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.CommandScheduler;
import edu.wpi.first.wpilibj2.command.Commands;
/** Simulation only: no hardware allocation. */
public class Robot extends TimedRobot {
 private final SimIntake intake = new SimIntake();
 @Override public void robotInit() {
  SmartDashboard.putData("Run intake for 2 seconds",
      Commands.runEnd(() -> intake.setSpeed(0.5), () -> intake.setSpeed(0), intake).withTimeout(2));
 }
 @Override public void robotPeriodic() { CommandScheduler.getInstance().run(); }
 @Override public void disabledInit() { CommandScheduler.getInstance().cancelAll(); intake.setSpeed(0); }
}
