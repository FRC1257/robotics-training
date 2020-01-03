package frc.robot;

import static frc.robot.Constants.*; // import the Constants class so we can use the variables in it easily

import edu.wpi.first.wpilibj.XboxController;
import edu.wpi.first.wpilibj.XboxController.Button;
import edu.wpi.first.wpilibj2.command.button.JoystickButton;
import frc.robot.commands.arm.ManualCommand;
import frc.robot.subsystems.Arm;

/**
 * This class is where the bulk of the robot should be declared.  Since Command-based is a
 * "declarative" paradigm, very little robot logic should actually be handled in the Robot
 * periodic methods (other than the scheduler calls).  Instead, the structure of the robot
 * (including subsystems, commands, and button mappings) should be declared here.
 */
public class RobotContainer {

    private final Arm arm;

    private final XboxController controller;

    /**
     * The container for the robot.  Contains subsystems, OI devices, and commands.
     */
    public RobotContainer() {
        controller = new XboxController(CONTROLLER_ID);

        arm = new Arm();
        arm.setDefaultCommand(new ManualCommand(arm, controller));
        
        configureButtonBindings();
    }

    /**
     * Use this method to define your button -> command mappings.
     */
    private void configureButtonBindings() {
        
    }
}
