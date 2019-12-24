package frc.robot;

import edu.wpi.first.wpilibj.TimedRobot;
import edu.wpi.first.wpilibj.command.Scheduler;

import frc.robot.subsystems.Intake;

public class Robot extends TimedRobot {
  
    public static OI oi;
    public static Intake intake;

    @Override
    public void robotInit() {
        oi = OI.getInstance();

        intake = new Intake();
    }

    @Override
    public void autonomousInit() {

    }

    @Override
    public void autonomousPeriodic() {
        Scheduler.getInstance().run();
        updateSubsystems();
    }

    @Override
    public void teleopInit() {

    }

    @Override
    public void teleopPeriodic() {
        Scheduler.getInstance().run();
        updateSubsystems();
    }

    @Override
    public void testPeriodic() {
        Scheduler.getInstance().run();
        getConstantTuning();
    }

    private void updateSubsystems() {
        intake.update();
    }

    private void getConstantTuning() {

    }
}
