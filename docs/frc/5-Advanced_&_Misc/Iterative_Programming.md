# Iterative Programming

There *are* alternatives to programming robots in the command-based paradigm. Teams might add custom controls and build upon command-based: Team 971 (Spartan Robotics) and Team 254 (The Cheesy Poofs) are prime examples. 

Another substitute is the `iterative` program structure. It's relatively simpler than command-based, and has a few differences that should be noted. 

For now, try to pretend that you *don't* know about command-based; have an open mind, and this should come pretty easily.

## Structure Overview

In an interative program, we'll have three main folders in the src/main/java/frc path:

- **/robot** - contains the all classes directly related to the robot, e.g. `Robot.java`, `Main.java`, and `Constants.java`
- **/subsystems** - all subsystem classes go here, e.g. `Drivetrain.java`, `Intake.java`
- **/util** - any utility/helper classes, e.g. `SnailController.java`, `Gyro.java`

Once again, the structure is pretty similar to that of command-based. Obviously, there are no `commands` in iterative. This is because **instead of using commands to interface with a robot, all functionality is written directly in the subsystem,** as methods that directly manipulate the subsystem's actuators. These methods are then referenced in `Robot.java`.

For our purposes, we won't dive too deep into an iterative example program, as we'll really only be focusing on command-based and shouldn't be moving back to iterative. It's just good to know that iterative *does* exist. If you want to explore more, see 1257's [2019 code](https://github.com/FRC1257/2019-Robot).

One note to take is that using iterative programming for a robot makes working in autonomous immensely more difficult. All the features and convenience that comes with command-based is thrown away, and you're essentially back to square one with autonomous routines. 

## Application

Iterative still has its place for us as programmers. While command-based is definitely our go-to structure for main robot programming, times come where the team may need to quickly test hardware. The fastest way to prepare would be to write test code on the spot in iterative. 

For instance, we might need to quickly test a two-motor module. We would go through the same process outlined back in the [Basics](https://github.com/FRC1257/robotics-training/tree/master/frc/1.%20Basics) of declaring and using motors and an Xbox controller. However, we can declare our necessities directly in `Robot.java`, and then act accordingly in `teleopPeriodic()`, as shown here:

```java
package frc.robot;

... 

public class Robot extends TimedRobot {

    CANSparkMax motor1;
    CANSparkMax motor2;

    XboxController controller;

    public Robot() {
        motor1 = new CANSparkMax(1, MotorType.kBrushless);
        motor2 = new CANSparkMax(2, MotorType.kBrushless);

        motor1.setSmartCurrentLimit(80);
        motor2.setSmartCurrentLimit(80);

        motor2.follow(motor1);

        controller = new XboxController(0);
    }

    @Override
    public void robotInit() {

    }

    @Override 
    public void teleopPeriodic() {
        if (controller.getAButton()) {
            motor1.set(1.0);
        } 
        else if (controller.getBButton()) {
            motor1.set(-1.0);
        } 
        else {
            motor1.set(0.0);
        }
    }

}
```
