# Following Trajectories

Following trajectories requires a lot of code, but luckily, most of the code has already been written! It still needs to be tested though, so if anyone does test it, please either edit this article to reflect the changes from testing or leave an issue in GitHub describing what needs to be changed!

## Programming

For now, all of the code for a drivetrain that implements the following features is available here: [https://github.com/Ryan10145/frc-drivetrain](https://github.com/Ryan10145/frc-drivetrain)

This was written by a former FRC 1257 programming captain but was never tested before he graduated. If it's ever fully tested, it can be moved to the official 1257 GitHub account. To use the code in this project, it is best to download the project and then just copy and paste the subsystem file as well as all of the commands into the current robot project. Make sure you also copy and paste all of the required constants from `Constants.java` as well.

### Features

- Basic manual drive that just sends joystick inputs directly to the drivetrain
- Velocity drive that converts joystick inputs to real world units and uses velocity PID to ensure the drivetrain follows those
- Reverse drive and slow turn
- Segmented trajectory components (drive distance and turn angle) using basic positional PID
- Drive distance implemented using motion profiling for better control over acceleration / deceleration
- Following PathWeaver trajectories
- Full SmartDashboard/Shuffleboard support for outputting diagonostic data and tuning

TODO: Finish this section

## Tuning

After adding the code, we now have to tune all of the PID constants for following the path. During these times, it is critical to have plenty of good graphs, which is why the `outputValues()` function of the given drivetrain has so much in it. Additionally, to make tuning easy, there are tons of parameters defined in the `tuningInit()` and `tuningPeriodic()` functions. For a refresher on how exactly all of this works, please check out the sections on Shuffleboard.

> [!WARNING]
> While running autonomous, the max velocity and acceleration you set should be **much** lower than the physical limits of the robot. Slow = smooth, smooth = fast. There's no point in having our robot going at mach speeds if it's a) dangerous or b) not
> tracking the path well.

The first step is to make sure that our velocity drive is working. The first step is to just try the robot out with very small PID constants for the velocity drive. Then, adjust only the feedforward as much as possible until the velocity very closely matches the setpoint. Then, you can add a tiny bit of P and maybe even D to get the tracking working perfectly (D shouldn't be necessary and you should not add I). Make sure both wheels are very quickly following the setpoints.

While doing the above, also double check the gyroscope to make sure it is giving correct readings for the robot angle. Clockwise should be positive and counterclockwise should be negative. Additionally, check the readings from the odometry in the drivetrain class. Remember +x should be straight ahead for the robot relative to where it began, and +y should be straight left (as if you're at the origin and facing the positive x axis).

After this, take a very small sample straight-line path from PathWeaver. This path should **not** be a real autonomous and should only be around a meter or so long. Set up a command so that as long as a button is pressed, the command to follow that path runs. Note that safety is the **number one priority**. A different person should be ready to e-stop the robot. Everyone on all sides of the robot must be in a safe spot because the robot could malfunction. This is especially important if the code is still untested (change this line if the code has been tested now). During these tests, the max velocity during the path should also still be set **much much** lower than even the one you plan on using for real autonomous. It is much better to have the program fail because the values are too small then to have it fail because the values are too large.

After all of this is done and it looks good, run a small sample S-curve path to test if the heading works as well. Follow all of the safety precautions from the previous section as well.

If all of this is looking good, gradually increase the speed and the size of the paths run.
