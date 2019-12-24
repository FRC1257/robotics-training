package frc.robot.util;

import edu.wpi.first.wpilibj.Joystick;
import edu.wpi.first.wpilibj.buttons.JoystickButton;
import edu.wpi.first.wpilibj.buttons.Trigger;

/**
 * Xbox controller for command based programming
 * Credit to FRC Team 319 for the original code
 * Modified by FRC Team 1257
 */

public class SnailController extends Joystick {

    public static final double CONTROLLER_DEADBAND = 0.08; // deadband for joysticks

    public JoystickButton aButton = new JoystickButton(this, 1);
    public JoystickButton bButton = new JoystickButton(this, 2);
    public JoystickButton xButton = new JoystickButton(this, 3);
    public JoystickButton yButton = new JoystickButton(this, 4);
    public JoystickButton leftBumper = new JoystickButton(this, 5);
    public JoystickButton rightBumper = new JoystickButton(this, 6);
    public JoystickButton selectButton = new JoystickButton(this, 7);
    public JoystickButton startButton = new JoystickButton(this, 8);
    public JoystickButton leftStickButton = new JoystickButton(this, 9);
    public JoystickButton rightStickButton = new JoystickButton(this, 10);
    public SnailControllerTrigger rightTrigger = new SnailControllerTrigger(this, true);
    public SnailControllerTrigger leftTrigger = new SnailControllerTrigger(this, false);

    public SnailController(int port) {
        super(port);
    }

    public double getLeftStickX() {
        return applyDeadband(getRawAxis(0));
    }
    public double getLeftStickY() {
        return applyDeadband(-getRawAxis(1));
    }
    public double getRightStickX() {
        return applyDeadband(getRawAxis(4));
    }
    public double getRightStickY() {
        return applyDeadband(-getRawAxis(5));
    }

    public double getLeftTrigger() {
        return applyDeadband(getRawAxis(2));
    }
    public double getRightTrigger() {
        return applyDeadband(-getRawAxis(3));
    }

    /*
     * Controls: If they press A, use single stick arcade with the left joystick
     *
     * If they press the left bumper, use the left joystick for forward and backward
     * motion and the right joystick for turning
     *
     * If they press the right bumper, use the right joystick for forward and
     * backward motion and the left joystick for turning
     */

    public double getForwardSpeed() {
        if (aButton.get())
            return getLeftStickY();
        else if (leftBumper.get())
            return getLeftStickY();
        else if (rightBumper.get())
            return getRightStickY();
        else
            return 0;
    }

    public double getTurnSpeed() {
        if (aButton.get())
            return getLeftStickX();
        else if (leftBumper.get())
            return getRightStickX();
        else if (rightBumper.get())
            return getLeftStickX();
        else
            return 0;
    }

    /**
     * Deadbands a number and returns the result
     * If |number| < deadband, then the function will return 0
     * Otherwise, it will return the number
     *
     * @param number the number to deadband
     *
     * @return deadbanded number
     */
    public static double applyDeadband(double number) {
        if (Math.abs(number) < CONTROLLER_DEADBAND) {
            return 0;
        }
        return number;
    }

    /**
     * Squares a number but retains the sign
     *
     * @param number the number to square
     *
     * @return squared number
     */
    public static double squareInput(double number) {
        // Use abs to prevent the sign from being cancelled out
        return Math.abs(number) * number;
    }

    /**
     * Xbox controller utility class for calling commands upon the trigger being pressed
     */

    class SnailControllerTrigger extends Trigger {

        private SnailController snailController;
        private boolean right;

        public SnailControllerTrigger(SnailController snailController, boolean right) {
            this.snailController = snailController;
            this.right = right;
        }

        @Override
        public boolean get() {
            if (right) {
                return snailController.getRightTrigger() > 0.5;
            }
            else {
                return snailController.getLeftTrigger() > 0.5;
            }
        }
    }
}
