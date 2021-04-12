# Segmented Trajectories

As mentioned in the overview, one of the most difficult parts of the autonomous routine is maneuviring the robot around the field efficiently. The first method we will use to solve this problem is through segmented trajectories, which just means that we use a combination of driving straight forward a specific distance and turning a specific distance to reach our final destination. For simplicity's sake, we normally use only 90 degree angles while doing this to reduce the propagation of error in our final result as much as possible.

To make these trajectories, we need to define two key commands: one that drives the robot straight forward a specific distance and another that turns a specific angle. We will handle turning a specific angle first.

## Turn Angle Command

Turning a specific angle is very similar to the types of problems we've analyzed in the previous closed loop control section, so we will use a PID controller to solve this. We can retrieve the current angle of the robot from the gyroscope that we discussed in the section on sensors. We can simply use this as an input to a WPILib `PIDController` and pass the setpoint as the angle we want to go to. We won't go over the full details since it's pretty similar to the sections on position PID control, but you can check previous years' code or the example programs folder to find the code for this.

## Drive Distance Command

The driving distance command poses a bit more of an issue because of the constraint that we must drive straight. This might appear to not be an issue because we could simply command the left and right sides of the drivetrain to the same output and the drivetrain should go straight. However, this is not always the case due to external factors. A tiny bump to our robot from uneveness in the field carpet could send it out of alignment and cause our auto to miss. As a result, when we create our command to drive a specific distance, we also want to include some code to ensure that the robot maintains its angle and drives in the same direction.

We can accomplish this through just simple P control (no need for a full PID controller). This is because we just need to make small adjustments to our drivetrain because we don't expect to have to rotate a large angle or combat a large amount of steady state error just to maintain our heading. We just need a tiny bit of correct and just a bit of P control does the job well. As a result, there's also need to take out a fully fledged WPILib `PIDController` for this task. We can simply program the P control ourself.

We can just add a tiny bit of code to handle this in the `DRIVE_DIST` section of our switch statement in the `update()` function of our subsystem.

```java
// typical PID control on the distance travelled
double forwardOutput = distancePIDController.calculate(leftEncoder.getPosition(), distSetpoint);
forwardOutput = MathUtil.clamp(forwardOutput, -DRIVE_DIST_MAX_OUTPUT, DRIVE_DIST_MAX_OUTPUT);

// calculate P control for maintaining our current angle
double turnOutput = (angleSetpoint - Gyro.getInstance().getRobotAngle()) * DRIVE_DIST_ANGLE_P;
differentialDrive.arcadeDrive(forwardOutput, turnOutput);
```

Besides this, doing the rest of the drive distance command isn't too difficult, and if you need to see a full example, check out previous years' code or the example code.

## Wrapping Up

With these two commands defined, we can make autos! The next few sections will cover a more advanced form of drivetrain trajectories, but those require a ton more tuning and testing before they can be consistently used by our team. For now, we recommend just moving on to to reading about command groups where you'll learn about how we string together multiple commands to form an autonomous routine.

One thing to note is that in previous years, we have already programmed the necessary commands to control our drivetrain. As a result, we frequently copy the code from the drivetrain from year to year without having to reprogram it. However, understanding how these commands work will help a lot towards better understanding our robot.
