# PID

PID stands for *proportional*, *integral*, and *differential*, and is used for precisely controlling our robot autonomously. 
Controlling the robot is harder than it may seem at first. A simple autonomous task, like getting the robot to drive in
a horizontal line for a specified distance, is much harder than `Motor.set(speed)`, as there are multiple sources of error
that throw the robot off, such as slight angle changes when placed onto the field, friction, and others. 
Thus, we use PID to keep our robot on the right path.

### Function

To use PID, first set a setpoint (that is, your goal). PID will use data from sensors to calculate the robot's actual point,
and then will calculate an `error`, which is `setpoint - actual point`. PID will then calculate an output based on some 
constants `Kp, Ki, Kd` and `error`: `output = Kp*error + Ki*error*time + Kd*error`. 

For example, if we want to drive in a horizontal line, we may set our angle `setpoint` to `0`, and then have gyro sensors 
record the angle at which we're actually going. 

### Syntax

See [here](http://first.wpi.edu/FRC/roborio/release/docs/java/edu/wpi/first/wpilibj/PIDController.html) to initiate it.
Then, running `PIDController.enable();` will run the PID control loop, which involves the controller repeatedly calculating 
error and output. 

See our [DriveTrain](https://github.com/FRC1257/2018JavaRewrite/blob/master/src/main/java/org/usfirst/frc/team1257/robot/subsystems/DriveTrain.java)
for an annotated example.
