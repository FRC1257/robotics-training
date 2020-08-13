# Arm

Now that you know how to make a claw and a roller intake, it is time to learn about a subsystem usually made in conjunction with the two. In this lesson, the purpose of the arm subsystem and the basic code to make it run will be gone over.

## Overview

![FRC 1257's 2019 Robot Arm](img/2019Robot.jpg)

Above is a picture of the entire robot that Team 1257 made for the 2019 game, Destination Deep Space. Our roller intake (the green wheels) are attacked to our arm, which is composed of the two bars that rotate the entire intake up or down via a single motor.

### Purpose

The purpose of the arm is generally to make a subsystem of the robot able to move up or down. In the 2019 game, the purpose of the arm was to move the intake to various important positions, such as the ground to pick up cargo balls, or up to score the balls into the various scoring areas.

## Subsystem File

### Declaring Motor Controllers

```java
package frc.robot.subsystems;

import com.revrobotics.CANSparkMax;
import com.revrobotics.CANSparkMax.IdleMode;
import com.revrobotics.CANSparkMaxLowLevel.MotorType;

import static frc.robot.Constants.ElectricalLayout.*;
import static frc.robot.Constants.Arm.*;
import static frc.robot.Constants.NEO_550_CURRENT_LIMIT;


public class Arm extends SnailSubsystem {

    private CANSparkMax armMotor;
```

After importing all of the required libraries, we declare the motor controllers needed for our subsystem. In this case, we just have a single motor that controls the arm's up and down motion.

### States

```java
    public enum State {
        MANUAL
    }

    State state = State.MANUAL;
    private double speed = 0;
```

After declaring the motor controller, the states are declared. The arm subsystem is a bit special however in that not only does it have an `enum` to keep track of the state, but it also has a `speed` variable. You can think of the `enum` as the "mode" that the subsystem is in. This could be in manual control where the operator controls the speed set to the motor directly or position closed loop control. However, while we're in this "manual control" mode, we also need to keep track of what speed we should be going out, so you can think of it as an extra part of our state that we have to keep track of.

### Constructor

```java
public Arm() {
      armMotor = new CANSparkMax(ARM_ID, MotorType.kBrushless);
      armMotor.restoreFactoryDefaults();
      armMotor.setIdleMode(IdleMode.kBrake);
      armMotor.setSmartCurrentLimit(NEO_CURRENT_LIMIT); // in amps
}
```

Similar to the roller intake, the constructor is used to define the motor controller and set up parameters with it.

1. The first line declares the motor controller. A motor controller has two parameters which are the ID and the `MotorType`. For this specific motor controller, the ID is set to a constant called `ARM_ID` and the `MotorType` is set to brushless. This is because this motor controller is used to control a NEO motor which is brushless.

2. `restoreFactoryDefaults()` wipes all settings on the motor controller to its defaults, ensuring that we know exactly what they are and that we can safely change what we want. If we didn't do this, the motor controller might have some of its values changed from default, and this could be very dangerous.

3. The next line sets the idle mode of our motor to **brake** mode, which essentially means that the motor will try to stop itself from moving when we give it a command of `0`.

4. Lastly, we set the current limit. If a motor experiences too much current for a sustained period of time it could get seriously damaged. This line of code is absolutely necessary to prevent that risk. The value of this current limit can change depending on what motors we are using, but for NEOs we generally use a value of about 80A. We store this as a constant in our `Constants.java` file.

### Update Function and setArmSpeed()

```java
 @Override
    public void update() {
        switch(state) {
            case MANUAL:
                armMotor.set(speed);
                break;
        }
    }
```

For our update function, we once again look at which state, or "mode," that we are in. Here, we only have one state, `MANUAL` for manual control. During this manual control state, we want to look at the current `speed` variable and set our motor's speed value to that.

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
    public void setArmSpeed(double speed){
        this.speed = speed;
        state = State.MANUAL;
    }

    public State getState() {
        return state;
    }
}
```

In this case, we have the `setArmSpeed(double speed)` function to update the state of our arm. When this function is called, it takes in a `speed` parameter that it then stores as part of the state. Additionally, it will set the state, or "operating mode," of the subsystem to 

Unlike the previous subsystems discussed, there is no function to set the state to one of the states. That is because the state is already set to `MANUAL` when `setArmSpeed()` is called.

## Arm Manual Command

Unlike the claw and the roller intake command files, the arm command file has a few major differences. First of all, we only have a single command for our arm right now since we only have one action we want to do with it right now: move it manual control.

One of the crucial parts of this command is that it somehow has to pass a value from our XboxController in `RobotContainer` to the `Arm` subsystem to use as the speed. You may be tempted to try something like the following:

### Incorrect Approach

```java
package frc.robot.commands.arm;

import edu.wpi.first.wpilibj2.command.CommandBase;
import frc.robot.subsystems.Arm;

import java.util.function.DoubleSupplier;

public class ArmManualCommand extends CommandBase {

    private final Arm arm;
    private final double speed;

    public ArmManualCommand(Arm arm, double speed) {
        this.arm = arm;
        this.speed = speed;

        addRequirements(arm);
    }

    @Override
    public void initialize() {

    }

    @Override
    public void execute() {
        arm.setArmSpeed(speed;
    }
    ...
}
```

Then, in `RobotContainer.java`, you may try something like this:

```java
    arm.setDefaultCommand(new ArmManualCommand(operatorController.getLeftY()));
```

> [!NOTE]
> Our `SnailController` class has various functions that allow us to easily access the joystick values from the two joystick values on our XboxController. We have four functions: `getLeftY()`, `getLeftX()`, `getRightY()`, and `getRightX()`. All of these correspond to the x and y offsets joystick where (0, 0) is the center of the joystick and each axis ranges from -1 to 1.

However, this does **not** work. The reason is because when we just pass in a `double` variable, it merely passes in the value at the **time of initialization**. We want to be able to constantly query our controller for updated values, or essentially constantly ask our controller, "What is the **current** value of the joystick?" However, with the above setup, we will only get a **single, constant** value that we will store when the robot first boots up.

If we want to fix this, we need to be able to somehow pass in not a constant double value, but something that can **supply** a changing value that will be updated over time. To do this, we can use a `DoubleSupplier`.

### Correct Approach

```java
package frc.robot.commands.arm;

import edu.wpi.first.wpilibj2.command.CommandBase;
import frc.robot.subsystems.Arm;

import java.util.function.DoubleSupplier;

public class ArmManualCommand extends CommandBase {

    private final Arm arm;
    private final DoubleSupplier speedSupplier;
```

Here, instead of storing a `double` called `speed`, we store a `DoubleSupplier`. A `DoubleSupplier` is an object that represents a function that returns a `double`. This allows us to pass in code that could for instance evaluate `operatorController.getLeftY()` constantly and give us access new, updated values.

#### Constructor

```java
public ArmManualCommand(Arm arm, DoubleSupplier speedSupplier) {
    this.arm = arm;
    this.speedSupplier = speedSupplier;

    addRequirements(arm);
}
```

Just like the previous commands for other subsystems, the subsystem object is defined and, `addRequirements()` is called. The object is defined in order for it to be possible to access certain functions related in the subsystem's class later on. `addRequirements()` is called in order for the `CommandScheduler` to know which subsystem is used in order to run the command.

#### initialize() and execute()

```java
@Override
    public void initialize() {

    }

    @Override
    public void execute() {
        arm.setArmSpeed(speedSupplier.getAsDouble());
    }
```

`initialize()` contains nothing inside of it as there are no actions to be done immediately after the command is called.

In the `execute()` function, `setArmSpeed()` from our subsystem is called with `speedSupplier.getAsDouble()` as a parameter. The `getAsDouble()` function essentially evaluates that stored function and passes in our speed value to the Arm subsystem.

#### isFinished() and end()

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

import edu.wpi.first.wpilibj.Notifer;
import edu.wpi.first.wpilibj.XboxController.Button;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.Command;
import frc.robot.subsystems.SnailSubsystem;
import frc.robot.util.SnailController;
import frc.robot.subsystems.Arm;

import frc.robot.commands.arm.ArmManualCommand;
import java.util.ArrayList;

import static frc.robot.Constants.ElectricalLayout.CONTROLLER_DRIVER_ID;
import static frc.robot.Constants.ElectricalLayout.CONTROLLER_OPERATOR_ID;
import static frc.robot.Constants.UPDATE_PERIOD;

public class RobotContainer {

    private SnailController driveController;
    private SnailController operatorController;

    private Arm arm;

    private ArrayList<SnailSubsystem> subsystems;
```

The only important line we have to add here is the `private Arm arm;` line just to create an instance of our subsystem. Everything else is already present in our template (besides import statements but those can be added later automatically by VSCode).

### Constructor and Bindings

```java
    // constructor omitted because it is the exact same

    private void configureSubsystems() {
        arm = new Arm();
        arm.setDefaultCommand(new ArmManualCommand(arm, operatorController::getRightY));

        subsystems = new ArrayList<>();
        subsystems.add(arm);
    }

    private void configureButtonBindings() {
        // Nothing here because the arm will always be in manual control
    }
```

There is one major difference in how the default command is defined compared to the roller intake and the claw. In addition to the Arm subsystem getting passed in as a parameter, `operatorController::getRightY` is passed too. This is being passed in as our `DoubleSupplier` object. Essentially, we can pass in any function that returns a `double` variable into here. However, to ensure that we actually pass in the **function** itself and not the **result of evaluating that function**, we use Java's `::` operator.

When we do this, each time `execute()` is run in the command, `getRightY` is run and it supplies a different value based on what the XBox controller is doing. If the value of the function was passed in with `.getRightY()` the initial value would never update as the constructor is only run once.

Since there are no other commands other than the default command in this subsystem, `configureButtonBindings()` is empty. There is never a need to change the command running with a button.

#### Inline Option

While we used the `::` operator above to pass in the function, we could also use another notation with `() -> {}`. Essentially, we can define an inline function with this:

```java
private void configureSubsystems() {
    arm = new Arm();
    arm.setDefaultCommand(new ArmManualCommand(arm, () -> {
        return operatorController.getLeftY();
    }));

    subsystems = new ArrayList<>();
    subsystems.add(arm);
}
```

One advantage of this method is that if we have to do calculations (such as scaling the joystick value), we can use this method to perform other operations on that value:

```java
    arm.setDefaultCommand(new ArmManualCommand(arm, () -> {
        return Math.pow(operatorController.getLeftY(), 2); // square the value passed in
    }));
```

However, we use the `::` operator because it is shorter and cleaner.

There's so much more to be covered with all of the possibilities included with the Java functional interfaces, so feel free to search it up if you are interested.

## Constants

Below, is the constants file which is self-explanatory and has been reviewed in the Roller Intake subsystem tutorial. Refer to that file if you need a refresher.

```java
package frc.robot;

public final class Constants {

    public static class ElectricalLayout {
        public final static int CONTROLLER_DRIVER_ID = 0;
        public final static int CONTROLLER_OPERATOR_ID = 1;
    }

    public static class Autonomous {

    }

    public static class Arm {
        public final static int ARM_ID = 0;
    }

    public static int NEO_CURRENT_LIMIT = 80;
    public static double PI = 3.14159265;
    public static double UPDATE_PERIOD = 0.010; // seconds

}
```

## Final Remarks

If there are any lingering questions about anything gone over in this lesson, please ask a senior programming member.

With the arm lesson over, you now know how to code three major subsystems that our team uses! Next lesson, we will learn about yet another subsystem that Team 1257 uses: the elevator!
