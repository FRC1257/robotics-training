# Encoders

Encoders are quite possibly the most important and prevalent of FRC sensors (at least on 1257). There are two main types of encoders that we will discuss in this section: the CTRE SRX MAG Encoder and the built-in NEO Brushless motor encoder (used in conjunction with the SPARK MAX).

## CTRE SRX MAG Encoder

We frequently use these encoders to measure the revolutions performed motor attached to a Talon SRX. When electronics uses these encoders, they plug directly into the Talon SRX, so we can access it through there. We will start with the code below.

```java
public class Elevator extends SnailSubsystem {

    private WPI_TalonSRX primaryMotor;

    public Elevator {
        primaryMotor = new WPI_TalonSRX(ELEVATOR_PRIMARY_MOTOR_ID);
    }

    ...

    @Override
    public void displayShuffleboard() {

    }
}
```

We want to set up the encoder for the `primaryMotor`, so we can do the following:

```java
public Elevator {
    primaryMotor = new WPI_TalonSRX(ELEVATOR_PRIMARY_MOTOR_ID);
    primaryMotor.configSelectedFeedbackSensor(FeedbackDevice.CTRE_MagEncoder_Relative);
    primaryMotor.setSelectedSensorPosition(0);
    primaryMotor.setSensorPhase(true);
}
```

`configSelectedFeedbackSensor` handles setting up the type of encoder we are using, while `setSensorPhase` determines the direction of the sensor (which way is positive/negative). We also want to zero our encoder because we want to measure our distance relative from our starting position.

We can then obtain values from the encoder with the following:

```java
@Override
public void displayShuffleboard() {
    SmartDashboard.putNumber("Elevator Primary Motor Position", primaryMotor.getSelectedSensorPosition());
    SmartDashboard.putNumber("Elevator Primary Motor Velocity", primaryMotor.getSelectedSensorVelocity());
}
```

### Scaling

When we use these encoders, we have to scale the values we obtain. By default, the encoder returns measurements in ticks (ticks / second for velocity), where a tick is 1/4096th of a revolution. Therefore, to obtain revolutions of the motor, we have to divide by 4096.0 (the .0 is important to ensure that we convert to a double and retain the decimal place!).

Next, depending on the mechanism, we can scale to a real world value. One extremely common measure is for our drivetrain. We want to convert between revolutions and the distance traveled by the wheel. To do so, we first need the gearbox reduction and the diameter of the wheels. For 1257, we frequently use a reduction of 10.71:1 and a wheel diameter of 6" in our drivetrain. For our elevator example, we will use a gearbox reduction of 48:1 and a pulley diameter of 6".

```java
private double getHeight() {
    return frontLeftMotor.getSelectedSensorPosition() / 4096.0 / 48.0 * Math.PI * 6; // 6" diameter pulley and 48:1 reduction would go in Constants.java file
}
```

Another option we have is to directly set a conversion factor on the `WPI_TalonSRX` itself. We can do the following:

```java
primaryMotor = new WPI_TalonSRX(ELEVATOR_PRIMARY_MOTOR_ID);
primaryMotor.configSelectedFeedbackSensor(FeedbackDevice.CTRE_MagEncoder_Relative);
primaryMotor.setSensorPhase(true);
primaryMotor.configSelectedFeedbackCoefficient(1 / 4096.0 / 48.0 * Math.PI * 6);
```

Now, when the motor returns any values, it will first multiply by the coefficient we supplied. This causes the motor to do the conversion for us, making the `getHeight()` function no longer needed.

## NEO Brushless Motors

For the previous example, the encoder was a separate sensor that was then plugged into the dataport of the TalonSRX, allowing us to access it. However the NEO Brushless Motors (which are team has adopted for pretty much all mechanisms at the time of writing), have built in hall-effect sensors that communicate the position to its respective motor controller (the SPARK MAX). We will start with the code below.

```java
public class Elevator extends SnailSubsystem {

    private CANSparkMax primaryMotor;

    public Elevator {
        primaryMotor = new CANSparkMax(ELEVATOR_PRIMARY_MOTOR_ID, MotorType.kBrushless);
    }

    ...

    @Override
    public void displayShuffleboard() {

    }
}
```

To access the encoder attached to `primaryMotor` we need to make another variable, a `CANEncoder` object.

```java
private CANSparkMax primaryMotor;
private CANEncoder primaryEncoder;

public Elevator {
    primaryMotor = new CANSparkMax(ELEVATOR_PRIMARY_MOTOR_ID, MotorType.kBrushless);
    primaryEncoder = primaryMotor.getEncoder(); // another option is primaryEncoder = new CANEncoder(primaryMotor);
    primaryEncoder.setPosition(0);
}
```

After we do this, accessing the value from the encoder is incredibly simple:

```java
@Override
public void displayShuffleboard() {
    SmartDashboard.putNumber("Elevator Primary Motor Position", primaryEncoder.getPosition());
    SmartDashboard.putNumber("Elevator Primary Motor Velocity", primaryEncoder.getVelocity());
}
```

> [!NOTE]
> The default units are in revolutions and revolutions per minute for SPARK MAXes connected to NEO Brushless Motors.

### Scaling

We can also scale the values from the `CANEncoder`s easily.

```java
primaryMotor = new CANSparkMax(ELEVATOR_PRIMARY_MOTOR_ID, MotorType.kBrushless);
primaryEncoder = primaryMotor.getEncoder();
primaryEncoder.setPositionConversionFactor(1 / 48.0 * Math.PI * 6);
primaryEncoder.setVelocityConversionFactor(1 / 48.0 * Math.PI * 6 / 60);
```

> [!NOTE]
> In this case we do not have to divide by `4096.0` since the default units are already in revolutions. Additionally, for velocity, we have to divide by 60 to convert the units from per minute to per second.

## Uses

We have many possible uses for encoders, but two of the most common are listed here.

### Closed Loop Control

We will go over this more in depth in the next chapter, but this is essentially using sensors to allow our mechanisms to automatically move to very precise positions.

### Limiting Motion

When we use encoders, we can measure the position of our mechanism and therefore restrict its motion. This can allow us to prevent us from running our mechanism into hard stops continuously and stalling our motor, which could damage it.

The way we do this is just by checking the position of our mechanism with the encoder and then adjusting the applied speed of the motor as a result.

```java
public void update() {
    if (primaryEncoder.getPosition() < 0 && speed < 0) speed = 0; // if we're at the bottom and we try to go down
    if (primaryEncoder.getPosition() > ELEVATOR_MAX_HEIGHT && speed > 0) speed = 0; // if we're at the top and we try to go up

    ... // do stuff with speed
}
```

> [!NOTE]
> The sign of `speed` has to be checked to ensure that when we're at the bottom, we can still go up and so that when we're at the top, we can still go down.

#### Overrides

One issue that can arise when we use the aforementioned system is that our encoder values can start to drift and not match the real world. For instance, with mechanical issues such as gearbox slop, chain slipping, etc., our encoder value can start to not match the desired value. This is generally why we prefer to use limit switches instead of encoders for limiting our mechanisms.

If it is unfeasible to place limit switches on our mechanism, we may have to use encoders. However, if the encoder values start to drift, we may find that our software stops prevent us from reaching our full, desired range of motion. In this case, we must implement overrides to ensure that if this case happens, the operator can override the soft stop and allow the mechanism to continue moving.

The way we implement this in code is generally a bit finicky, but gets the job done. We would much rather use limit switches to limit movement of mechanisms since they're more reliable and do not require overrides that take up controller buttons.

First off, we create a boolean in our subsystem that represents whether this override is currently active, and we also create setter functions to change this variable.

```java
public class Elevator extends SnailSubsystem {

    private CANSparkMax primaryMotor;
    private CANEncoder primaryEncoder;

    private boolean overridePrimaryEncoder;

    public Elevator {
        primaryMotor = new CANSparkMax(ELEVATOR_PRIMARY_MOTOR_ID, MotorType.kBrushless);
        primaryEncoder = new CANEncoder(primaryMotor);

        overridePrimaryEncoder = false;
    }

    @Override
    public void update() {
        if (!overridePrimaryEncoder) {
            if (primaryEncoder.getPosition() < 0 && speed < 0) speed = 0;
            if (primaryEncoder.getPosition() > ELEVATOR_MAX_HEIGHT && speed > 0) speed = 0;
        }

        ... // do stuff with speed
    }

    public void setPrimaryEncoderOverride(boolean override) {
        overridePrimaryEncoder = override;
    }
}
```

Now that we have this system set up in our subsystem, we need to actually trigger it when we press a button. We can do this in our `ManualElevatorCommand`, which is when we actually set the speed of our elevator via the joystick. We can add a `BooleanSupplier` in addition to the `DoubleSupplier` in our command that will provide the override. Then, in the command we can constantly set the override in our subsystem to this value.

```java
public class ManualElevatorCommand extends CommandBase {

    private Elevator elevator;
    private DoubleSupplier speedSupplier;
    private BooleanSupplier overrideSupplier;

    public ManualElevatorCommand(Elevator elevator, DoubleSupplier speedSupplier, BooleanSupplier overrideSupplier) {
        this.elevator = elevator;
        this.speedSupplier = speedSupplier;
        this.overrideSupplier = overrideSupplier;
    }

    @Override
    public void execute() {
        elevator.setSpeed(speedSupplier.getAsDouble());
        elevator.setPrimaryEncoderOverride(overrideSupplier.getAsBoolean())
    }
}
```

Finally in `RobotContainer`, we can just pass in another function from our controller for `ManualElevatorCommand`.

```java
elevator = new Elevator();
elevator.setDefaultCommand(new ManualElevatorCommand(elevator, operatorController::getRightY, operatorController::getAButton);
```

With this, we're done! Our A button will now override the encoder for our elevator.
