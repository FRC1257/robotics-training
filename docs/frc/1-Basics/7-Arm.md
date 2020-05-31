# Arm

Now that you know how to make a claw and a roller intake, it is time to learn about a subsystem usually made in conjunction with the two. In this lesson, the purpose of the arm subsystem and the basic code to make it run will be gone over.
## Subsystem Overview

![arm](img/2019Robot.jpg)

Above is a picture of the entire robot that team 1257 made in 2019.  Attached to the roller intake(the shovel-like subsystem) are two bars. The bars are essentially what make up the arm subsystem of the robot and they are controlled by a motor and its motor contoller on the other side. The motor allows the arm to spin up or down.

### Purpose

The purpose of the arm is generally to make a subsystem of the robot be able to move up or down. This functionality is very important as it allows team 1257 to put game pieces in different heights. In 2019 the arm was used to eject balls at different heights in holes.
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
    private double speed = 0;
```

After importing the necessary libraries, the `armMotor` object is declared. The `armMotor` is the motor controller that controls the motor which allows the arm to rotate up or down. There is also another variable declared which is `speed` which is set to zero. That will be used later in the code to control the speed at which the arm moves.
### States
```java
public enum State {
    MANUAL
}

State state = State.MANUAL;
```
After declaring the motor controller, the states are declared. Unlike the roller intake and the claw, the arm only has one state called `MANUAL`. The reason there is only one state is because the `MANUAL` state means that the motor spins at whatever rate the speed variable tells it to. There are not several predetermined speeds for the motor like in the roller intkae which would require multiple variables. The specifics of what happens in the `MANUAL` state will be covered in the update function.

### Constructor

```java
public Arm() {
      armMotor = new CANSparkMax(ARM_ID, MotorType.kBrushless); 
      armMotor.restoreFactoryDefaults();
      armMotor.setIdleMode(IdleMode.kBrake);
      armMotor.setSmartCurrentLimit(NEO_550_CURRENT_LIMIT); // in amps
        
}
```

Similar to the roller intake, the constructor is used to define the motor controller and it is used to run several related functions. 

1. The first line declares the motor controller. A motor controller, has two parameters which are the ID and the `MotorType`. For this specific motor controller the ID is set to a constant called `ARM_ID` and the `MotorType` is set to brushless. This is because this motor controller is used to control a NEO motor which is brushless.

2. `restoreFactoryDefaults()` wipes all settings on the motor controller to its defaults, ensuring that we know exactly what they are and that we can safely change what we want.

3. The next line sets the idle mode of our motor to **brake** mode, which essentially means that the motor will try to stop itself from moving when we give it a command of `0`.

4. Lastly, we set the current limit. If a motor experiences too much current it could get seriously damaged. This line of code is absolutely necessary to prevent that risk. 
 

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
    
    public void setArmSpeed(double speed){
        this.speed = speed;
        state = State.MANUAL;
    }
```

For this subsystem, the update function is grouped with `setArmSpeed()` when discussing its logic as they are dependent on each other. Since there is only one state, the state will always be `MANUAL` which means that each time the update function is called, `armMotor.set(speed);` is run. This means that the motor will spin at whatever value the variable speed is at. `setArmSpeed()` sets the previously mentioned speed variable to the value passed in and sets the state to `MANUAL` since that is the only state of the robot. Thus after setArmSpeed() is run, the update function will output different code if the speed changes.

### Shuffle Board Functions

```java
    public void displayShuffleboard() {
      
    }

    public void tuningInit() {

    }

    public void tuningPeriodic() {

    }
```
These functions will be implemented in later posts.

### State Functions

```java
    public State getState() {
        return state;
    }
}
```
Unlike the previous subsystems discussed, there is no function to set the state to one of the states. That is because the state is already set to `MANUAL` when `setArmSpeed()` is called.

## Commands

Unlike the claw and the roller intake command files, the arm file has a few major differences. 

### Declaring Variables

```java
package frc.robot.commands.arm;

import edu.wpi.first.wpilibj2.command.CommandBase;
import frc.robot.subsystems.Arm;

import java.util.function.DoubleSupplier;

public class ArmManualCommand extends CommandBase {

    private final Arm arm;
    private final DoubleSupplier speedSupplier;
```
First, the subsystem is declared along with a variable called speedSupplier which is a part of the DoubleSupplier class. This class essentially makes objects which can be accessed as doubles if a certain function is called. 

### Constructor

```java
public ArmManualCommand(Arm arm, DoubleSupplier speedSupplier) {
        this.arm = arm;
        this.speedSupplier = speedSupplier;

        addRequirements(arm);
}
```

Just like the previous commands for other subsystems, the subsystem object is defined and `addrequirements()` is called. The object is defined in order for it to be possible to access certain functions related in the subsystem's class later on. `addrequirements()` is called in order for the `CommandSceduler` to know which subsystem is used in order to run the command.

In addition, a speedSupplier object is defined so its double accessing function could be used later on.

### Initialize and Execute

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

In the `execute()` function, `setArmSpeed()` is called with `speedSupplier.getAsDouble()` as a parameter. The `getAsDouble()` function essentially converts `speedSupplier` to a double. When this function is called, the `speed` variable in the subsystem file will be set to the value of the double inside of speedSupplier.

### IsFinished and End

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

In `isFinished()`, there is only `return false` because the only trigger for ending the command is when the command isn't being run by the scheduler.

## Robot Container(Bindings)

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

After the neccesary imports are made, the objects are declared. The two Xbox controllers, the subsystems, and an ArrayList for storing the subsystems are declared.

### Constructor and Bindings
```java
public RobotContainer() {
        driveController = new SnailController(CONTROLLER_DRIVER_ID);
        operatorController = new SnailController(CONTROLLER_OPERATOR_ID);

        configureSubsystems();
        configureButtonBindings();
    }

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
In the constructor there are a few things done:

1. The two controllers are defined with their IDs as their parameters.

2. The `configureSubsystems()` function is called. The subsystems are defined, the default commands are defined, and then the subsystems added to an ArrayList. The reason an ArrayList is used is so the subsystems can be updated more efficiently later on in the code.

There is one major difference in how the default commands are defined compared to the roller intake and the claw. In addition to arm getting passed in as a parameter, `operatorController::getRightY` is passed too. In the `::` java notation, instead of simply passing in a value from a function, the entire function is passed in. Therefore, each time `execute()` is run in the command, `getRightY` is run and it supplies a different value based on what the xBox controller is doing. If the value of the function was passed in with `.getRightY()` the initial value would never update as the constructor is only run once.

3. Lastly, configureButtonBindings() is called. Since there are no other commands other than the default command in this subsystem, configureButtonBindings() is empty. There is never a need to change the command running with a button.

## Constants

Below, is the constants file which is self-explanatory and has been reviewed in the roller intake subsystem tutorial. Refer to that file if you need a refresher.

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

    public static double PI = 3.14159265;
    public static double UPDATE_PERIOD = 0.010; // seconds
    public static int NEO_550_CURRENT_LIMIT = 25;

}
```
## Final Remarks

If there are any lingering questions about anything gone over in this lesson, please ask a senior programming member.

With the arm lesson over, you now know how to code three major subsystems that team 1257 uses! Next lesson, we will learn about yet another subsystem that team 1257 uses: the elevator!
