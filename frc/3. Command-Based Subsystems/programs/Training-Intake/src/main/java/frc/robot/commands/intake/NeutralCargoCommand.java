package frc.robot.commands.intake;

import edu.wpi.first.wpilibj.command.Command;

import frc.robot.Robot;
import frc.robot.subsystems.Intake;

public class NeutralCargoCommand extends Command {

    private Intake intake;

    public NeutralCargoCommand() {
        intake = Robot.intake;

        requires(intake);
    }

    @Override
    public void initialize() {

    }

    @Override
    public void execute() {
        intake.neutral();
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
