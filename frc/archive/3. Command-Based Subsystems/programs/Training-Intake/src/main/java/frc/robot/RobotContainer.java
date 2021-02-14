package frc.robot;

import static frc.robot.Constants.*; // import the Constants class so we can use the variables in it easily

import edu.wpi.first.wpilibj.XboxController;
import edu.wpi.first.wpilibj.XboxController.Button;
import edu.wpi.first.wpilibj2.command.button.JoystickButton;
import frc.robot.commands.intake.EjectCommand;
import frc.robot.commands.intake.IntakeCommand;
import frc.robot.commands.intake.NeutralCommand;
import frc.robot.subsystems.Intake;

/**
 * This class is where the bulk of the robot should be declared.  Since Command-based is a
 * "declarative" paradigm, very little robot logic should actually be handled in the Robot
 * periodic methods (other than the scheduler calls).  Instead, the structure of the robot
 * (including subsystems, commands, and button mappings) should be declared here.
 */
public class RobotContainer {

    private final Intake intake;

    private final XboxController controller;

    /**
     * The container for the robot.  Contains subsystems, OI devices, and commands.
     */
    public RobotContainer() {
        intake = new Intake();
        intake.setDefaultCommand(new NeutralCommand(intake));

        controller = new XboxController(CONTROLLER_ID);
        
        configureButtonBindings();
    }

    /**
     * Use this method to define your button -> command mappings.
     */
    private void configureButtonBindings() {
        (new JoystickButton(controller, Button.kA.value)).whenPressed(new EjectCommand(intake));
        (new JoystickButton(controller, Button.kB.value)).whenPressed(new IntakeCommand(intake));
    }
}
