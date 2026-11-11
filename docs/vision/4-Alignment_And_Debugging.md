<!-- ai-assisted -->

# Align to a target without confusing angle, distance and pose

A camera seeing a target does not automatically mean the robot is aligned to score. **Bearing** says which direction a target appears from an observation point. **Range** estimates its distance. **Pose** adds position and orientation in a named coordinate frame. A successful approach may need all three, plus a known robot-to-camera transform, an appropriate scoring offset and a mechanism that is ready.

For the visual pipeline and camera geometry, start with [pixels to targets](1-Pixels_To_Targets.md) and [geometry and calibration](2-Geometry_And_Calibration.md). For timestamped robot position, read [pose fusion](3-Pose_Fusion.md). PhotonVision's [2026.3.3 target-data guide](https://docs.photonvision.org/en/v2026.3.3/docs/programming/photonlib/getting-target-data.html) distinguishes target observations and transforms; WPILib's [coordinate-system overview](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html) explains the robot and field axes used here.

## Choose the output for the task

| Task | Needed estimate | Insufficient by itself |
| --- | --- | --- |
| Point a chassis or turret | Target bearing from the **actual rotation or firing point**, with a valid reference heading | A centered pixel from an offset camera does not prove the barrel points at the target. |
| Drive to a station | Relative displacement or a field-relative robot pose and a chosen approach pose | Bearing alone can be correct while range and lateral placement are wrong. |
| Place a game piece | Robot pose, target-to-scoring offset, mechanism geometry and piece state | Aligning the chassis center to a tag does not ensure the end effector is at the scoring point. |
| Shoot on the move | Time-aligned pose and velocity, calibrated projectile model and mechanical readiness | A static distance table cannot by itself validate a moving-shot solution. |

A visible tag is a **reference**, not necessarily the stopping point. Choose a desired scoring pose by applying the appropriate transform or offset in the correct frame, including approach side and orientation. Validate that pose against the field, rules, bumpers and mechanism envelope.

## Work an offset example

Assume a flat field with +x forward and +y left. At capture time the robot center is at **(2.00, 2.00) m** and its heading is **0°**. A target reference is at **(4.00, 3.00) m**. The camera is mounted **0.30 m forward and 0.10 m left** of robot center, facing robot-forward. These numbers are hypothetical and have no relationship to a measured Team 1257 configuration.

1. With zero heading, the camera's field position is **(2.30, 2.10) m**. At another heading, rotate the robot-to-camera offset by that heading before adding it to the robot's field position.
2. From the camera to the target, the field displacement is **(1.70, 0.90) m**. The bearing is `atan2(0.90, 1.70) ≈ 27.90°` from field +x; the planar range is approximately `sqrt(1.70² + 0.90²) = 1.92 m`.
3. From the robot center, the displacement is **(2.00, 1.00) m** and the bearing is about **26.57°**. They differ by about **1.33°**. For an offset turret or shooter, compute bearing from its calibrated pivot.
4. Suppose an independently designed approach pose is **(3.20, 3.00, 0°)**. The robot-center field error is **(+1.20, +1.00) m**, with zero heading error in this initial snapshot. That pose is an assumed stopping point, not a rule or a measured safe clearance. As the robot moves, recompute errors from a time-aligned estimate and express commanded velocities in the frame expected by the drive controller.

This planar example assumes accurate measurements and no latency or slip. Calibrate intrinsics, mount and layout, and account for motion between capture and use. [PhotonVision 2026.3.3 MultiTag](https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/multitag.html) explains why a correct field layout is essential.

## A control sequence, including target loss

A controller compares the desired pose with a **fresh, valid estimated pose**, produces bounded translational and angular requests, and respects subsystem ownership. Define approach limits and stop/abort behavior with the team. A robot can pass through a position tolerance at high speed; require velocity to settle as well as position and heading before declaring a stable approach, and define a dwell interval if useful. For a shooter, that still does not prove the wheel, hood, turret or piece is ready.

**Illustrative pseudocode — not executable and not Team 1257 code:**

```text
if operator aborts or required pose becomes invalid/stale:
    stop automatic drive under the reviewed stop policy
    show loss reason; enter bounded recovery or return control to driver
else:
    goal = reviewed scoring pose in the chosen field frame
    error = goal relative to estimated robot pose
    request bounded translation and rotation in the controller's required frame
    ready = position_in_tolerance and heading_in_tolerance
            and translational_speed_small and angular_speed_small
            and conditions_hold_for_required_dwell
    only permit the separate mechanism action if its own conditions also hold
```

A brief target occlusion need not always discard a valid fused pose: wheel/gyro odometry can continue temporarily, with increasing uncertainty. But a repeated camera result is not a new observation, and an estimate eventually may become too uncertain for the task. Define a task-specific maximum age/uncertainty and timeout; do not silently drive indefinitely on the last target or replace a missing pose with `(0, 0, 0)`. A reviewed fallback might stop, return driver control or use a validated preset.

## Diagnose the symptom before changing gains

| Observation | Plausible causes to investigate | Useful next check |
| --- | --- | --- |
| Robot consistently stops to one side | Camera offset or scoring transform wrong; target pose is not the desired endpoint | Measure mount and reference frames; compare several known poses, not one shot. |
| Error reverses after alliance change | Field-origin or alliance transform applied incorrectly | Log original field pose, chosen target and transformed goal; check for double flipping. |
| Robot turns away or oscillates | Sign/frame error, excessive gain, delay or saturation | Verify axes and heading with a low-output supervised test, then inspect requested versus measured motion. |
| Pose jumps at vision updates | Wrong timestamp, map/calibration error, ambiguity or an actual odometry error | Compare the observation with the prediction at **capture time** and record rejection reasons. |
| “Aligned” while still moving | Position-only condition without velocity/dwell | Plot pose error and chassis speeds together; test a pass-through case. |
| Works in simulation, misses on carpet | Simulation omits slip, flex, lighting, contact or an independent ground truth | Verify transforms and sensor timing on a controlled real setup; don't treat the model as a match result. |

Limelight's [MegaTag2 guide](https://docs.limelightvision.io/docs/docs-limelight/pipeline-apriltag/apriltag-robot-localization-megatag2) requires a configured camera pose, field map and robot-orientation input. Its output therefore has dependencies that must be considered when deciding how much independent information it contributes. That is a vendor-specific workflow; it is not evidence that Team 1257 used MegaTag2 in the source snapshot below.

## A Team 1257 source trace

At commit [`0c9a024`](https://github.com/FRC1257/2026-Robot/tree/0c9a024dec1f58648d573ce26fcfd02639c5ca66), Team 1257's [`DriveCommands.java`](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/commands/DriveCommands.java) includes `joystickHubPoint`, which computes a direction from the estimated current pose to an alliance-adjusted hub target. [`Drive.java`](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/drive/Drive.java) includes `isHubAligned`; [`RobotContainer.java`](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/RobotContainer.java) combines drive alignment with other shooter conditions in a driver command that also contains a timeout. Read the branch and its timeout before describing what it guarantees. This is source inspection, not a claim that the robot successfully aligned in a match.

The pinned project specifies PhotonLib `v2026.1.1-rc-2`; the PhotonVision documentation linked in these lessons is **2026.3.3**. Treat the historical implementation as an architecture example and check version-specific APIs before adapting it.

## Quick review

1. If a camera is left of the robot center, why can its target bearing differ from the robot-center bearing?
2. Why must position tolerance be paired with a velocity or dwell check for a settled placement?
3. A tag disappears for one frame. What distinguishes continuing on a fresh fused pose from driving forever on a stale camera pose?
4. If the robot consistently misses to the same side, why might tuning PID be premature?

<details>
<summary>Check your reasoning</summary>

1. Bearings originate at different positions; rotate and translate the actual camera or mechanism offset into the field frame.
2. A moving robot can cross the target briefly without being settled; motion and time in tolerance matter.
3. Odometry can bridge a brief loss, but the system must track validity, age and uncertainty and apply a bounded fallback.
4. First check camera mounting, field origin, scoring transform, sensor timing and signs. A controller cannot fix a systematically wrong target.

</details>

## Sources and related pages

[PhotonVision 2026.3.3 target data](https://docs.photonvision.org/en/v2026.3.3/docs/programming/photonlib/getting-target-data.html) · [PhotonVision MultiTag](https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/multitag.html) · [WPILib coordinate systems](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html) · [Limelight MegaTag2](https://docs.limelightvision.io/docs/docs-limelight/pipeline-apriltag/apriltag-robot-localization-megatag2) · [Pose fusion](3-Pose_Fusion.md).
