package frc.robot.subsystems;

import static frc.robot.Constants.*;

import com.ctre.phoenix.motorcontrol.can.WPI_VictorSPX;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class Intake extends SubsystemBase {
  
    private WPI_VictorSPX intakeMotor;

    public enum State {
        NEUTRAL,
        INTAKING,
        EJECTING
    }
    private State state = State.EJECTING;

    public Intake() {
        intakeMotor = new WPI_VictorSPX(INTAKE_MOTOR_ID);
    }

    @Override
    public void periodic() {
        switch(state) {
            case NEUTRAL:
                intakeMotor.set(0);
            break;
            case INTAKING:
                intakeMotor.set(-1.0);
            break;
            case EJECTING:
                intakeMotor.set(1.0);
            break;
        }
    }

    public void neutral() {
        state = State.NEUTRAL;
    }

    public void intake() {
        state = State.INTAKING;
    }

    public void eject() {
        state = State.EJECTING;
    }
}
