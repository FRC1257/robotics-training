# Motors

Now that we've gone over the overall structure and other details, let's get into actually learning some components of the robot, starting with the motors.

## Terminology

An actuator is defined as "a component of a machine that is responsible for moving and controlling a mechanism or system." For our purposes, we need only consider *motors* and *pneumatics*.

Our robot is essentially entirely made up of motors. All moving components are controlled by motors or pneumatics, and our job as programmers is to figure out how to convert drive team input into the robot actually doing its job. For instance, programming can make sure that certain motors move when drive team pushes buttons or joysticks on a game controller.

Motors are widely used throughout most, if not all of our robot's subsystems, e.g. on the drivetrain. When we have a motor, we can have our robot code apply a voltage to the motor, which will cause it to spin. On our robot, this motor will be attached to a gearbox and other mechanical contraptions to transform this rotational motion into the motion desired for the robot. At the time of writing, 1257 mainly uses NEO Brushless and NEO 550 motors made by REV Robotics.

![SPARK MAX](img/SPARKMAX.png ':size=330x310') ![NEO 550](img/NEOvs550.png ':size=330x230')

Every motor is attached to something called a **motor controller**.

- *motor* - the actual physical part that spins
- *motor controller* - facilitator that takes in and sends signal to control the motor accordingly

For each of the motor controllers on the actual robot, we can create an object in code that represents this motor. By using functions that this object owns, we can send instructions to these motors.

## Setup & Control

> [!NOTE]
> We're just going to go over the syntax of how to create a motor, don't worry about creating the full fledged program around them yet. We will go over this in depth when we program our first subsystem.

```java
 //  Import the required class from the Rev Robotics library
import com.revrobotics.CANSparkMax;

// Declare a SPARK MAX motor controller in code that will represent the motor
CANSparkMax motor;

// Initialize the motor controller with an ID and set its type to a brushless motor
motor = new CANSparkMax(0, MotorType.kBrushless);

// Set the motor to "brake" mode
motor.setIdleMode(IdleMode.kBrake);

// Set a current limit of 80 amps to the motor
motor.setSmartCurrentLimit(80);

// Set the motor to not be inverted
motor.setInverted(false);
```

### Motor IDs

For each of the motor controllers on our robot, they will have something known as a **motor ID**. This allows us to distinguish motors so that we can control the correct ones. Electronics normally determines what each motor ID will be, so we have to communicate with them and get these motor IDs. For almost all motors, this will be passed into the constructor like above.

### Brushed vs Brushless

There are two main types of motors: brushed and brushless. The only supported brushless motors as of now are the NEOs, NEO 550s, and the Falcon 500. Additionally, the only motor controller that can run brushless motors are the SPARK MAXes and the Falcon 500s (the Falcon 500 is a motor and motor controller combined). As such, we only have to specify brushed vs brushless when we choose to use SPARK MAXes. You can read about [Brushed vs. Brushless motors](https://cordlessdrillzone.com/drill-wars/brushless-vs-brushed-motor/).

A great feature of the SPARK MAX controller is that it can handle both brushless and brushed motors. This versatility is very convenient for teams that have many brushed motor spares, as it allows for quick motor replacement if a NEO/NEO 550 is broken. If a motor change from brushless to brushed is made, all that needs to be updated is `MotorType.kBrushless` to `MotorType.kBrushed`, and vice versa.

### Brake vs Coast

All motor controller support the option to set the motor controller in either `brake` or `coast` mode. The main difference between the two comes when no output is given to the motor and the motor is still spinning. In `brake` mode, the motor will actively resist the motion and attempt to "brake." In `coast` mode, the motor will continue to freely spin until friction slows it down. For different mechanisms, we will choose which one to use, although we generally use `brake` mode for most subsystems.

### Current Limiting

To make motors run, the electrical system supplies a "current" to the motor, measured in amperes, or amps for short. Normally, when there is nothing attached to the motor and the motor can freely spin, the motor runs perfectly fine with a normal amount of current draw. However, if there is a significant load or something impeding the rotation of the motor, then the current draw can spike. Sustained amounts of current draw can severely damage electrical components and even permanently damage motors. While our robot does have breakers and fuses to prevent severe electrical damage from occurring, motors can still become severely damaged if we draw too much current.

Fortunately, most motor controller support `current limiting`, which allows us to specify a limit for the maximum current our motor can draw. It's **absolutely necessary** to set an appropriate limit as a safety, such that risk of overdrawing/damaging the motor is reduced.

For larger motors such as our NEOs or CIMs, we can set a limit of around `80A`. For smaller motors such as the fragile NEO 550s, we can set a limit of around `25A`.

### Inversion

Sometimes, our motors may be facing in direction so that when we apply a positive output, the mechanism does not move in the desired direction. While this could be solved by always multiplying the value passed in by `-1`, this can be confusing and lead to bugs. However, what we can do instead is set the motor to be "inverted", which will flip which direction corresponds to positive. We can do this in code by using `.setInverted(true)` on the desired motor.

### Following

For certain subsystems, we'll have multiple motors working in sync. In other words, we might want to have two motors mimick each other and have the same output at all times. At this point, you might program it like this:

`motor1.set(VALUE);` and `motor2.set(VALUE);`

Here, both motor objects are referenced, with one output variable being passed into both. However, this is pretty inefficient. What we can do instead is treat `motor2` as a **secondary** motor and have it **follow** the primary motor:

`motor2.follow(motor1);`, `motor1.set(VALUE);`

This way, we won't have to worry about commanding both motor objects in code, as `motor2` should always mirror the output of `motor1`.

#### Following and Inverting

One particular case we have to look at is when we want to make a motor follow another motor to mirror its output, but they have to run in opposite directions. This could occur if the motors are connected to the same mechanism, but are flipped. Specifically for the `SPARK MAXes`, instead of doing `.setInverted()` (which would have 0 effect), we would pass this as a second argument into the `.follow()` command.

```java
motor2.follow(motor1, true);
```

## Commanding Motors

Now, to apply power to the motor and make it move at a speed, we can use `motor.set(VALUE)`. `VALUE` could be a decimal between -1.0 and 1.0, with 1.0 meaning full speed forward, 0.0 meaning no speed/movement, and -1.0 meaning full speed reverse.

## Other Motor Controllers

The SPARK MAX is not the only motor controller we could use -- in the past, 1257 has used Talon SRXs and Victor SPXs (both by [CTRE](http://www.ctr-electronics.com/control-system.html?p=3)).

While the motor controller may differ, the general process of controlling the motor is most the same. If Talon SRXs were being used, changes would go towards the class name (now `WPI_TalonSRX`) and any functions taken from that class (e.g. `setIdleMode()` would go to `setNeutralMode()`, and `setSmartCurrentLimit()` would be `configContinuousCurrentLimit()`.

```java
import com.ctre.phoenix.motorcontrol.can.WPI_TalonSRX;

WPI_TalonSRX motor;

motor = new WPI_TalonSRX(0);
motor.setNeutralMode(NeutralMode.Brake);
motor.configContinuousCurrentLimit(80);
motor.enableCurrentLimit(true);
motor.follow(otherMotor);
motor.setInverted(false);
```

> [!TIP]
> The syntax for something like a Victor SPX would be pretty much the exact same as above, except that the Victor SPXes do not support current limits.

## Example

Here is some example code that can be used to set up three motors, make a pair follow each other, and then command the three to move.

```java
// include all needed import statements here

CANSparkMAX primaryMotor;
CANSparkMAX secondaryMotor;

WPI_TalonSRX ejectMotor;

primaryMotor = new CANSparkMAX(0, MotorType.kBrushless);
primaryMotor.setIdleMode(IdleMode.kBrake);
primaryMotor.setSmartCurrentLimit(80);

secondaryMotor = new CANSparkMAX(1, MotorType.kBrushless);
secondaryMotor.setIdleMode(IdleMode.kBrake);
secondaryMotor.setSmartCurrentLimit(25);
// invert the follower motor with respect to the primary motor
secondaryMotor.follow(primaryMotor, true);

ejectMotor = new WPI_TalonSRX(2);
ejectMotor.setNeutralMode(NeutralMode.Coast);
ejectMotor.configContinuousCurrentLimit(80);
ejectMotor.enableCurrentLimit(true);



primaryMotor.set(1.0); // this would command secondaryMotor as well
ejectMotor.set(-0.5);
```

---

We will organize all of this material into an actual subsystem class soon -- the important part here is the basic idea of setting up motor controller objects in our code and then setting them.
