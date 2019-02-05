# WPILib's PID

### Constructing

Conveniently, WPILib has their own `PIDController` class. To use the class, use the constructor. 
`PIDSource` is the class that is the source of the PID controller. It gets the actual point, which is used to calculate error.
`PIDOutput` is the class that outputs the PID controller. For example,
in our [DriveTrain](https://github.com/FRC1257/2018JavaRewrite/blob/master/src/main/java/org/usfirst/frc/team1257/robot/subsystems/DriveTrain.java), 
find the method `configPIDControllers`. Look at the code of the second construction of a PID controller: 
```
maintainAngleController = new PIDController(Constants.PID.MAINTAIN_CONSTANTS[0], 
Constants.PID.MAINTAIN_CONSTANTS[1], Constants.PID.MAINTAIN_CONSTANTS[2], angleSensorGroup, 
anglePIDOutput);
```
The `Kp`, `Ki`, and `Kd` PID constants are stored in an array called `MAINTAIN_CONSTANTS` 
in the class `PID` in the file `Constants.java`. The next entry, `angleSensorGroup`, is the `PIDSource` since it takes in the 
input, and the last entry, `anglePIDOutput`, outputs the output calculated by the PID loop. 

There are other constructors for `PIDController`. 
Let's not worry about the period for now. The default period of 50 milliseconds.
However, the constructor with the `Kf` term is used to create a PID controller with
feed-foward, which may be useful (especially in subsystems like the elevator).

### Implementation

Usually, constructing the PID controller `PIDController pidcontroller = new PIDController(Kp, Ki, Kd, PIDSource, PIDOutput)` 
and writing `PIDController.enable();` should suffice. However, if need be, the methods from `PIDController` can be overrided 
in the class for PIDOutput. 

### An Example 

Take another look at our [DriveTrain](https://github.com/FRC1257/2018JavaRewrite/blob/master/src/main/java/org/usfirst/frc/team1257/robot/subsystems/DriveTrain.java).
Look at the method `driveDistance(double distance, double timeout, boolean reset)`.
```
public void driveDistance(double distance, double timeout, boolean reset) {

    // Block 1
		EnhancedDashboard.putString("Auto Status", "Driving " + distance + " inches");
		if (reset) resetEncoders();
		angleSensorGroup.reset();
		turnAngleController.disable();

    // Block 2
		distancePIDHelper.setAnglePIDOutput(anglePIDOutput);
		anglePIDOutput.setDistancePIDHelper(distancePIDHelper)

    // Block 3
		maintainAngleController.reset();
		maintainAngleController.setSetpoint(0);

    // Block 4
		distanceController.reset();
		distanceController.setSetpoint(distance);

    // Block 5
		maintainAngleController.enable();
		distanceController.enable();

    // Block 6
		waitUntilPIDSteady(distanceController, timeout);
    
    // Block 7
		EnhancedDashboard.putString("Auto Status", "Drive Complete");
	}
```
Block 1 first sends a message to the driver's dashboard, then resets the PID controllers. 
Block 2 seems weird without first looking at the files `distancePIDHelper.java` and `anglePIDOutput.java`. 
These two `PIDOutput` classes involve each other in their PID control loops. 
Block 3 resets `maintainAngleController` and then sets the controller's `setpoint` to `0`, which is a straight line.
`maintainAngleController` helps us drive in a straight line, so it should be set to `0`.
Block 4 resets the `distanceController` and then sets its `setpoint` to `distance`, which is the distance we want 
the robot to drive.
Block 5 enables both `maintainAngleController` and `distanceController`, making the robot drive while turning an angle of 0 degrees.
That is called a straight line.
Block 6 is what stops the `distanceController`. Since the robot stops driving forward, the control loop of `maintainAngleController` will 
not move the robot.
Block 7 sends a message to the driver's dashboard.
