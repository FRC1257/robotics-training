# Match Structure

## Autonomous vs. Teleoperated

Competition matches are divided into two main periods: *autonomous* and *teleoperated* (teleop). In autonomous, the robot can move/score independent of driver control, running *solely* on code (there are exceptions to this in some years, e.g. 2019, where both driver control and autonomous routines were legal). Subsequently, in teleop, the robot is controlled by the drive team.

Once the match starts, autonomous begins and it lasts for 15 seconds. Then, teleop begins and lasts for 135 seconds. The match ends when teleop ends.

During the autonomous period, we generally want to score points and position the robot appropriately for teleop. Thus, we tend to do a lot of preparation for this period. (See the [Autonomous section](https://frc1257.github.io/robotics-training/#/frc/4-Autonomous/README) for more details.)

## Robot.java

Inside of the file `Robot.java`, there are two types of general functions the robot executes: `init()` functions, which run at *the beginning of* specific times, and `periodic()` functions, which run *during* specific times. The `init()` functions are as follows:

- `robotInit()` - run once, after the robot is finished powering on
- `autonomousInit()` - run once at the start of autotonomous
- `teleopInit()` - run once at the start of teleop

and the `periodic()` ones are constantly executed at a rate of 50 times per second (50 Hz)

- `robotPeriodic()` - run if the robot is on
- `autonomousPeriodic()` - run periodically during autotonomous
- `teleopPeriodic()` - run periodically during teleop


