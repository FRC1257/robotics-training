# Velocity PID

Similar to positional PID control, there are a few ways of implementing velocity PID control. We will go over two methods here: the WPILib `PIDController` and the SPARK MAX onboard PID.

## Purpose

We might want to use velocity PID for tjree primary reasons:

1. Ensuring our mechanism reaches a consistent speed for something such as a shooter's flywheel
2. Motion profiling, which we will cover later
3. More precise control of something like the drivetrain.

We will cover the first use case in this lesson, the second case in a few lessons, and the final one in the future (most likely in the advanced section).

## General Info

Using velocity PID control is very similar to it for positional PID control. However, instead of using the constants `kP`, `kI`, and `kD`, we instead use `kFF` and `kP`. It is very rare that we will use `kD` or `kI` in velocity PID control, especially the latter. Essentially, the `kFF` term will be multiplied by the target velocity and added to the output, which will be the primary driving force for our controller. Then, the `kP` term will account for any small errors in the output and slightly modify the output to account for those. As a result, we will be using a combination of **feedback and feedforward control**.

To implement this, we first need to create the PID constants in our `Constants.java` file. Note that we add an extra term for the `kFF` term.

Additionally, we will define the max speed of our shooter here, which will be important later. We actually define our `kFF` term as `1 / SHOOTER_MAX_SPEED` at first. This is normally a really good approximation for what the `kFF` term should be, assuming that `SHOOTER_MAX_SPEED` corresponds to the actual speed limit of our motor. We can later tune this further, but this normally gets us really close.

We use the units RPM here, aka revolutions per minute. We could use whatever units we wanted here, as long as we are consistent. This means that we need to make sure to apply a scaling to our encoder values to ensure this is valid. However, SPARK MAXes actually have their default units set to revolutiosn per minute, making that unnecessary.

```java
public static class Shooter {
    ...
    public static double SHOOTER_MAX_SPEED = 5000.0; // RPM
    public static double[] SHOOTER_PIDF = new double[] {0.0001, 0, 0, 0.0002};
}
```

## WPILib PID

Now, we will cover how to implement the subsytem functions if we are using WPILib's `PIDController`. We will update the initialization step of our subsytem as follows. We will a) add the `VELOCITY_PID` state, define our `PIDController`, configure the constants. We don't have to scale our encoder values because we are using SPARK MAXes. One thing we have to note is that we are actually not passing our `kFF` constant into the `PIDController`. WPILib's `PIDController` does not actually support feedforward, but it is simple to implement. We will instead use WPILib's `PIDController` to handle just the feedback section.

```java
public class Shooter extends SnailSubsystem {

    public enum State {
        MANUAL,
        VELOCITY_PID
    }

    private CANSparkMax primaryMotor;
    private CANEncoder encoder;

    private PIDController shooterPID;

    private State state = defaultState;
    private double speed;

    public Elevator() {
        primaryMotor = new CANSparkMax(SHOOTER_PRIMARY_MOTOR_ID, MotorType.kBrushless);
        encoder = primaryMotor.getEncoder();

        shooterPID = new PIDController(SHOOTER_PIDF[0], SHOOTER_PIDF[1], SHOOTER_PIDF[2], UPDATE_PERIOD);
    }

    ...
}
```

Next, we will have our `update()`, `setSpeed()`, and `endPID()` functions, which will handle, set, and end our `VELOCITY_PID` state respectively.

```java

@Override
public void update() {
    switch(state) {
        case MANUAL:
            primaryMotor.set(speed);
        break;
        case VELOCITY_PID:
            // add our feedback and feedforward outputs together
            double output = shooterPID.calculate(encoder.getVelocity()) + SHOOTER_PIDF[3] * shooterPID.getSetpoint();


            primaryMotor.set(output);
        break;
    }
}

public void setVelocity(double setpoint) {
    state = State.VELOCITY_PID;
    shooterPID.reset();
    shooterPID.setSetpoint(setpoint);
}

public void endPID() {
    state = State.MANUAL;
}
```

One thing to notice is that we do **not** define an end condition for our velocity PID. This is typically because we don't actually want to end our velocity PID automatically, since the purpose of it is to **maintain** a certain velocity, not accomplish a single motion. The velocity PID will be frequently cancelled by how we set up our commands. We will see this in a moment. Before we do that, we will cover how to implement the subsytem for SPARK MAX PID.

## SPARK MAX PID

TODO

## Velocity PID Command

Our command for controlling velocity PID is pretty simple.

```java
public class ShooterVelocityPIDCommand extends CommandBase {

    private Shooter shooter;
    private double setpoint;

    public ShooterVelocityPIDCommand(Shooter shooter, double setpoint) {
        this.shooter = shooter;
        this.setpoint = setpoint;
    }

    @Override
    public void init() {
        shooter.setVelocity(setpoint);
    }
    @Override
    public boolean isFinished() {
        return false;
    }

    @Override
    public void end(boolean interrupted) {
        shooter.endPID();
    }
}
```

Finally, we need to implement the button bindings in `RobotContainer`, which is also relatively simple. This is also how we define when the command will end (when the button binding goes inactive). For instance, here we are binding it so that the command is run as we hold the A button, but when we release the A button, the command will terminate.

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

## Tuning Velocity PID

1. Set all terms but `kFF` to `0`
2. Set `kFF` to `1 / MAX_SPEED`
3. Tune only the `kFF` value as much as possible until you get a pretty good approximation of the desired value. Using a graph is **crucial** for this step. To do so, you need to output both the target velocity and the current velocity in the same graph.
4. Once you've gotten the best results possible with just `kFF`, gradually increase `kP` to account for small fluctuations until you get the desired results.
