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

To control these motors and actually manipulate a robot mechanism, we interface with the corresponding motor controllers--this is what we do in code. A NEO-type motor is controlled with a SPARK MAX controller (also by REV Robotics).

## Setup & Control

We need to do a couple of things in our program before actually controlling a motor: 

1. `CANSparkMax motor;` - Declare a SPARK MAX motor controller 
2. `motor = new CANSparkMax(MOTOR_ID, MotorType.kBrushless);` - Initialize the object with an ID and set it to interface with a Brushless motor**
3. `motor.setIdleMode(IdleMode.kBrake);` - Set the motor to "brake" mode
4. `motor.setSmartCurrentLimit(80);` - Set a current limit of 80 amps to the motor
5. `import ...;` - Done all of the above with the corresponding vendor dependency file and imports (WPILib-VSCode should assist you with this, or you can refer to old 1257 code)

**Remember that all IDs should be stored in the static class `ElectricalLayout` of `Constants.java`, so `MOTOR_ID` would be a constant from there.

You can read about [Brushed vs. Brushless motors](https://cordlessdrillzone.com/drill-wars/brushless-vs-brushed-motor/) and [Brake vs. Coast mode](https://www.chiefdelphi.com/t/what-is-brake-coast-mode/163649) for more information. As for current limiting, it's **absolutely necessary** to set an appropriate limit as a safety, such that risk of overdrawing/damaging the motor is reduced.

A great feature of the SPARK MAX controller is that it can handle both brushless (NEO) and brushed motors (CIM, miniCIM, BAG, etc). This versatility is very convenient for teams that have many brushed motor spares, as it allows for quick motor replacement if a NEO/NEO 550 is broken. If a motor change from brushless to brushed is made, all that needs to be updated is `MotorType.kBrushless` to `MotorType.kBrushed`, and vice versa.

Now, to apply power to the motor, we use `motor.set(VALUE)`. "VALUE" is a decimal between -1.0 and 1.0, with 1.0 meaning full speed forward, 0.0 meaning no speed/movement, and -1.0 meaning full speed reverse.

## Following

For certain subsystems, we'll have multiple motors working in sync. In other words, we might want to have two motors mimick each other and have the same output at all times. At this point, you might program it like this:

`motor1.set(VALUE);` and `motor2.set(VALUE);`

Here, both motor objects are referenced, with one output variable being passed into both. However, this is pretty inefficient. What we can do instead is treat `motor2` as a **secondary** motor and have it **follow** the primary motor:

`motor2.follow(motor1);`, `motor1.set(VALUE);`

This way, we won't have to worry about commanding both motor objects in code, as `motor2` should always mirror the output of `motor1`.

## Note

The SPARK MAX is not the only motor controller we could use--in the past, 1257 has used Talon SRXs and Victor SPXs (both by [CTRE](http://www.ctr-electronics.com/control-system.html?p=3)).

While the motor controller may differ, the general process of controlling the motor is most the same. If Talon SRXs were being used, changes would go towards the class name (now `WPI_TalonSRX`) and any functions taken from that class (e.g. `setIdleMode()` would go to `setNeutralMode()`, and `setSmartCurrentLimit()` would be `enableCurrentLimit()`.

<hr>

We will organize all of this material into an actual subsystem class soon--the important part here is *how* to actually work with a motor in our programs.