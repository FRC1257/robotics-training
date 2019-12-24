package frc.robot.subsystems;

import edu.wpi.first.wpilibj.command.Subsystem;

import com.ctre.phoenix.motorcontrol.can.WPI_VictorSPX;

import frc.robot.commands.intake.NeutralCargoCommand;

public class Intake extends Subsystem {
    
    private WPI_VictorSPX intakeMotor;

    public enum State {
        NEUTRAL,
        INTAKING,
        EJECTING
    }
    private State state = State.EJECTING;

    public Intake() {
        intakeMotor = new WPI_VictorSPX(0);
    }

    @Override
    public void initDefaultCommand() {
        setDefaultCommand(new NeutralCargoCommand());
    }

    public void update() {
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
