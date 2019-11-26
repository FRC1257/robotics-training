import edu.wpi.first.wpilibj.*;
import edu.wpi.first.wpilibj.drive.*;
import com.ctre.phoenix.motorcontrol.can.WPI_TalonSRX;

public class Robot extends TimedRobot {

	// Just Declaring Motors
	WPI_TalonSRX frontRight;
	WPI_TalonSRX frontLeft;
	WPI_TalonSRX backRight;
	WPI_TalonSRX backLeft;
	WPI_TalonSRX linkage;
	WPI_TalonSRX elevator;
	WPI_TalonSRX elevator2;

	SpeedControllerGroup right;
	SpeedControllerGroup left;
	DifferentialDrive drivetrain;
	XboxController driveController;
	XboxController operatorController;

	@Override
	public void robotInit() { 
		frontLeft = new WPI_TalonSRX(0);
		frontRight = new WPI_TalonSRX(1);
		backRight = new WPI_TalonSRX(3);
		backLeft = new WPI_TalonSRX(2);
		linkage = new WPI_TalonSRX(4);
		elevator = new WPI_TalonSRX(5);
		elevator2 = new WPI_TalonSRX(6);

		right = new SpeedControllerGroup(frontRight, backRight);
		left = new SpeedControllerGroup(frontLeft, backLeft);

		drivetrain = new DifferentialDrive(left, right);

		driveController = new XboxController(0);
		operatorController = new XboxController(1);

	}
	@Override
	public void teleopInit() {

	}

	@Override
	public void teleopPeriodic() {
		elevator.set((-operatorController.getTriggerAxis(GenericHID.Hand.kLeft))+(operatorController.getTriggerAxis(GenericHID.Hand.kLeft)));
		elevator2.set((-operatorController.getTriggerAxis(GenericHID.Hand.kLeft))+(operatorController.getTriggerAxis(GenericHID.Hand.kLeft)));
		linkage.set(operatorController.getY(GenericHID.Hand.kLeft)/2);

		if (driveController.getAButton()) {
			double y = driveController.getY(GenericHID.Hand.kLeft);
			double x = driveController.getX(GenericHID.Hand.kLeft);
			drivetrain.arcadeDrive(-y, x);
		} else if (driveController.getBumper(GenericHID.Hand.kLeft)) {
			double y = driveController.getY(GenericHID.Hand.kLeft);
			double x = driveController.getX(GenericHID.Hand.kRight);
			drivetrain.arcadeDrive(-y, x);
		} else if (driveController.getBumper(GenericHID.Hand.kRight)) {
			double y = driveController.getY(GenericHID.Hand.kRight);
			double x = driveController.getX(GenericHID.Hand.kLeft);
			drivetrain.arcadeDrive(-y, x);
		} else {
			// intentionally empty
		}

	}

	@Override
	public void testPeriodic() {

	}
}
