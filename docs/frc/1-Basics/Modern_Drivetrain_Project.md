# Project: swerve, localization and autonomous

**Prerequisites:** the [simulated intake](5-First_Subsystem.md), PID, coordinate frames. **Time:** several sessions. **Status:** includes an executable idealized swerve trajectory exercise; it is not a full robot simulator. Do not deploy these exercises to hardware without review.

## Coordinates and module motion

WPILib robot coordinates are +x forward, +y left and counterclockwise positive rotation. Speeds are meters per second and radians per second; pose includes field position and heading. A differential drive steers by varying left/right wheel speeds; swerve modules steer and drive independently. For module location `(x, y)` relative to the center of rotation, ideal velocity is `(vx - omega*y, vy + omega*x)`. Its magnitude and angle are the requested wheel state. Module ordering and geometry must match everywhere.

**Predict:** with pure forward translation every wheel points forward at the same speed; with pure rotation vectors are tangential. Check in the [swerve lab](../../labs/swerve.html). Wheel speed desaturation preserves proportions when a request exceeds the limit. Module optimization can reverse wheel direction to reduce steering rotation. A wrong absolute encoder offset or module order can make straight-line requests veer; check each module at low output with a mentor. [WPILib kinematics](https://docs.wpilib.org/en/stable/docs/software/kinematics-and-odometry/swerve-drive-kinematics.html).

## Odometry and vision

Integrate gyro heading and measured module positions to estimate pose. Odometry drifts with slip and sensor error. Convert field-relative requests using heading; a heading sign or zero error rotates the response. Fuse calibrated vision pose estimates at their capture timestamps with uncertainty, rather than replacing pose with every frame. Follow [PhotonVision setup](../../vision/PhotonVision/Setup.md) and [integration](../../vision/PhotonVision/Code.md). Compare odometry-only and fused tracks to a separately known pose; neither is automatically ground truth.

## Autonomous and logging

A path is geometry; a trajectory adds timing, velocity and acceleration constraints. Choose a starting pose and frame, generate a short path using the team's version-matched PathPlanner setup, reset pose consistently, and follow it in simulation. Log target and measured pose, chassis speeds, module states, command state and timestamps. Check initial heading, units, alliance/field transforms, and interruption behavior if the robot moves in the wrong direction. Run the same path with deliberately incorrect heading in simulation and identify its signature in the log. Don't interpret the resulting ideal simulation as a hardware performance claim.

Team reference: [2026 drive implementation](https://github.com/FRC1257/2026-Robot/tree/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/drive), [RobotContainer](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/RobotContainer.java), and [vision](https://github.com/FRC1257/2026-Robot/tree/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/vision). The pinned code builds with deprecation warnings and contains robot-specific tuning. [PathPlanner documentation](https://pathplanner.dev/) and [WPILib pose estimators](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/state-space/state-space-pose-estimators.html).

**Completion:** explain axes, predict module vectors, describe a bad offset, explain capture timestamps and show a short simulated trajectory and log to a mentor. If a full simulator is unavailable, complete the predictions and state clearly that the trajectory remains untested.

## Run the ideal autonomous exercise

Follow the [starter README](https://github.com/FRC1257/robotics-training/tree/main/examples/robot-starter) to clone the repository and enter `examples/robot-starter`. With JDK 17 and WPILib 2026.2.1 installed, run:

```sh
./gradlew test --tests frc.robot.IdealAutoTest.reportRun --rerun-tasks
```

On Windows use `gradlew.bat`. In the verified run the report shows a 3.00 s trajectory, final pose approximately `(2.000 m, 0.000 m, 0.00°)`, and peak module speed `1.114 m/s`. The run starts at `(−0.25 m, +0.30 m, +20°)` and continues feedback for two seconds after the trajectory ends. The test checks final position within 0.03 m. Run `./gradlew test` for all starter tests: trajectory endpoints and rest velocities, frame conventions, heading correction, offset tracking and module desaturation are checked separately.

Open `IdealHolonomicAuto.java`. `TrajectoryGenerator` creates a straight 2 m path with a 1 m/s velocity and 1 m/s² acceleration limit. The trajectory pose's rotation represents its path tangent; `HolonomicDriveController` receives a separate desired robot heading of zero. At each 20 ms step its robot-relative chassis output becomes four swerve states. Desaturation caps wheel speeds at 1.5 m/s, then the code reconstructs achieved chassis speeds and applies a body-frame `Twist2d` with `Pose2d.exp`. This is **ideal motion**: wheel states are realized immediately and pose is exact. It has no steering lag, motor or battery dynamics, slip, sensors, vision, odometry uncertainty or collision model; it does not command hardware. The report is neither a log of the team robot nor a measurement.

**Predict and test:** (1) Explain why the positive initial y error requires a correction toward negative field y. (2) At +90° heading, predict the robot-relative vector for field-forward motion; the frame test expects `(0, −1)` m/s. (3) In `IdealAutoTest`, inspect the large-offset saturation test: the peak should equal 1.5 m/s. (4) Change the initial position in `reportRun`, rerun just that test, and record the result; the existing 0.03 m assertion may fail if the scenario exceeds this ideal controller's capability. Revert the edit after exploring. If dependencies fail to resolve, check the 2026 WPILib installation and network; if an assertion fails, read the initial pose, units and sample period before tuning.

Sources: [WPILib holonomic controller](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/trajectories/holonomic.html), [swerve kinematics](https://docs.wpilib.org/en/stable/docs/software/kinematics-and-odometry/swerve-drive-kinematics.html), and the [2026 `HolonomicDriveController` implementation](https://github.com/wpilibsuite/allwpilib/blob/c89401250fbd412ba050f595551d0a451b7307a2/wpimath/src/main/java/edu/wpi/first/math/controller/HolonomicDriveController.java).

## Worked kinematics

Suppose the front-left module is 0.30 m forward and 0.30 m left of the center. For pure rotation at +1 rad/s, its velocity is `(−0.30, +0.30)` m/s, magnitude about 0.424 m/s, angle +135° from robot-forward. The front-right module at `(0.30, −0.30)` has velocity `(+0.30, +0.30)` m/s and angle +45°. Rear modules point along the remaining tangents. This is an ideal kinematic prediction, not a traction or motor model. In the swerve lab set translation to zero and positive rotation and turn optimization off to check these directions. With optimization enabled, the same wheel velocity may be represented by a reversed speed and an angle rotated by 180°. A center of rotation other than the robot center changes the relative module positions used in this calculation.

For field-relative control, the desired field vector must be rotated by the negative robot heading to obtain robot-relative velocity. Example: at heading +90°, field-forward `(1, 0)` m/s becomes robot-right `(0, −1)` m/s. Confirm this with the lab. A reversed gyro or wrong initial heading rotates all commands incorrectly.

## Trace the 2026 implementation

Open the pinned `Drive.java`. Find `runVelocity`: it discretizes chassis speeds, converts them through kinematics into module states, desaturates wheel speeds, records setpoints, and sends the states to the modules. In the periodic update find `odometry.update`, the vision inputs, `addVisionMeasurement`, and `poseEstimator.updateWithTime`. The code uses per-estimate timestamps and separates position and rotation updates with different standard-deviation vectors. Its simulation uses odometry as the simulated vision position reference; therefore do not treat a close simulated agreement as independent measured field truth. Inspect how `resetPosition` resets both odometry and the pose estimator using the current gyro and module positions.

For your own project the integration sequence is: (1) obtain ordered module positions in meters and gyro angle, (2) update the estimator using the loop timestamp, (3) obtain camera estimates and capture timestamps, (4) reject invalid or unsuitable observations and attach uncertainty, (5) submit accepted observations to the estimator, and (6) log raw, odometry-only and fused poses. Vendor and WPILib release APIs determine exact code. Review timestamps against the estimator clock and preserve the same field origin through resets. An estimator is only as meaningful as those inputs.

## Trajectory investigation

In the team's `RobotContainer`, trace the chooser to its selected command and identify the configured PathPlanner callbacks for pose, speed and output in the project. Begin a simulation with a known initial pose. Record initial pose, path frame, selected command and target final pose, then enable autonomous. In a project with a complete simulation, compare target and estimated poses over time. A large initial error suggests a reset/frame problem; a steadily growing error suggests tracking, unit or model problems; a jump at a vision update points to timestamp, transform or measurement quality. Each is a hypothesis to check against raw signals, not an automatic diagnosis. Cancel on disable and verify outputs stop. If the simulation or path is unavailable, document that limitation and complete the code trace rather than claiming the robot followed it.
