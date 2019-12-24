package frc.robot;

import frc.robot.util.SnailController;
import frc.robot.commands.intake.*;

public class OI {

    private static OI instance = null;

    private SnailController driveController;
    private SnailController operatorController;

    private OI() {
        driveController = new SnailController(0);
        operatorController = new SnailController(1);

        operatorController.bButton.whileHeld(new IntakeCargoCommand());
        operatorController.aButton.whileHeld(new EjectCargoCommand());
    }

    public static OI getInstance() {
        if (instance == null) {
            instance = new OI();
        }
        return instance;
    }
}
