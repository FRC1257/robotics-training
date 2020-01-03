package frc.robot.subsystems;

import static frc.robot.Constants.*;

import com.ctre.phoenix.motorcontrol.can.WPI_TalonSRX;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class Arm extends SubsystemBase {
  
    private WPI_TalonSRX armMotor;

    public enum State {
        MANUAL
    }

    // use two variables to keep track of the overall configuration:
    // - overall state
    // - set speed of the arm when it is in manual control
    private State state = State.MANUAL;
    private double armSpeed;

    public Arm() {
        armMotor = new WPI_TalonSRX(ARM_MOTOR_ID);
    }

    @Override
    public void periodic() {
        switch(state) {
            case MANUAL:
                armMotor.set(armSpeed);
            break;
        }

        // set the arm speed to 0 in case something goes wrong
        // every loop, this will be updated anyway
        armSpeed = 0;
    }
    
    public void setArmSpeed(double armSpeed) {
        this.armSpeed = armSpeed;
    }
}
