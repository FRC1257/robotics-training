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

### Using FRC-Drivetrain

Using this drivetrain is simple since pretty much everything including the commands is already written. The purpose of this article is to just go over a basic overview of how they work.

To actually learn how to implement these features, check out the drivetrain code and the `RobotContainer` class to see an example.

#### Velocity Drive

The first key difference between this drivetrain and other drivetrains you may have written / seen is that it uses velocity drive. In the drivetrain that we wrote in the beginning section, we took the controller input between -1.0 and 1.0 and send this directly to the drivetrain. While this works well in most cases, it can have drawbacks. One of these is that this design is constrained by the voltage of our battery, which can fluctuate over time. As a result of this, the same motor input can actually lead to different speeds. Another drawback is that the input sent to the motor is not linear with respect to the motor speed.

An alternative way of approaching the problem is to use velocity drive. The way it works is that we first define a max linear and rotational speed of our drivetrain in units such as m/s or rad/s. When we get an input from our controller, we multiply it by our max speeds to get adjusted speeds. We then convert these to exact wheel drive speeds and pass these into a velocity PID controller that makes our wheel go at exactly that speed.

This method fixes both drawbacks from before as it uses a controller to strictly enforce that we are going at the desired speed. It also fixes the non-linearity of the motor output as we now have exact control over the output speed of our motor when we send it to the velocity PID controller.

Of course, there are drawbacks to this method as well. Velocity drive can put a lot more strain on our motors especially when the battery voltage is running low and we're still trying to go at max speed. Additionally, deceleration can be a severe issue since when we abruptly change out desired velocity from full speed to 0, the sudden deceleration can cause our robot to tip over. This will be fixed through something known as a **slew rate limiter**.

A slew rate limiter takes in a stream of values and essentially enforces a speed limit on how fast it can change. Check out the file `VelocityDriveCommand` to see how this works. Basically it takes the motor input from the controller and enforces that it cannot drop from max speed to 0 instantly. Instead, it will only allow it to decrease by the speed limit, which might be something like 0.3 m/s^2. This helps resolve our tipping issue at the cost of some driver control. If the slew rate limit is set too low, then the driver will have a hard time doing quick, snappy movements since the drivetrain will take more time to decelerate. If the slew rate limit is too high, there is an issue of tipping.

While this velocity drive doesn't seem entirely related to trajectories, getting it working is a key part of getting trajectories running because we need to tune our velocity PID. When running a trajectory, we use the same velocity PID controllers to ensure the robot tracks the trajectory well.

#### Trajectories

For following trajectories, we combine the PathWeaver generated trajectories with something known as a Ramsete controller. The way a trajectory works is that at every point along the path, it generates the desired robot heading (angle) and robot speeds. The Ramsete controller takes in these inputs and then spits out the wheel speeds needed to ensure this trajectory is actually followed. The exact implementation details aren't too complicated, but are omitted here.

To actually follow a trajectory, first maek sure the previous step for generating trajectories were followed so that the trajectory `.json` files are now in the deploy folder. Then, you want to make a new command that will follow the path. The way you should do this is by first making a command that will represent the autonomous routine you want to follow. For an example, see `commands/auto/ForwardPath.java`. Note that this is a `SequentialCommandGroup`, which is a topic we haven't covered yet but will in the next section.

In the constructor, all we need to do is just load the trajectory from the file using the `Trajectories.loadTrajectoryFromFile` function. Then, we can just create a new `DriveTrajectoryCommand` that will take in that trajectory and the drivetrain to follow that trajectory.

## Tuning

After adding the code, we now have to tune all of the PID constants for following the path. During these times, it is critical to have plenty of good graphs, which is why the `outputValues()` function of the given drivetrain has so much in it. Additionally, to make tuning easy, there are tons of parameters defined in the `tuningInit()` and `tuningPeriodic()` functions. For a refresher on how exactly all of this works, please check out the sections on Shuffleboard.

> [!WARNING]
> While running autonomous, the max velocity and acceleration you set should be **much** lower than the physical limits of the robot. Slow = smooth, smooth = fast. There's no point in having our robot going at mach speeds if it's a) dangerous or b) not
> tracking the path well.

The first step is to make sure that our velocity drive is working. The first step is to just try the robot out with very small PID constants for the velocity drive. Then, adjust only the feedforward as much as possible until the velocity very closely matches the setpoint. Then, you can add a tiny bit of P and maybe even D to get the tracking working perfectly (D shouldn't be necessary and you should not add I). Make sure both wheels are very quickly following the setpoints. While at this point, it would also be a good idea to adjust the slew rate limit to ensure the robot drives well if you're planning on using velocity drive during competition.

While doing the above, also double check the gyroscope to make sure it is giving correct readings for the robot angle. Clockwise should be positive and counterclockwise should be negative. Additionally, check the readings from the odometry in the drivetrain class. Remember +x should be straight ahead for the robot relative to where it began, and +y should be straight left (as if you're at the origin and facing the positive x axis).

After this, take a very small sample straight-line path from PathWeaver. This path should **not** be a real autonomous and should only be around a meter or so long. Set up a command so that as long as a button is pressed, the command to follow that path runs. Note that safety is the **number one priority**.

A different person should be ready to e-stop the robot. Everyone on all sides of the robot must be in a safe spot because the robot could malfunction. This is especially important if the code is still untested (change this line if the code has been tested now).

During these tests, the max velocity during the path should also still be set **much much** lower than even the one you plan on using for real autonomous. It is much better to have the program fail because the values are too small then to have it fail because the values are too large.

After all of this is done and it looks good, run a small sample S-curve path to test if the heading works as well. Follow all of the safety precautions from the previous section as well.

If all of this is looking good, gradually increase the speed and the size of the paths run.
