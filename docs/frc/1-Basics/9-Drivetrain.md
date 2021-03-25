# Drivetrain

## Overview

The drivetrain is probably the most important subsystem of the robot, as movement isn't possible without one. The team builds a drivetrain every year, and therefore it is crucial that we know how to program one.

A drivetrain is defined as "the group of components that deliver power to the driving wheels." When looking at robots, it consists of essentially everything to do with the driving wheels. Once again, when we program the drivetrain, we are basically making the robot move.

![Drivetrain](img/drivetrain.png ':size=400x300')

[Source](https://www.simbotics.org/wp-content/uploads/2019/12/simbotseminarseries-drivetraindesign.pdf)

On 1257, we almost always use a normal kitbot 6 wheel tank drive, similar to the one pictured above. On this type of drivetrain, the wheels are fixed and therefore cannot be rotated clockwise nor counterclockwise (unlike a car, where the front wheels can rotate to turn). While this may seem restrictive to movement, it is much easier to both build and program.

## Subsystem File

### Declarations

While we have 6 wheels on each side, the 3 wheels are all connected to each other and must run in the same direction (which makes sense or else we would have wheels running in opposite directions). While we could just use one motor on both side of our robot, we actually use two per side (one labelled **front** and the other labelled **back**) to add extra power to our drivetrain. To begin our subsystem file, we might declare these motors as `frontLeftMotor`, `frontRightMotor`, `backLeftMotor`, and `backRightMotor`:

With this tank drive design, going backwards and forwards is very easy: we simply set all the motors to full speed forwards or backwards. However, turning gets a bit more complicated. Instead, we have to spin the two sides of the drivetrain in opposite directions. For instance, to turn right, we would have to spin the right wheels backwards and the left wheels forwards. This would do a rotation about the center of our robot.

The above doesn't seem that bad to program until we get to the fact that driving forward and turning simultaneously can be a bit challenging. While the code isn't *that* bad to write from scratch, our implementation can be buggy at first and be pretty tedious to polish.

Luckily, WPILib makes this much easier for us by introducing a class called `DifferentialDrive`. What this class does is introduce a way to control our motors for us and do the math to turn what we want into the individual motor outputs. Turning while driving (not turning in place) is essentially using mismatched speeds with respect to the two sides.

We can pass in values (i.e. inputs from the controller's joysticks) into a `DifferentialDrive` object in order to tell the robot to drive forward at full speed while turning right at half speed.

Then, `DifferentialDrive` will take in these commands, do the math, and then update the motors accordingly to make the robot perform this action.

> [!NOTE]
> Click [here](https://github.com/wpilibsuite/allwpilib/blob/master/wpilibj/src/main/java/edu/wpi/first/wpilibj/drive/DifferentialDrive.java) for `DifferentialDrive`'s source code.

This is what we have so far in our file, with all the appropriate import statements:

```java
package frc.robot.subsystems;

import com.revrobotics.CANSparkMax;

import edu.wpi.first.wpilibj.drive.DifferentialDrive;

public class Drivetrain extends SnailSubsystem {

    private final CANSparkMax frontLeftMotor;
    private final CANSparkMax frontRightMotor;
    private final CANSparkMax backLeftMotor;
    private final CANSparkMax backRightMotor;

    private final DifferentialDrive drivetrain;

    ...
}
```

### States

Just like we did for all the previous subsystems, we now need to determine our drivetrain's states. For now, we will only focus on the `MANUAL` state, and will leave more advanced drivetrain states for future sections.

We'll declare our state(s) in the form of an [enum:](https://frc1257.github.io/robotics-training/#/java/2-Control_Flow/7-Enums). We also have a variable to hold the state of the subsystem.

```java
    public enum State {
        MANUAL
    }
    
    private State state;
```

As mentioned before, we will need to pass in values into `DifferentialDrive` to command drivetrain movement. We can declare the speed variables as such:

```java
    private double speedForward;
    private double speedTurn;
```

The state we introduced above can be considered the "operating mode" or "configuration" the subsystem is in. For our purposes here, that would be manual control, where the driver directly controls the motor speeds. You can think of the `speedForward` and `speedTurn` variables as an extra part or extension of the state that we are keeping track of, as they represent more information *about* the state and current operating behavior.

### Constructor

```java
    public Drivetrain() {
        frontLeftMotor = new CANSparkMax(DRIVE_FRONT_LEFT, MotorType.kBrushless);
        frontRightMotor = new CANSparkMax(DRIVE_FRONT_RIGHT, MotorType.kBrushless);
        backLeftMotor = new CANSparkMax(DRIVE_BACK_LEFT, MotorType.kBrushless);
        backRightMotor = new CANSparkMax(DRIVE_BACK_RIGHT, MotorType.kBrushless);

        backLeftMotor.follow(frontLeftMotor);
        backRightMotor.follow(frontRightMotor);

        frontLeftMotor.restoreFactoryDefaults();
        frontRightMotor.restoreFactoryDefaults();
        backLeftMotor.restoreFactoryDefaults();
        backRightMotor.restoreFactoryDefaults();

        frontLeftMotor.setSmartCurrentLimit(NEO_CURRENT_LIMIT);
        frontRightMotor.setSmartCurrentLimit(NEO_CURRENT_LIMIT);
        backLeftMotor.setSmartCurrentLimit(NEO_CURRENT_LIMIT);
        backRightMotor.setSmartCurrentLimit(NEO_CURRENT_LIMIT);

        frontLeftMotor.setIdleMode(IdleMode.kBrake);
        frontRightMotor.setIdleMode(IdleMode.kBrake);
        backLeftMotor.setIdleMode(IdleMode.kCoast);
        backRightMotor.setIdleMode(IdleMode.kCoast);

        drivetrain = new DifferentialDrive(frontLeftMotor, frontRightMotor);

        state = State.MANUAL;
        speedForward = 0;
        speedTurn = 0;
    }
```

In the constructor, we'll take all our declarations and initialize them. Most of the work here is done for the motors:

1. Initialize each motor with respective ID variables, and set the brushed/brushless mode with `MotorType.kBrushless`.
2. Use `restoreFactoryDefaults()` to reset any of the motors' internal settings.
3. Use `setSmartCurrentLimit()` to apply the appropriate current limit value (for NEOs, we generally do 80 amps)
4. Set the front two motors to brake mode and back two motors to coast mode with `setIdleMode()`.
5. Initialize the `DifferentialDrive` object by passing in the two front motors (front left and then front right), and then set driving speeds to 0.

> [!NOTE]
> We add the combination of front motors set to brake mode and back motors set to coast mode because it allows for improved driving conditions. If all four motors were set to brake mode, there would be very rapid deceleration, i.e. too much tipping and jerky movement. But, if all motors were set to coast mode, there would be essentially no rapid deceleration, which would make sharp movements very difficult. Having this combination helps us find a nice middle ground for driving.

### update()

The `update()` function is where we actually look at the subsystem's state and act accordingly. For this drivetrain example, it'll look like this:

```java
@Override
public void update() {
    switch (state) {
        case MANUAL:
            drivetrain.arcadeDrive(speedForward, speedTurn);
            break;
    }
}
```
When the drivetrain state is `MANUAL`, we use `DifferentialDrive`'s `arcadeDrive()` (see above for source code file) to command our drivetrain's movement by passing in the inputted forward and turn speeds.

### Other Functions

```java
    @Override
    public void displayShuffleboard() {
    
    }

    @Override
    public void tuningInit() {
        
    }

    @Override
    public void tuningPeriodic() {

    }
```
These are functions used mainly setup for robot testing/diagnostics. We will discuss these further in the next few sections.

As of right now, we have declared and initialized everything, and added the `update()` function that commands the drivetrain's motors based off the current state. However, we have no way of actually changing the state or `speedForward` and `speedTurn` variables yet. We can create a function to address these issues, and might call it `manualDrive()`:

```java
    public void manualDrive(double speedForward, double speedTurn) {
        this.speedForward = speedForward;
        this.speedTurn = speedTurn;

        state = defaultState;
    }
```
With this, we can modify the driving speeds using passed-in values, and then change the state to the default state (manual control).

With all this done, we're now ready to move onto our first drivetrain command!

## Command File

Because the only state we are dealing with is the `MANUAL` state, we'll create a command called `ManualDriveCommand`.

### Declarations

```java 
package frc.robot.commands.drivetrain;

import edu.wpi.first.wpilibj2.command.CommandBase;
import frc.robot.subsystems.Drivetrain;

import java.util.function.DoubleSupplier;

public class ManualDriveCommand extends CommandBase {

    private final Drivetrain drivetrain;
    private final DoubleSupplier forwardSupplier;
    private final DoubleSupplier turnSupplier;

    ...
}
```

These are the basic declarations we'll need for this command to work. Just like in the previous examples, we use `DoubleSupplier`s to later store controller joystick inputs, instead of using `double`s.

### Constructor

```java
    public ManualDriveCommand(Drivetrain drivetrain, DoubleSupplier forwardSupplier, DoubleSupplier turnSupplier) {
        this.drivetrain = drivetrain;
        this.forwardSupplier = forwardSupplier;
        this.turnSupplier = turnSupplier;

        addRequirements(drivetrain);
    }
```

Just like before, we initialize the subsystem object and suppliers with the passed in references. The functions passed in for the suppliers will be functions returning the respective joystick values. Finally, we call `addRequirements()` so that the command-based program architecture will know what subsystem is needed for this command.

### Functions

```java
    @Override
    public void initialize() {

    }

    @Override
    public void execute() {
        drivetrain.manualDrive(forwardSupplier.getAsDouble(), turnSupplier.getAsDouble());
    }
```
We don't need to run anything in `initialize()`, so that is left blank. The main focus is in `execute()`, where we finally reference the outer method `manualDrive()` and pass in the `DoubleSupplier`s as speeds. Using `getAsDouble()` evaluates the controller function and passes in the value to `manualDrive()`.

```java
    @Override
    public void end(boolean interrupted) {

    }

    @Override
    public boolean isFinished() {
        return false;
    }
```

In `end()`, we don't need to specify anything since we don't require any actions to happen when the command ends. However, we return false in `isFinished()` to prevent the command from ending prematurely--instead, it will only end when the command is cancelled/when there is no controller input.

## RobotContainer

The final part of this process is to link the command to the subsystem and bind it to a controller.

```java
package frc.robot;

import edu.wpi.first.wpilibj.Notifier;
import edu.wpi.first.wpilibj2.command.Command;
import frc.robot.commands.drivetrain.ManualDriveCommand;
import frc.robot.subsystems.Drivetrain;
import frc.robot.subsystems.SnailSubsystem;
import frc.robot.util.SnailController;

import java.util.ArrayList;

import static frc.robot.Constants.ElectricalLayout.CONTROLLER_DRIVER_ID;
import static frc.robot.Constants.ElectricalLayout.CONTROLLER_OPERATOR_ID;
import static frc.robot.Constants.UPDATE_PERIOD;;

public class RobotContainer {

    private SnailController driveController;
    private SnailController operatorController;
    
    private ArrayList<SnailSubsystem> subsystems;
    private final Drivetrain drivetrain;

    ...
```

Since most of the needed declarations for `RobotContainer` are pre-generated by our robot template, the only line we need to add is `private final Drivetrain drivetrain` to instantiate the subsystem.

### Constructor

The next step is to set up our subsystem and add a default command:

```java
    private void configureSubsystems() {
        drivetrain = new Drivetrain();
        drivetrain.setDefaultCommand(new ManualDriveCommand(drivetrain, driveController::getDriveForward,  
            driveController::getDriveTurn));

        subsystems = new ArrayList<>();
        subsystems.add(drivetrain);
    }
```

We use `setDefaultCommand()` to pass in the `ManualDriveCommand` we wrote above. Note how in the manual command, after we pass in the `Drivetrain` object, we use `driveController::getDriveForward` and `driveController::getDriveTurn` to be passed in for the `DoubleSupplier`s. Using Java's `::` operator allows to pass in the function itself and not a result of evaluating that function. 

`getDriveForward()` and `getDriveTurn()` are functions that are already defined in the Xbox controller object for your use. In the next section, we're going to quickly go over exactly how these functions work since we use a bit of a special drive scheme at 1257 that requires a bit of explanation.

Once again, when `execute()` is run in `ManualDriveCommand`, the command will receive *constantly-updated* controller input values for the drivetrain instead of the result of evaluating the controller's functions once.

Also, `configureButtonBindings()` is left empty here since we only have one source of functionality, which falls under the default command. If we added more button bindings, then we'd have to add to this function.

### Drive Controller Functions

When passing our forward and turning values to `ManualDriveCommand`, we made use of the functions `getDriveForward()` and `getDriveTurn()`. However, these aren't just functions that return joystick values. In fact, if you take a look into the code inside of `SnailController.java` you will see that it actually is a bit more involved than that.

Instead, those functions are used for safety and to facilitate 1257's multiple drive schemes. The first idea is that we only want to enable driving if a certain is pressed on our controller. This is because if something goes wrong such as the controller being wonky or someone dropping the controller, the drivetrain has a **very small risk** of having both the safety key and the joystick being moved at the same time.

Another purpose of these functions is to facilitate different drivers who have very different preferences for how they would like to drive, and for ease of facilitating as many people as possible, we have chosen to program three different drive schemes that correspond to three different safety keys. They are described below:

* A button is held: Forward = Left Stick Y Axis, Turn = Left Stick X Axis
* Left bumper is held: Forward = Left Stick Y Axis, Turn = Right Stick X Axis
* Right bumper is held: Forward = Right Stick Y Axis, Turn = Left Stick X Axis

## Conclusion

With that, we're finished! Click [here](https://github.com/FRC1257/training-programs/tree/master/basics/drivetrain) for a link to the full code.

In the next section, you will learn how to add a bit more functionality to the basic subsystems we have programmed so far with things like toggling precision / reversed mode.
