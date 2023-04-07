# Generating Trajectories on the Robot
In the 2023 season, the team experimented with a fully customizable auto. We did this by using the Shuffleboard to choose score positions for our auto and then generating trajectories on the robot. 

## Creating Sendable Choosers
In order to create a fully customizable auto, we needed to create a way to choose score positions. We did this by creating a Sendable Chooser for each score position. 

```java
// Create a Sendable Chooser for the score position
SendableChooser<ScorePosition> scorePositionChooser = new SendableChooser<>();

// Add the score positions to the Sendable Chooser
// Configure default score position and the place it starts at
scorePositionChooser.setDefaultOption("Left", ScorePosition.LEFT);
// add other options
scorePositionChooser.addOption("Center", ScorePosition.CENTER);
scorePositionChooser.addOption("Right", ScorePosition.RIGHT);

// Add the Sendable Chooser to the Shuffleboard
SmartDashboard.putData("Score Position", scorePositionChooser);

```

We also used booleans to choose certain parts of our auto. We set them the same way any other data can be put on the dashboard.

```java
// Create a boolean for whether or not to shoot
boolean shoot = false;

// Add the boolean to the Shuffleboard
SmartDashboard.putBoolean("Shoot", shoot);

// Get the boolean from the Shuffleboard
shoot = SmartDashboard.getBoolean("Shoot", false);
```

## Generating Trajectories
We used [PathWeaver](https://docs.wpilib.org/en/stable/docs/software/wpilib-tools/pathweaver/index.html) to estimate the coordinates for certain positions on the field. We stored these positions as constants in the `Constants.java` file in a separate class called `Autonomous`. 

In order to create autos, we created a class called [`GenerateTrajectories`](https://github.com/FRC1257/2023-Robot/blob/master/src/main/java/frc/robot/commands/GenerateTrajedies.java) that would use the information sent on the shuffleboard to generate trajectories for the robot to follow as well as coordinate movements for the robot to do to score.

We then used [WPILib Trajectory Generation](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/trajectories/trajectory-generation.html#trajectory-generation) to generate trajectories from those coordinates. We made a `ToPosCommand` to handle creating and following a trajectory with a given set of waypoints.

```java
public class ToPosCommand extends CommandBase { 
    private final Drivetrain drivetrain;
    private Trajectory trajectory;

    // save the points for debugging
    private List<Pose2d> points;

    public ToPosCommand(Drivetrain drivetrain, List<Pose2d> trajPoints, boolean reverse) { 
        this.drivetrain = drivetrain;
        points = trajPoints;
        
        // create the config for the trajectory
        // basically constrains the trajectory
        // controls the max velocity & acceleration
        // also tell if the trajectory should be reversed
        TrajectoryConfig config = new TrajectoryConfig(DRIVE_TRAJ_MAX_VEL, DRIVE_TRAJ_MAX_ACC).setReversed(reverse);
        // create the trajectory using the config and waypoints
        this.trajectory = TrajectoryGenerator.generateTrajectory(trajPoints, config);

        addRequirements(drivetrain);
    }

    @Override
    public void initialize() {
        drivetrain.driveTrajectory(trajectory);
    }
```

Once we had the `ToPosCommand`, we could use it to create a command group that would follow the trajectory and then do the movements needed to score. The rest was as easy as Scratch programming

```java
private void normalAuto() {
    if (firstScore) { // boolean from Shuffleboard
        // tell it how to score
        if (getConeOrCube()) { // tell it if it is at a cone or cube score pose
            addScoreMidCone();
        } else {
            addScoreMidCube();
        }
    }

    if (charge) { // boolean from Shuffleboard
        // create waypoints to go to the charge station and
        // make a ToPosCommand to follow the trajectory
        addChargeTrajectory();
        // then add another command to balance
        this.command.addCommands(new PDBalanceCommand(drivetrain, true));
    } else if (goToCyclePose) { // boolean from Shuffleboard
        // same thing
        // create waypoints to go to the cycle pose
        // make a ToPosCommand to follow the trajectory
        addCycleTrajectory();
        return;
    }

    // if none of these have run something has gone wrong
    // so just leave the community
    if (StartPose.equals(currentPose)) {
        addLeaveCommunityTrajectory();
    }
    
    // adds a command to turn 180
    turn180();
    
}
```

That's it! We used this sort of structure to create multiple more autos: for example hit and run, 3 piece auto, and move forward.

TODO 