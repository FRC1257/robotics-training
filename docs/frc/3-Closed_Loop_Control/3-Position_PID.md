# Position PID

> [!WARNING]
> This section is long

Now that we have a basic overview of what PID does (for a quick summary, we use a combination of various terms to drive our error in some field to 0. For instance, our error could be our distance from the setpoint, our difference between desired velocity and current velocity, our angular displacement from a setpoint, etc.)

Right now, we will go over position PID, or PID that tries to bring a mechanism to a desired position. In this case, our `error` term will be the difference between our currently measured position and our desired position. We use position PID very often in robotics. For instance, we frequently use it on our drivetrain to turn to angles and to drive specific distances. Additionally, on mechanisms such as arms or elevators, we use them to go to specific setpoints that allow us to score game pieces.

There are two main implementations of PID that we can use, `PIDController` on the RoboRIO or SPARK MAX onboard PID. For RoboRIO PID, we run a PID controller on the RoboRIO itself and it then sends those calculations to the motor controller. This works no matter what type of motor controller you are using. It is also highly customizable. However, we can also use SPARK MAX onboard PID, which is built into the SPARK MAX motor controller and allows us to run PID commands on the actual motor controller. When we run onboard PID, it can run at much, much faster rates than what is possible on the RoboRIO board.

As a result, it is most of the time desirable to use the SPARK MAX PID when possible. However we cannot use it when we either do not have SPARK MAXes on our mechanism or we have to do some customization with the outputs of our PID controller. Here, we will go over both of the methods.

## RoboRIO PIDController

When we run RoboRIO PID, we use the WPILib `PIDController` class to handle the PID calculations. We will start with the below subsystem (an elevator) and add PID functionality to it.

```java
public class Elevator extends SnailSubsystem {

    public enum State {
        MANUAL
    }

    private WPI_TalonSRX primaryMotor;

    private State state = defaultState;
    private double speed;

    public Elevator() {
        primaryMotor = new WPI_TalonSRX(ELEVATOR_PRIMARY_MOTOR_ID);
        primaryMotor.configSelectedFeedbackSensor(FeedbackDevice.CTRE_MagEncoder_Relative);
        primaryMotor.configSelectedFeedbackCoefficient(1 / 4096.0 / 48.0 * Math.PI * 6);

        primaryMotor.setSelectedSensorPosition(0);
    }

    @Override
    public void update() {
        switch(state) {
            case MANUAL:
                primaryMotor.set(speed);
            break;
        }
    }

    public void setSpeed(double speed) {
        this.speed = speed;
    }

    @Override
    public void outputValues() {
        SmartDashboard.putNumber("Elevator Position", primaryMotor.getSelectedSensorPosition());
    }

    ...
}
```

Currently, we only have the `MANUAL` state set up. In order to implement PID control, we need to add another state, `PID`. However before we do that, let's review some information about [`PIDController`](https://first.wpi.edu/FRC/roborio/release/docs/java/edu/wpi/first/wpilibj/controller/PIDController.html) in WPILib.

### PIDController

The first thing we do when we create a `PIDController` is that we have to initialize its constants with its constructor. We are also given the option to specify the period, or how often the controller is being updated. The default is 0.02 seconds, which is for a 50 Hz update period, but we actually run our controllers twice as fast, at an update rate of 100 Hz. As a result, we need to use the `UPDATE_PERIOD` variable inside of `Constants.java` since it will have the actual period.

After we declare our `PIDController`, we have a variety of options that we can configure. We can configure things such as its tolerance for how close it can be to the setpoint before ending with `setTolerance()`. We can also change the PID constants (good for tuning constants). However once we have everything set up, we can finally use some of the functions to run it.

- `setSetpoint()`: choose where this PIDController is bringing us.
- `atSetpoint()`: returns whether or not we have reached the setpoint
- `calculate()`: takes in the current position of our mechanism and returns the output calculated by the PID controller to get us there
- `reset()`: resets the integral and derivative term. Good for right before we start using PID control

### Implementing PIDController

Now that we've discussed the properties of `PIDController`, we can move on to actually implementing it. First, we want to set up the constants for it in `Constants.java`. We use an array to store all of our PID constants.

```java
public final class Constants {

    public static class ElectricalLayout {
        public final static int CONTROLLER_DRIVER_ID = 0;
        public final static int CONTROLLER_OPERATOR_ID = 1;

        public final static int ELEVATOR_PRIMARY_MOTOR_ID = 4;
    }

    public static class Autonomous {

    }

    public static class Elevator {
        public static double[] ELEVATOR_PID = new double[] {0.1, 0, 0.01};
        public static double ELEVATOR_PID_TOLERANCE = 0.1;
        public static double ELEVATOR_PID_MAX_OUTPUT = 0.7;
    }

    public static double PI = 3.14159265;
    public static double UPDATE_PERIOD = 0.010; // seconds
}
```

Next, we can create our `PIDController` in `Elevator`.

```java
public class Elevator extends SnailSubsystem {

    public enum State {
        MANUAL
    }

    private WPI_TalonSRX primaryMotor;

    private PIDController elevatorPID;

    private State state = defaultState;
    private double speed;

    public Elevator() {
        primaryMotor = new WPI_TalonSRX(ELEVATOR_PRIMARY_MOTOR_ID);
        primaryMotor.configSelectedFeedbackSensor(FeedbackDevice.CTRE_MagEncoder_Relative);
        primaryMotor.configSelectedFeedbackCoefficient(1 / 4096.0 / 48.0 * Math.PI * 6);

        primaryMotor.setSelectedSensorPosition(0);

        elevatorPID = new PIDController(ELEVATOR_PID[0], ELEVATOR_PID[1], ELEVATOR_PID[2], UPDATE_PERIOD);
        elevatorPID.setTolerance(ELEVATOR_PID_TOLERANCE);
    }

    ...
}
```

After this, we can add the state `PID` to our state list. In the `PID` state, we want to get our `PIDController` and calculate its output using our current sensor info. Then, we want to send this to the motor. Another thing we want to do is check if we are at our current setpoint. If we are, we want to end the `PID` state and go back to `MANUAL`. Another thing to note is that we might want to constrict the max output of our PID controller to ensure that the system moves at a slow and controllale pace. We can directly modify the output from our `PIDController` to do this.  Note that we have not implemented actually setting up the setpoint yet. This will be handled later.

```java
public class Elevator extends SnailSubsystem {

    public enum State {
        MANUAL,
        PID
    }

    ...

    @Override
    public void update() {
        switch(state) {
            case MANUAL:
                primaryMotor.set(speed);
            break;
            case PID:
                double output = elevatorPID.calculate(primaryMotor.getSelectedSensorPosition());
                if(output > ELEVATOR_PID_MAX_OUTPUT) output = ELEVATOR_PID_MAX_OUTPUT;
                if(output < -ELEVATOR_PID_MAX_OUTPUT) output = -ELEVATOR_PID_MAX_OUTPUT;

                primaryMotor.set(output);

                if(elevatorPID.atSetpoint()) {
                    state = State.MANUAL;
                }
            break;
        }
    }
}
```

Now that we've handled the state, it's time to handle actually triggering the state with one of our functions. We can make this function called `setPosition()` that will handle this. In this function we want to

- enter the `PID` state
- reset our `PIDController`
- set our `PIDController` setpoint

```java
public void setPosition(double setpoint) {
    state = State.PID;
    elevatorPID.reset();
    elevatorPID.setSetpoint(setpoint);
}
```

We will review writing the command for this after we go over SPARK MAX PID. Click [here](##PID-Command) to go straight there.

## SPARK MAX PID

To use the SPARK MAX PID system, the process is a bit different, but not too complicated. The way SPARK MAX PID works is that we create a `CANPIDController` object from the SPARK MAX, and then we assign it a setpoint to reach. Then, the onboard controller will do the calculatins to arrive at the setpoint with the loaded constants. We will go over this in detail next. Go [here](http://www.revrobotics.com/content/sw/max/sw-docs/java/com/revrobotics/CANPIDController.html) to find the documentation.

First, we need to do the same as the `PIDController` implementation and create our constants.

```java
public final class Constants {

    public static class ElectricalLayout {
        public final static int CONTROLLER_DRIVER_ID = 0;
        public final static int CONTROLLER_OPERATOR_ID = 1;

        public final static int ELEVATOR_PRIMARY_MOTOR_ID = 4;
    }

    public static class Autonomous {

    }

    public static class Elevator {
        public static double[] ELEVATOR_PID = new double[] {0.1, 0, 0.01};
        public static double ELEVATOR_PID_TOLERANCE = 0.1;
        public static double ELEVATOR_PID_MAX_OUTPUT = 0.7;
    }

    public static double PI = 3.14159265;
    public static double UPDATE_PERIOD = 0.010; // seconds
}
```

After this, we can set up the motors and encoder that we will be working with in our elevator subsystem.

```java
public class Elevator extends SnailSubsystem {

    public enum State {
        MANUAL
    }

    private CANSparkMax primaryMotor;
    private CANEncoder primaryEncoder;

    private State state = defaultState;
    private double speed;

    public Elevator() {
        primaryMotor = new CANSparkMax(ELEVATOR_PRIMARY_MOTOR_ID, MotorType.kBrushless);
        primaryMotor.restoreFactoryDefaults();
        primaryMotor.configSelectedFeedbackSensor(FeedbackDevice.CTRE_MagEncoder_Relative);
        primaryMotor.configSelectedFeedbackCoefficient(1 / 4096.0 / 48.0 * Math.PI * 6);

        primaryEncoder = new CANEncoder(primaryMotor);
        primaryEncoder.setPositionConversionFactor(48.0 * Math.PI * 6);
        primaryEncoder.setVelocityConversionFactor(48.0 * Math.PI * 6 / 60);
    }

    ...
}
```

Next, we can set up the `CANPIDController` object that will handle almost all things PID.

```java
public class Elevator extends SnailSubsystem {

    public enum State {
        MANUAL
    }

    private CANSparkMax primaryMotor;
    private CANEncoder primaryEncoder;
    private CANPIDController elevatorPID;

    private State state = defaultState;
    private double speed;

    public Elevator() {
        primaryMotor = new CANSparkMax(ELEVATOR_PRIMARY_MOTOR_ID, MotorType.kBrushless);
        primaryMotor.restoreFactoryDefaults();
        primaryMotor.configSelectedFeedbackSensor(FeedbackDevice.CTRE_MagEncoder_Relative);
        primaryMotor.configSelectedFeedbackCoefficient(1 / 4096.0 / 48.0 * Math.PI * 6);

        primaryEncoder = new CANEncoder(primaryMotor);
        primaryEncoder.setPositionConversionFactor(48.0 * Math.PI * 6);
        primaryEncoder.setVelocityConversionFactor(48.0 * Math.PI * 6 / 60);

        elevatorPID = new CANPIDController(primaryMotor);
        elevatorPID.setP(ELEVATOR_PID[0]);
        elevatorPID.setI(ELEVATOR_PID[1]);
        elevatorPID.setD(ELEVATOR_PID[2]);
        elevatorPID.setOutputRange(-ELEVATOR_PID_MAX_OUTPUT, ELEVATOR_PID_MAX_OUTPUT);
    }

    ...
}
```

**Quick Note: if you have two different set of PID gains (constants), you can specify an optional parameter after each constant to add the PID slot that you want to use. This allows you to switch between constants if you need to use that feature. Read the documentation for more info.**

Next, we need to make our `update()` function with the `PID` state. The main difference here is that to make the SPARK MAX start using PID, we go to the `CANPIDController` and just tell it where we want to go. It handles everything else. Another difference is that while before, we would store the setpoint with the `PIDController` object, we now have to store it in a separate variable because the `CANPIDController` object does **not** store it as of the time of writing. Finally, we have to do the error checking ourselves to see if we have arrived at the desired position.

```java
public class Elevator extends SnailSubsystem {

    public enum State {
        MANUAL,
        PID
    }

    ...

    private double setpoint;

    ...

    @Override
    public void update() {
        switch(state) {
            case MANUAL:
                primaryMotor.set(speed);
            break;
            case PID:
                elevatorPID.setReference(setpoint);

                if(Math.abs(primaryEncoder.getPosition() - setpoint) < ELEVATOR_PID_TOLERANCE) {
                    state = State.MANUAL;
                }
            break;
        }
    }
}
```

Finally, we can just make the function that will enable this PID mode:

```java
public void setPosition(double setpoint) {
    state = State.PID;
    this.setpoint = setpoint;
}
```

And with that we're done with the SPARK MAX PID!

## PID Command

Once we've created the function that will enable our PID mode, we need to actually create a corresponding command. Actually making the command function is not difficult:

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

While this command will run, we also want to ensure that when the elevator reaches the position and ends the PID control, the command will end. In our subsystem class, we already handled this with our check for the setpoint difference, and we switch the state back to manual when the PID is finished. Therefore, in our command, we just need to check the state of our subsystem to see if it has left the `PID` state.

```java
public class ElevatorPIDCommand extends CommandBase {
    ...

    @Override
    public boolean isFinished() {
        return elevator.getState() != Elevator.State.PID; // you may have to make a getState() function if it is not already made
    }
}
```

Now, when we go to `RobotContainer` to assign the command to a state, we can use our command.

```java
public class RobotContainer {
    ...

    public void configureButtonBindings() [
        operatorController.getButton(Button.kY.value).whileActiveOnce(new ElevatorPIDCommand(elevator, Elevator.SETPOINT_TOP));
        operatorController.getButton(Button.kX.value).whileActiveOnce(new ElevatorPIDCommand(elevator, Elevator.SETPOINT_BOT));
    ]
}
```

Notice that we use `whileActiveOnce()` here. In case you have not seen this before, `whileActiveOnce()` means that the command will be run once when the button is first pressed, but as soon as the button is released, the command will end. This ensures that we still have a manual way of stopping the PID in case it misbehaves. For instance, if our mechanism breaks and we need to stop closed loop control, we can merely release the button which should prematurely end the command.

However, note that our command currently doesn't actually stop the elevator if the command is ended! The command starts the elevator moving, but has no way of stopping it. To make sure that if the command is ended prematurely, the closed loop does as well, we need to define the `end()` clause of our command to actually end the PID. First of all, we need to add a function to our elevator that stops the PID.

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

With that, we're done!

## Extras

Now that we've implemented our PID controllers, it's time to go over some additional things.

### Displaying Data

One **extremely** useful thing you can do while tuning PID is to make graphs, graphs, and tons of graphs. Making graphs is good because it allows you to visualize instability, overshooting, and steady-state error. The best one you can make is one that has both your current position and your setpoint on it. A really convenient way to output the data is actually to output the current position and the setpoint in the same array, which will automatically make Shuffleboard put a graph of them on the screen together.

#### WPILib PIDController

```java
public void outputValues() {
    SmartDashboard.putNumberArray("Elevator Dist PID", new double[] {primaryMotor.getSelectedSensorPosition(), elevatorPID.getSetpoint()});
}
```

#### SPARK MAX PID

```java
public void outputValues() {
    SmartDashboard.putNumberArray("Elevator Dist PID", new double[] {primaryEncoder.getPosition(), pidSetpoint});
}
```

### Shuffleboard Tuning

Shuffleboard tuning is rather straightforward with `PIDController`. We can simply query Shuffleboard for the constant and then once we get this new value, we do two things:

- we store it in the `ELEVATOR_PID` array in Constants
- we update `PIDController` with this new constant

```java
@Override
public void getConstantTuning() {
    ELEVATOR_PID[0] = Shuffleboard.getNumber("Elevator PID P", ELEVATOR_PID[0]);
    ...

    elevatorPID.setP(ELEVATOR_PID[0]);
    ...
}
```

For the SPARK MAX PID controller, it gets just a bit more tricky. For SPARK MAX, the controller will glitch out if you try to constantly do `elevatorPID.setP()` calls over and over again, even if you're setting it to the same value. As a result, you have to do a check to make sure you're only updating the value when it actually changes.

```java
@Override
public void getConstantTuning() {
    ELEVATOR_PID[0] = Shuffleboard.getNumber("Elevator PID P", ELEVATOR_PID[0]);
    ...

    if(elevatorPID.getP() != ELEVATOR_PID[0]) elevatorPID.setP(ELEVATOR_PID[0]);
    ...
}
```

### Maintaining Position

Sometimes, we want to use our PID to maintain a position even after the movement has ended or to make it maintain the same position. For instance, if we have an arm or elevator that falls under gravity, we might not want to end PID when we reach the endpoint of our movement. When this happens, we can simple remove the clause in our `PID` state that ends the `PID` state if the setpoint is reached. This will allow our closed loop control to persist. However, one should be careful with this to ensure that there is still a method available to exit the PID state. With the system described here, the release of our button is a way to end PID control. However, there are many other methods, such as having manual control interrupt it.

For freezing mechanisms, or making them maintaint the same position, it is pretty easy. We follow the above steps to remove the end `PID` state clause, and then when we call the `setPosition()` function from our freeze command, we simply set the PID position to the current position. A really easy way to implement the `RobotContainer` calling of the freeze command would be to use the `toggleWhenPressed()` function when assigning buttons to commands.

### Why We Might Use PIDController on a SPARK MAX

Sometimes, we might choose to use the RoboRIO `PIDController` over the SPARK MAX because `PIDController` gives us way more flexibility in terms of what we do with that output. For instance, when we do PID control on our drivetrain to drive a straight distance, we use `PIDController` because it allows us to pass that value into the `arcadeDrive()` function and then pass another custom variable for turning speed into the second parameter of `arcadeDrive()`. If we used the onboard SPARK MAX PID, then we would not be able to do this since the calculated PID value would automatically be sent to the motor on a per controller basis.
