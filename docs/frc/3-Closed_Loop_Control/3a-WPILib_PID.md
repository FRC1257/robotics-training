# WPILib PIDController

To handle PID calculations, the first option we have is to use the WPILib `PIDController` class. We will start with a basic elevator subsystem and add PID functionality to it so that on the press of a button, we can move to a predetermined setpoint.

```java
public class Elevator extends SnailSubsystem {

    public enum State {
        MANUAL
    }

    private WPI_TalonSRX primaryMotor;

    private State state = State.MANUAL;
    private double speed;

    public Elevator() {
        primaryMotor = new WPI_TalonSRX(ELEVATOR_PRIMARY_MOTOR_ID);

        // configure our encoder and convert its units to our height in inches
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
    public void displayShuffleboard() {
        SmartDashboard.putNumber("Elevator Position", primaryMotor.getSelectedSensorPosition());
    }

    ...
}
```

Currently, we only have the `MANUAL` state set up. In order to implement PID control, we need to add another state, `PID`. However before we do that, let's review some information about [`PIDController`](https://first.wpi.edu/FRC/roborio/release/docs/java/edu/wpi/first/wpilibj/controller/PIDController.html) in WPILib.

## PIDController

The first thing we do when we create a `PIDController` is initialize its constants with the constructor. We are also given the option to specify the `period`, or how often the controller is being updated. The default is every 0.02 seconds, which is for a 50 Hz update period, but we actually run our controllers twice as fast, at an update rate of 100 Hz. As a result, we need to use the `UPDATE_PERIOD` variable inside of `Constants.java` since it will have the actual period.

After we declare our `PIDController`, we have a variety of options that we can configure. We can configure things such as its tolerance, or how close it can be to the setpoint before ending the PID run, with `setTolerance()`. We can also change the PID constants (useful for tuning constants). However, once we have everything set up, we can finally use some of the functions to run it.

- `setSetpoint()`: choose where this PIDController is bringing us.
- `atSetpoint()`: returns whether or not we have reached the setpoint
- `calculate()`: takes in the current position of our mechanism and returns the output calculated by the PID controller to get us there
- `reset()`: resets the integral and derivative term. Good for right before we start using PID control.

## Implementing PIDController

Now that we've discussed the properties of `PIDController`, we can move on to actually implementing it. First, we want to set up the constants for it in `Constants.java`. We use an array to store all of our PID constants together to make our file more readable by grouping up related elements.

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

Next, we can create our `PIDController` object in `Elevator` with the PID constants passed into the constructor. We also set the tolerance on it to the value in our `Constants.java` file.

```java
public class Elevator extends SnailSubsystem {

    public enum State {
        MANUAL
    }

    private WPI_TalonSRX primaryMotor;

    private PIDController elevatorPID;

    private State state = State.MANUAL;
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

After this, we can add the state `PID` to our state list, which will represent when we are currently using PID control to go to a certain setpoint. While updating during our `PID` state, we want to get our `PIDController` and calculate what output we should be sending to our motor by comparing our current sensor info and the desired setpoint. Then, we want to send this to the motor. Another thing we want to do is check if we are at our current setpoint, and if we are, we want to end the `PID` state and go back to `MANUAL`.

Also, we should note that we might want to constrict the maximum output of our PID controller to ensure that the system moves at a slow and controllable pace. We can directly modify the output from our `PIDController` to do this. Keep in mind that we have not implemented actually setting up the setpoint yet. This will be handled later, and for now you can just assume that it has been appropriately set up.

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
                // get the next PID value and limit it between the ranges
                double output = elevatorPID.calculate(primaryMotor.getSelectedSensorPosition());
                if(output > ELEVATOR_PID_MAX_OUTPUT) output = ELEVATOR_PID_MAX_OUTPUT;
                if(output < -ELEVATOR_PID_MAX_OUTPUT) output = -ELEVATOR_PID_MAX_OUTPUT;

                primaryMotor.set(output);

                // check our error and update the state if we finish
                if(elevatorPID.atSetpoint()) {
                    state = State.MANUAL;
                }
            break;
        }
    }
}
```

Now that we've handled the state, it's time to handle actually triggering the state with one of our functions. We can make this function called `setPosition()` that will handle this. In this function we want to:

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

With that, we're done setting up `PIDController` on our subsystem! Next up, we need to make a command that will call this `setPosition()` function with a desired setpoint. Then, the subsystem will enter the `PID` state, and continue sending output to the motors until it reaches the setpoint. Then, it will go back to the `MANUAL` state where we can go back to manual control of our subsystem. Before we get into that, we're going to first review how we could accomplish the same thing the SPARK MAX PID.
