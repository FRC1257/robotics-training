# To tune a drivetrain:

**Step 1:** set all the motors to follow the front left.

**Step 2:** disable washout.

**Step 3:** Graph voltage versus velocity, and set `kFf` to the y-intercept plus the inverse of the slope.

**Step 4:** set `kP` to 0.01 and then tune.

**Step 5:** repeat Steps 1-3 for the front right.

**Step 6:** set the back left and right to follow their respective front motors.
