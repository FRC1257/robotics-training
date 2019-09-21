package frc.robot.commands.intake;

import edu.wpi.first.wpilibj.command.Command;

import frc.robot.Robot;
import frc.robot.subsystems.Intake;

public class IntakeCargoCommand extends Command {

    private Intake intake;

    public IntakeCargoCommand() {
        intake = Robot.intake;

        requires(intake);
    }

    @Override
    public void initialize() {

    }

    @Override
    public void execute() {
        intake.intake();
    }

    @Override
    public boolean isFinished() {
        return false;
    }

    @Override
    public void end() {
        
    }

    @Override
    public void interrupted() {
        end();
    }
}
