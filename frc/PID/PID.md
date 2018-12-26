# PID

PID stands for *proportional*, *integral*, and *derivative*, and is a control theory used for precisely controlling our robot or subsystems autonomously or semi-autonomously. 

Controlling the robot is harder than it may seem at first. A simple task where PID control may be used is that of a flywheel shooter.  We simply can't command the shooter to go `Motor.set(speed)` as there are many sources of potential error, especially given that a given input signal may not always result in a given output speed.  PID control lets us "tune" the system, to get sensored input, determine how fast or slow we should be going relative to where we are and where we should be going.

A more complicated autonomous task, like getting the robot to drive in a horizontal line for a specified distance, is much harder than `Motor.set(speed)`, as there are multiple sources of error that throw the robot off, such as slight angle changes when placed onto the field, friction, and others. Thus, we use PID to keep our robot on the right path.

### Function

To use PID, first set a setpoint (that is, your goal). PID will use data from sensors to calculate the robot's actual point,
and then will calculate an `error`, which is `setpoint - actual point`. PID will then calculate an output based on some 
constants `Kp, Ki, Kd` and `error`: `output = Kp*error + Ki*error*time + Kd*derror/dt`. 

For example, if we want to drive in a horizontal line, we may set our angle `setpoint` to `0`, and then have gyro sensors 
record the angle at which we're actually going. 

### Syntax

See [here](http://first.wpi.edu/FRC/roborio/release/docs/java/edu/wpi/first/wpilibj/PIDController.html) to initiate it.
Then, running `PIDController.enable();` will run the PID control loop, which involves the controller repeatedly calculating 
error and output. 

See our [DriveTrain](https://github.com/FRC1257/2018JavaRewrite/blob/master/src/main/java/org/usfirst/frc/team1257/robot/subsystems/DriveTrain.java)
for an annotated example.

### Tuning Constants

Just read [this thread](https://robotics.stackexchange.com/questions/167/what-are-good-strategies-for-tuning-pid-loops) to learn how to tune. You also need to be on a computer with DriverStation on it—the team laptop, for instance.


### Talon SRX PID

The motor controllers we commonly use, the Talon SRX, have onboard PID.  This means that rather than the PID loop executing with our main robot code, we configure the motor controller itself to execute, using a sensor plugged directly into it.  This enables us to run the control loops a magnitude of order faster (maximum 250Hz vs 1KHz).  This can enable better executed control, but may not always be the right solution to the problem of sensored mechanism control.

We can take a look at [Team 2590's 2017 robot](https://github.com/Team2590/FRC2590-2017/blob/master/src/org/usfirst/frc/team2590/subsystem/Shooter.java#L63) code to see how they configured the Talon SRX on their flywheel shooter for PID.  If we look at their [RobotMap.java](https://github.com/Team2590/FRC2590-2017/blob/master/src/org/usfirst/frc/team2590/robot/RobotMap.java#L35) file, we can see that Team 2590 had Just used a `Kp` term, ignoring `Ki` and `Kd` entirely, though the comments suggest they used a `Kf` term at some point during their development.

### Feedforward

The feedforward term, or `Kf` is relevant to PID, but not automatically a part of it.  The idea of a feedforward is that as the PID controller iterates, it includes `Kf` of the prior controller state into it's output, such that prior state is incorporated into current state.  This is known as a PIDF controller.

That being said, our WPI PID Controller doesn't allow us to set a F term upon setup according to the syntax, can we still use a feedforward?  *Yes!*  The WPILib PID Controller actually has one [built-in](https://github.com/wpilibsuite/allwpilib/blob/59700882f1b17d56abec4755a2009c56eec6a28b/wpilibj/src/main/java/edu/wpi/first/wpilibj/PIDController.java#L40), and if we use the correct constructor we can use it all the same.
