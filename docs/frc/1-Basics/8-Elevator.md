# Elevator
You now know how to make three major subsystems that our team uses. In this lesson, it is time to learn a subsystem that works in a very similar way to the arm subsystem: the elevator. In this lesson the purpose of the elevator will be explained and the basic code to run the subsystem will be gone over.

## Subsystem Overview

<img src="img/elevatorExtended.jpeg" width="40%">

Above is a picture of an elevator subsystem. Not every elevator looks like this though almost all used by 1257 have followed the same general concept. There are pulleys set up that are spun using mootrs that raise the elevators up and down. In many designs the motors both spin in the same direction though there are also quite a few where the spinin oppiste directions because of the ways that the pulleys are set up.

### Purpose

The purpose of an elevator isactually quite similar to an arms. It is supposed to raise subsystems and game components up and down. Although we never actually used the our robot for 2020, team 1257 had an elevator which brought a hook higher so it could hang unto a bar. The biggest difference between an elevator and an arm is that an Elevator moves directly up instead of rotating up. That often saves space which is why team 1257 uses an elevator subsystem even though it is very complex.

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

### States
```java
    public enum State {
        MANUAL
    }

    State state = State.MANUAL;
    private double speed = 0;
```

### Constructor
```
 public Elevator() {
        elevatorMotor = new CANSparkMax(ELEVATOR_PRIMARY_ID, MotorType.kBrushless); 
        elevatorMotor.restoreFactoryDefaults();
        elevatorMotor.setIdleMode(IdleMode.kBrake);
        elevatorMotor.setSmartCurrentLimit(NEO_CURRENT_LIMIT);

        elevatorFollowerMotor = new CANSparkMax(ELEVATOR_FOLLOWER_ID, MotorType.kBrushless);
        elevatorFollowerMotor.restoreFactoryDefaults();
        elevatorFollowerMotor.setIdleMode(IdleMode.kBrake);
        elevatorFollowerMotor.setSmartCurrentLimit(NEO_CURRENT_LIMIT);
        elevatorFollowerMotor.follow(elevatorMotor, false);
    }
 ```

### Update Function and setElevatorSpeed()
```
@Override
public void update() {
    switch(state) {
        case MANUAL:
            elevatorMotor.set(speed);
            break;
    }
}
```

### Shuffle Board Functions

```java
    public void displayShuffleboard() {

    }

    public void tuningInit() {

    }

    public void tuningPeriodic() {

    }
```

### State Functions

```java
    public void setElevatorSpeed(double speed){
        this.speed = speed;
        state = State.MANUAL;
    }

    public State getState() {
        return state;
    }
}
```

## Elevator Manual Command

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

### Constructor
```java

public ElevatorManualCommand(Elevator elevator, DoubleSupplier speedSupplier) {
        this.elevator = elevator;
        this.speedSupplier = speedSupplier;

        addRequirements(elevator);
}
```
### initialize() and execute()

```java
@Override
    public void initialize() {

    }

    @Override
    public void execute() {
        arm.setElevatorSpeed(speedSupplier.getAsDouble());
    }
```

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
 ## Constants
 
 ```java
package frc.robot;

public final class Constants {

    public static class ElectricalLayout {
        public final static int CONTROLLER_DRIVER_ID = 0;
        public final static int CONTROLLER_OPERATOR_ID = 1;
    }

    public static class Autonomous {
        
    }
    public static class Elevator {
        public final static int ELEVATOR_PRIMARY_ID = 0;
        public final static int ELEVATOR_FOLLOWER_ID = 1;
    }

    public static double PI = 3.14159265;
    public static double UPDATE_PERIOD = 0.010; 
    public static int NEO_CURRENT_LIMIT = 80;
```

## Final Remarks

If there are any lingering questions about anything gone over in this lesson, please ask a senior programming member.

With the elevator lesson over, you now know how to code four major subsystems that our team uses! Next lesson, we will learn about arguably most important subsystem that Team 1257 uses: the drivetrain!
