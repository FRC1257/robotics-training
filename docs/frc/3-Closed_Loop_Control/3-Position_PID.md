# Position PID

We now have a basic overview of what PID does. For a quick summary, we use a combination of various terms to drive our error in some field to 0. For instance, our error could be our distance from the setpoint, our difference between desired velocity and current velocity, our angular displacement from a setpoint, etc.

Right now, we will go over position PID, or PID that tries to bring a mechanism to a desired position. In this case, our `error` term will be the difference between our currently measured position and our desired position. We use position PID very often in robotics. For instance, we frequently use it on our drivetrain to turn to angles and to drive specific distances. Additionally, on mechanisms such as arms or elevators, we use PID to move to specific setpoints that allow us to score game pieces.

There are two main implementations of PID that we can use, `PIDController` on the RoboRIO or the SPARK MAX onboard PID. For RoboRIO PID, we run a PID controller on the RoboRIO itself and it then sends those calculations to the motor controller. This works no matter what type of motor controller you are using. It is also highly customizable. However, we can also use SPARK MAX onboard PID, which is built into the SPARK MAX motor controller and allows us to run PID commands on the actual motor controller. When we run onboard PID, it can run at much, much faster rates than what is possible on the RoboRIO board.

In the next two sections, we will go over both of the methods to set up PID control on our subsystems. In the third page, we will go over more general information that applies to both.

## Why We Might Use PIDController on a SPARK MAX

Sometimes, we might choose to use the RoboRIO `PIDController` over the SPARK MAX because `PIDController` gives us way more flexibility in terms of what we do with that output. For instance, when we do PID control on our drivetrain to drive a straight distance, we use `PIDController` because it allows us to pass that value into the `arcadeDrive()` function and then pass another custom variable for turning speed into the second parameter of `arcadeDrive()`. If we used the onboard SPARK MAX PID, then we would not be able to do this since the calculated PID value would automatically be sent to the motor on a per controller basis.
