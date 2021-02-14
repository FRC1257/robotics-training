# PID Command and Extras

## PID Command

Once we've created the function that will enable our PID mode, we need to actually create a corresponding command. Actually making the command function is not difficult. We simply need to call the `setPosition()` function on our subsystem when the command is first run.

```java
public class ElevatorPIDCommand extends CommandBase {

    private Elevator elevator;
    private double setpoint;

    public ElevatorPIDCommand(Elevator elevator, double setpoint) {
        this.elevator = elevator;
        this.setpoint = setpoint;
    }

    @Override
    public void init() {
        elevator.setPosition(setpoint);
    }
}
```

While this command will run, we also want to ensure that when the elevator reaches the position and ends the PID control, the command will end. In our subsystem class, we already handled this with our check for the setpoint difference, after which we changed the state back to manual when the PID finished. Therefore, in our command, we just need to check the state of our subsystem to see if it has left the `PID` state.

```java
public class ElevatorPIDCommand extends CommandBase {
    ...

    @Override
    public boolean isFinished() {
        // you may have to make a getState() function if it is not already made
        // all it does is just return the state variable in our Elevator file
        return elevator.getState() != Elevator.State.PID;
    }
}
```

Now, when we go to `RobotContainer` to assign the command to a state, we can use our command.

```java
public class RobotContainer {
    ...

    public void configureButtonBindings() {
        operatorController.getButton(Button.kY.value).whileActiveOnce(
            new ElevatorPIDCommand(elevator, Elevator.SETPOINT_TOP));

        operatorController.getButton(Button.kX.value).whileActiveOnce(
            new ElevatorPIDCommand(elevator, Elevator.SETPOINT_BOT));
    }
}
```

Notice that we use `whileActiveOnce()` here. In case you have not seen this before, `whileActiveOnce()` means that the command will be run once when the button is first pressed, but as soon as the button is released, the command will end. This ensures that we still have a manual way of stopping the PID in case it misbehaves. For instance, if our mechanism breaks and we need to stop closed loop control, we can merely release the button which should prematurely end the command.

However, note that our command currently doesn't actually stop the elevator if the command is ended! The command gets the elevator moving, but has no way of stopping it. To make sure that the closed-loop movements ends with the command itself, we need to define the `end()` clause of our command to actually end the PID. First of all, we need to add a function to our elevator that stops the PID.

```java
public class Elevator extends SnailSubsystem {
    ...

    public void endPID() {
        state = State.MANUAL;
    }
}
```

Next, we define the `end()` clause of our command.

```java
public class ElevatorPIDCommand extends CommandBase {
    ...

    @Override
    public void end(boolean interrupted) {
        elevator.endPID();
    }
}
```

And with that, we're done with our command!

## Extras

Now that we've implemented our PID controllers, it's time to go over some additional things.

### Displaying Data

One **extremely** useful thing you can do while tuning PID is to make graphs, graphs, and tons of graphs. Making graphs allows you to visualize instability, overshooting, and steady-state error. The best one you can make is one that has both your current position and your setpoint on it. A really convenient way to output the data is actually to output the current position and the setpoint in the same array, which will automatically make Shuffleboard put a graph of them on the screen together.

#### WPILib PIDController

```java
public void displayShuffleboard() {
    SmartDashboard.putNumberArray("Elevator Dist PID", new double[] 
        {primaryMotor.getSelectedSensorPosition(), elevatorPID.getSetpoint()});
}
```

#### SPARK MAX PID

```java
public void displayShuffleboard() {
    SmartDashboard.putNumberArray("Elevator Dist PID", new double[] 
        {primaryEncoder.getPosition(), pidSetpoint});
}
```

### Shuffleboard Tuning

Shuffleboard tuning is rather straightforward with `PIDController`. We can simply query Shuffleboard for the constant and then once we get this new value, we do two things:

- we store it in the `ELEVATOR_PID` array in Constants
- we update `PIDController` with this new constant

```java
@Override
public void tuningPeriodic() {
    ELEVATOR_PID[0] = Shuffleboard.getNumber("Elevator PID P", ELEVATOR_PID[0]);
    ...

    elevatorPID.setP(ELEVATOR_PID[0]);
    ...
}
```

For the SPARK MAX PID controller, it gets just a bit more tricky. For SPARK MAX, the controller will glitch out if you try to constantly do `elevatorPID.setP()` calls over and over again, even if you're setting it to the same value. As a result, you have to do a check to make sure you're only updating the value when it actually changes.

```java
@Override
public void tuningPeriodic() {
    ELEVATOR_PID[0] = Shuffleboard.getNumber("Elevator PID P", ELEVATOR_PID[0]);
    ...

    if(elevatorPID.getP() != ELEVATOR_PID[0]) elevatorPID.setP(ELEVATOR_PID[0]);
    ...
}
```

### Maintaining Position

Sometimes, we want to use our PID to maintain a position even after the movement has ended or to make it maintain the same position. For instance, if we have an arm or elevator that falls under gravity, we might not want to end PID when we reach the endpoint of our movement.

When this happens, we can simply remove the clause in our `PID` command that ends the `PID` state if the setpoint is reached. This will allow our closed loop control to persist.

However, one should be careful with this to ensure that there is still a method available to exit the PID state. With the system described here, the release of our button is a way to end PID control. There are many other methods such as having manual control interrupt it.

For freezing mechanisms, or making them maintain the same position, it is pretty easy. We follow the above steps to remove the end `PID` state clause, and then when we call the `setPosition()` function from our freeze command, we simply set the PID position to the current position. A really easy way to implement the `RobotContainer` calling of the freeze command would be to use the `toggleWhenPressed()` function when assigning buttons to commands.

We'll go more into how exactly we implemented this when we review our 2019 Arm. You can view the code for that [here](https://github.com/FRC1257/2019-Robot-Command/blob/master/src/main/java/frc/robot/subsystems/cargointake/CargoArm.java).

### Tuning Tip

To properly tune, I would also recommend that you comment out the error-checking clause in the `PID` state so that the PID is not ended prematurely. Once the PID is tuned, it can be uncommented. This is so that we can accurately measure the overshoot and instability of the system after it reaches the setpoint while tuning, but this is unnecessary once we finish tuning properly.
