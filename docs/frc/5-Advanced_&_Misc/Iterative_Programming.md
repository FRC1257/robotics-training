# Iterative Programming

There *are* alternatives to programming robots in the command-based paradigm. Teams might add custom controls and build their own custom versions of command-based: Team 971 (Spartan Robotics) and Team 254 (The Cheesy Poofs) are prime examples.

Another substitute is the `iterative` program structure. It's relatively simpler than command-based, and has a few differences that should be noted.

## Structure Overview

In an interative program, we'll have three main folders in the src/main/java/frc path:

- **/ (root directory)** - contains the all classes directly related to the robot, e.g. `Robot.java`, `Main.java`
- **/subsystems** - all subsystem classes go here, e.g. `Drivetrain.java`, `Intake.java`
- **/util** - any utility/helper classes, e.g. `SnailController.java`, `Gyro.java`, `Constants.java`

Inside of `Robot.java` are two types of general functions the robot executes: `init()` functions, which run at *the beginning of* specific times, and `periodic()` functions, which run *during* specific times. The `init()` functions are as follows:

- `robotInit()` - run once, after the robot is finished powering on
- `autonomousInit()` - run once at the start of auto
- `teleopInit()` - run once at the start of teleop

and the `periodic()` ones, which run at 50 Hz, or every 20 ms:

- `robotPeriodic()` - run if the robot is on
- `autonomousPeriodic()` - run periodically during auto
- `teleopPeriodic()` - run periodically during teleop

There are two more functions we use, `testInit()` and `testPeriodic()`. While these are not directly tied to the structure of the match, they are useful when things need to be separated during robot testing. The testing period would be controlled through the [Driver Station](https://docs.wpilib.org/en/latest/docs/software/driverstation/driver-station.html).

Here is a brief order of the states the robot goes through when the match begins:

1. Robot is turned on and the roboRIO boots.
2. The roboRIO finishes booting and user code (i.e. our robot code) is run.
3. Our robot code starts, first running `robotInit()`.
4. Our robot repeats `robotPeriodic()` for the remainder of the time the robot is powered on.
5. When the match begins, the `autonomousInit()` function is called, followed by `autonomousPeriodic()` until the end of autonomous.
6. When autonomous is over, and the field has confirmed that all robots have been disabled, we are transitioned into `teleopInit()`.
7. If `teleopInit()` has exited with no issue, we're moved into `teleopPeriodic()` for the remainder of the match.

There are no commands or `RobotContainer` with iterative. Instead, we execute all of our code in the `init()` and `periodic()` functions.

## Programming

We won't dive too deep into an iterative example program, but you can see an example of one from our 2019 robot. We'll really only be focusing on command-based and shouldn't be moving back to iterative. It's just good to know that iterative *does* exist. If you want to explore more, see 1257's [2019 code](https://github.com/FRC1257/2019-Robot).

One note to take is that using iterative programming for a robot makes working in autonomous immensely more difficult. All the features and convenience that comes with command-based is thrown away, and you're essentially back to square one with autonomous routines.

## Application

While command-based is definitely our go-to structure for main robot programming, times come where the team may need to quickly test hardware. The fastest way to prepare would be to write test code on the spot in iterative.

For instance, we might need to quickly test a two-motor module. We would go through the same process of declaring and using motors and an Xbox controller outlined back in the [Basics](https://frc1257.github.io/robotics-training/#/frc/1-Basics/README) section. However, we can declare our necessities directly in `Robot.java`, and then act accordingly in `teleopPeriodic()`, as shown here:

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
