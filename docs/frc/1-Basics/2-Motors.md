# Motors

Now that we've gone over formatting and other soft details, it's time to dive into the technical side. We'll first start with motors.

## Terminology

An actuator is defined as "a component of a machine that is responsible for moving and controlling a mechanism or system." For our purposes, we need only consider *motors* and *pneumatics*.

Our robot is essentially entirely made up of motors. All moving components are controlled by motors or pneumatics, and our job as programmers is to figure out how to convert drive team input into the robot actually doing its job. For instance, programming can make sure that certain motors move when drive team pushes buttons or joysticks on a game controller.

First, some clarification:

- *motor* - the actual physical part that spins
- *motor controller* - facilitator that takes in and sends signal to control the motor accordingly

Motors are widely used throughout most, if not all of our robot's subsystems, e.g. on the drivetrain. At the time of writing, 1257 mainly uses NEO Brushless and NEO 550 motors, by REV Robotics.

![SPARK MAX](img/SPARKMAX.png ':size=330x310') ![NEO 550](img/NEOvs550.png ':size=330x230')

To control these motors and actually manipulate a robot mechanism, we interface, or connect to them, with the corresponding motor controllers. For each of the motor controllers on the actual robot, we have an `object` in code that represents it.

## Setup & Control

> [!NOTE]
> We're just going to go over the syntax of how to create a motor, don't worry about creating the full fledged program around them yet. We will go over this in depth when we program our first subsystem.

```java
 //  Import the required class from the Rev Robotics library (don't worry about memorizing this)
import com.revrobotics.CANSparkMax;

// Declare a SPARK MAX motor controller in code that will represent the motor on our robot.
CANSparkMax motor;

// Initialize the motor controller object with an ID and set its type to a brushless motor
motor = new CANSparkMax(0, MotorType.kBrushless);

// Set the motor to "brake" mode
motor.setIdleMode(IdleMode.kBrake);

// Set a current limit of 80 amps to the motor
motor.setSmartCurrentLimit(80);
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

### Following

For certain subsystems, we'll have multiple motors working in sync. In other words, we might want to have two motors mimick each other and have the same output at all times. At this point, you might program it like this:

`motor1.set(VALUE);` and `motor2.set(VALUE);`

Here, both motor objects are referenced, with one output variable being passed into both. However, this is pretty inefficient. What we can do instead is treat `motor2` as a **secondary** motor and have it **follow** the primary motor:

`motor2.follow(motor1);`, `motor1.set(VALUE);`

This way, we won't have to worry about commanding both motor objects in code, as `motor2` should always mirror the output of `motor1`.

## Commanding Motors

Now, to apply power to the motor and make it move at a speed, we can use `motor.set(VALUE)`. `VALUE` could be a decimal between -1.0 and 1.0, with 1.0 meaning full speed forward, 0.0 meaning no speed/movement, and -1.0 meaning full speed reverse.

## Other Motor Controllers

The SPARK MAX is not the only motor controller we could use -- in the past, 1257 has used Talon SRXs and Victor SPXs (both by [CTRE](http://www.ctr-electronics.com/control-system.html?p=3)).

While the motor controller may differ, the general process of controlling the motor is most the same. If Talon SRXs were being used, changes would go towards the class name (now `WPI_TalonSRX`) and any functions taken from that class (e.g. `setIdleMode()` would go to `setNeutralMode()`, and `setSmartCurrentLimit()` would be `enableCurrentLimit()`.

```java
import com.ctre.phoenix.motorcontrol.can.WPI_TalonSRX;

WPI_TalonSRX motor;

motor = new WPI_TalonSRX(0);
motor.setNeutralMode(NeutralMode.Brake);
motor.configContinuousCurrentLimit(80);
motor.enableCurrentLimit(true);
motor.follow(otherMotor);
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
secondaryMotor.follow(primaryMotor);

ejectMotor = new WPI_TalonSRX(2);
ejectMotor.setNeutralMode(NeutralMode.Coast);
ejectMotor.configContinuousCurrentLimit(80);
ejectMotor.enableCurrentLimit(true);



primaryMotor.set(1.0); // this would command secondaryMotor as well
ejectMotor.set(-0.5);
```

---

We will organize all of this material into an actual subsystem class soon -- the important part here is the basic idea of setting up motor controller objects in our code and then setting them.
