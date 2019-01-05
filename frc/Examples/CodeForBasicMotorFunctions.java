import edu.wpi.first.wpilibj.*;
import edu.wpi.first.wpilibj.drive.*;
import com.ctre.phoenix.motorcontrol.can.WPI_TalonSRX;
public class Robot extends IterativeRobot {
    // Just Declaring Motors
  WPI_TalonSRX FrontRight;
  WPI_TalonSRX FrontLeft;
  WPI_TalonSRX BackRight;
  WPI_TalonSRX BackLeft;
  WPI_TalonSRX Linkage;
  WPI_TalonSRX Elevator;
  WPI_TalonSRX Elevator2;


  SpeedControllerGroup Right;
  SpeedControllerGroup Left;
  DifferentialDrive DriveTrain;
  XboxController ControllerDrive;
  XboxController ControllerOther;

  @Override
  public void robotInit() { FrontRight = new WPI_TalonSRX(1);
    FrontLeft = new WPI_TalonSRX(0);
    BackRight = new WPI_TalonSRX(3);
    BackLeft = new WPI_TalonSRX(2);
    Linkage = new WPI_TalonSRX(4);
    Elevator = new WPI_TalonSRX(5);
    Elevator2 = new WPI_TalonSRX(6);

    Right = new SpeedControllerGroup(FrontRight, BackRight);
    Left = new SpeedControllerGroup(FrontLeft, BackLeft);

    DriveTrain = new DifferentialDrive(Left, Right);

    ControllerDrive = new XboxController(0);
    ControllerOther = new XboxController(1);
  }


  @Override
  public void teleopInit() {
  }


  @Override
  public void teleopPeriodic() {
    Elevator.set((-ControllerOther.getTriggerAxis(GenericHID.Hand.kLeft))+(ControllerOther.getTriggerAxis(GenericHID.Hand.kLeft)));
    Elevator2.set((-ControllerOther.getTriggerAxis(GenericHID.Hand.kLeft))+(ControllerOther.getTriggerAxis(GenericHID.Hand.kLeft)));
    Linkage.set(ControllerOther.getY(GenericHID.Hand.kLeft)/2);


    if(ControllerDrive.getAButton()) {
      double y = ControllerDrive.getY(GenericHID.Hand.kLeft);
      double x = ControllerDrive.getX(GenericHID.Hand.kLeft);
      DriveTrain.arcadeDrive(-y, x);
  } else if(ControllerDrive.getBumper(GenericHID.Hand.kLeft)) {
      double y = ControllerDrive.getY(GenericHID.Hand.kLeft);
      double x = ControllerDrive.getX(GenericHID.Hand.kRight);
      DriveTrain.arcadeDrive(-y, x);
  } else if(ControllerDrive.getBumper(GenericHID.Hand.kRight)) {
      double y = ControllerDrive.getY(GenericHID.Hand.kRight);
      double x = ControllerDrive.getX(GenericHID.Hand.kLeft);
      DriveTrain.arcadeDrive(-y, x);
  } else {
      // Nothing

  }

  }

  /**
   * This function is called periodically during test mode.
   */
  @Override
  public void testPeriodic() {
  }
}
