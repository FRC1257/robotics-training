# Elevator

You now know how to make three major subsystems that our team uses. In this lesson, it is time to learn a subsystem that works in a very similar way to the arm subsystem: the elevator.

## Overview

![Elevator CAD](img/elevatorExtended.jpeg ':size=392x389')

Pictured above is an elevator subsystem. Not every elevator looks like this, though almost all used by 1257 have followed the same general concept. There are pulleys set up that are spun using motors that raise the elevator up and down. In many designs, the motors both spin in the same direction though there are also quite a few where the spin in opposite directions because of the ways that the pulleys are set up.

When considering only manual control, elevators are actually very similar to arms in that they just use 1-2 motors that you can control with a joystick. Typically, elevators have heaver loads than arms so they will use 2 motors often while arms may be seen with only one motor. In this tutorial, we'll review how to program an elevator that uses two motors.

## Subsystem File

### Declaring Motor Controllers

```java
package frc.robot.subsystems;

import com.revrobotics.CANSparkMax;
import com.revrobotics.CANSparkMax.IdleMode;
import com.revrobotics.CANSparkMaxLowLevel.MotorType;

import static frc.robot.Constants.ElectricalLayout.*;
import static frc.robot.Constants.Elevator.*;
import static frc.robot.Constants.NEO_CURRENT_LIMIT;

public class Elevator extends SnailSubsystem {

    private CANSparkMax elevatorMotor;
    private CANSparkMax elevatorFollowerMotor;
```

After importing all of the required libraries, we declare the motor controllers needed for our subsystem. In this case, we have two motors that control the elevator's up and down motion. The reason we might want to use two motors is to add additional power to our elevator.

### States

```java
    public enum State {
        MANUAL
    }

    State state = State.MANUAL;
    private double speed = 0;
```

After declaring the motor controller, the states are declared. The Elevator subsystem is similar to the Arm subsystem in that not only does it have an `enum` to keep track of the state, but it also has a `speed` variable. You can think of the `enum` as the "mode" that the subsystem is in. This could be in manual control where the operator controls the speed set to the motor directly or position closed loop control. However, while we're in this "manual control" mode, we also need to keep track of what speed we should be going at, so you can think of it as an extra part of our state that we have to keep track of.

### Constructor

```java
public Elevator() {
    elevatorMotor = new CANSparkMax(ELEVATOR_PRIMARY_ID, MotorType.kBrushless);
    elevatorMotor.restoreFactoryDefaults();
    elevatorMotor.setIdleMode(IdleMode.kBrake);
    elevatorMotor.setSmartCurrentLimit(NEO_CURRENT_LIMIT);

    elevatorFollowerMotor = new CANSparkMax(ELEVATOR_FOLLOWER_ID, MotorType.kBrushless);
    elevatorFollowerMotor.restoreFactoryDefaults();
    elevatorFollowerMotor.setIdleMode(IdleMode.kBrake);
    elevatorFollowerMotor.setSmartCurrentLimit(NEO_CURRENT_LIMIT);
    elevatorFollowerMotor.follow(elevatorMotor, false); // following
}
```

Similar to the arm, the constructor is used to define the motor controller and set up parameters with it. Though one major difference is that there is a second motor that is also declared. We do the same configuration as before on both of the motors (restoring factory defaults, configuring brake mode, current limits).

The difference is the line `elevatorFollowerMotor.follow(elevatorMotor, false);` This sets up `elevatorFollowerMotor` as a follower of `elevatorMotor` meaning that it always mirrors the output of `elevatorMotor`. This is crucial because the purpose of the follower motor is to add more power to the system. To do so, the motors have to move exactly in sync and always receive the commands or else they will fight against each other.

To ensure that this always happens, we can just set up `elevatorFollowerMotor` as a follower and never have to worry about it again. We can just give our commands to `elevatorMotor` and have that handle everything.

The second parameter of the `follow()` function determines whether the motor is inverted with respect to the primary motor. If it is `false`, then the motors will be in exact sync (clockwise on one means clockwise on the other). On the other hand, if we set it to `true`, then they will go in opposite directions.

Whether a motor is inverted or not completely depends on the robot layout and the configuration is completely different for each robot made.

> [!TIP]
> We generally don't really worry about motor inversion when programming until we can actually see the mechanism and add in a few quick lines or do a bit of testing to see if the motors are moving in the desired direction. This is why it is essential when we are first testing the robot to move our mechanisms slowly and test one thing at a time in case we messed it up.

### Update Function

```java
@Override
public void update() {
    switch(state) {
        case MANUAL:
            elevatorMotor.set(speed);
            break;
    }
}
```

For our update function, we once again look at which state, or "mode", that we are in. Here, we only have one state, `MANUAL` for manual control. During this manual control state, we want to look at the current `speed` variable and set our motor's speed value to that.

The reason the speed is not set for the `elevatorFollowerMotor` is because it already follows what the `elevatorMotor` does so that line of code would be redundant.

### Shuffle Board Functions

```java
public void displayShuffleboard() {

}

public void tuningInit() {

}

public void tuningPeriodic() {

}
```

We will discuss how to write these functions in other sections.

### State Functions

```java
public void manualControl(double speed){
    this.speed = speed;
    state = State.MANUAL;
}

public State getState() {
    return state;
}
}
```

In this case, we have the `manualControl(double speed)` function to update the state of our elevator just like in the arm. When this function is called, it takes in a `speed` parameter that it then stores as part of the state. Additionally, it will set the state, or "operating mode," of the subsystem to `MANUAL`.

Just like in the arm subsystem, there is no function to set the state to one of the states. That is because the state is already set to `MANUAL` when `manualControl()` is called.

## Elevator Manual Command

Here we will briefly discuss how the `ElevatorManualCommand` works. If a more in-depth overview is needed about how `DoubleSupplier` works and why it is used, you may look at the [Arm](frc/1-Basics/7-Arm.md) file.

### Variable Declarations

```java
package frc.robot.commands.elevator;

import edu.wpi.first.wpilibj2.command.CommandBase;
import frc.robot.subsystems.Elevator;

import java.util.function.DoubleSupplier;

public class ElevatorManualCommand extends CommandBase {

    private final Elevator elevator;
    private final DoubleSupplier speedSupplier;
```

Just like in the arm, instead of storing a `double` called `speed`, we store a `DoubleSupplier`. A `DoubleSupplier` is an object that represents a function that returns a `double`. This allows us to pass in code that could for instance evaluate `operatorController.getLeftY()` constantly and give us access to new, updated values.

### Constructor

```java
public ElevatorManualCommand(Elevator elevator, DoubleSupplier speedSupplier) {
    this.elevator = elevator;
    this.speedSupplier = speedSupplier;

    addRequirements(elevator);
}
```

Just like the previous commands for other subsystems, the subsystem object is defined and `addRequirements()` is called. The object is defined in order for it to be possible to access certain functions related in the subsystem's class later on. `addRequirements()` is called in order for the `CommandScheduler` to know which subsystem is used in order to run the command.

### initialize() and execute()

```java
@Override
public void initialize() {

}

@Override
public void execute() {
    elevator.manualControl(speedSupplier.getAsDouble());
}
```

`initialize()` contains nothing inside of it as there are no actions to be done immediately after the command is called.

In the `execute()` function, `manualControl()` from our subsystem is called with `speedSupplier.getAsDouble()` as a parameter. The `getAsDouble()` function essentially evaluates that stored function and passes in our speed value to the Elevator subsystem.

### isFinished() and end()

```java
@Override
    public void end(boolean interrupted) {

    }

    @Override
    public boolean isFinished() {
        return false;
    }
```

Nothing is inside of `end()` because there are no actions to complete when the command ends.

In `isFinished()`, there is only `return false` because the command should not end on its own. It can be **cancelled** by other commands in the future, but while running, there shouldn't be any end condition defined.

With that, our command is done! However in `RobotContainer.java` now we have to set up when it is called.

## Robot Container (Bindings)

### Variable Declarations

```java
package frc.robot;

import edu.wpi.first.wpilibj.Notifier;
import edu.wpi.first.wpilibj.XboxController.Button;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.Command;
import frc.robot.subsystems.SnailSubsystem;
import frc.robot.util.SnailController;
import frc.robot.subsystems.Elevator;
import frc.robot.commands.elevator.ElevatorManualCommand;

import java.util.ArrayList;

import static frc.robot.Constants.ElectricalLayout.CONTROLLER_DRIVER_ID;
import static frc.robot.Constants.ElectricalLayout.CONTROLLER_OPERATOR_ID;
import static frc.robot.Constants.UPDATE_PERIOD;;

public class RobotContainer {

    private SnailController driveController;
    private SnailController operatorController;

    private Elevator elevator;

    private ArrayList<SnailSubsystem> subsystems;
```

 The only important line we have to add here is the `private Elevator elevator;` line just to create an instance of our subsystem. Everything else is already present in our template (besides import statements but those can be added later automatically by VSCode).

### Constructor and Bindings

```java
// constructor omitted because it is the exact same

private void configureSubsystems() {
    elevator = new Elevator();
    elevator.setDefaultCommand(new ElevatorManualCommand(elevator,  operatorController::getRightY));

    subsystems = new ArrayList<>();
    subsystems.add(elevator);
}

private void configureButtonBindings() {
    // Nothing here because the elevator will always be in manual control
}
 ```

Just like in the Arm subsystem, in addition to the Elevator subsystem getting passed in as a parameter, `operatorController::getRightY` is passed too. This is being passed in as our `DoubleSupplier` object. Essentially, we can pass in any function that returns a `double` variable into here. However, to ensure that we actually pass in the **function** itself and not the **result of evaluating that function**, we use Java's `::` operator.

When we do this, each time `execute()` is run in the command, `getRightY` is run and it supplies a different value based on what the Xbox controller is doing. If the value of the function was passed in with `.getRightY()` the initial value would never update as the constructor is only run once.

Since there are no other commands other than the default command in this subsystem, `configureButtonBindings()` is empty. There is never a need to change the command running with a button.

For more information, you may look at the Arm file.

## Constants

Below is the `Constants.java` file which is self-explanatory and has been reviewed in the [Roller Intake](frc/1-Basics/8-Elevator.md) tutorial. Refer to that file if you need a refresher.

```java
package frc.robot;

public final class Constants {

    public static class ElectricalLayout {
        public final static int CONTROLLER_DRIVER_ID = 0;
        public final static int CONTROLLER_OPERATOR_ID = 1;

        public final static int ELEVATOR_PRIMARY_ID = 0;
        public final static int ELEVATOR_FOLLOWER_ID = 1;
    }

    public static class Autonomous {

    }
    public static class Elevator {
        
    }

    public static int NEO_CURRENT_LIMIT = 80;
    public static double PI = 3.14159265;
    public static double UPDATE_PERIOD = 0.010;
}
```

## Final Remarks

If there are any lingering questions about anything gone over in this lesson, please ask a senior programming member.

With the elevator lesson over, you now know how to code four major subsystems that our team uses! Next lesson, we will learn about arguably the most important subsystem that Team 1257 uses: the drivetrain!
