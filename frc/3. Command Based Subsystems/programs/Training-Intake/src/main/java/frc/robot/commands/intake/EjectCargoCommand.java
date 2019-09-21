package frc.robot.commands.intake;

import edu.wpi.first.wpilibj.command.Command;

import frc.robot.Robot;
import frc.robot.subsystems.Intake;

public class EjectCargoCommand extends Command {

    private Intake intake;

    public EjectCargoCommand() {
        intake = Robot.intake;

        requires(intake);
    }

    @Override
    public void initialize() {

    }

    @Override
    public void execute() {
        intake.eject();
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
