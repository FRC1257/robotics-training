<!-- ai-assisted -->

# From camera observations to a field pose

Pose fusion combines fast, locally continuous wheel-and-gyro motion estimates with occasional global observations. The result is an **estimate of the robot's position and heading on the field**, not ground truth. A vision pose may correct accumulated odometry drift; it can also pull a good estimate in the wrong direction if the tag map, camera transform, timing, or measurement quality is wrong.

The journey starts with [pixels and detections](1-Pixels_To_Targets.md) and [camera geometry and calibration](2-Geometry_And_Calibration.md). This page starts when the vision system has produced a candidate pose and timestamp. PhotonVision [2026.3.3 pose estimation](https://docs.photonvision.org/en/v2026.3.3/docs/programming/photonlib/robot-pose-estimator.html) describes candidate strategies; [WPILib pose estimators](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/state-space/state-space-pose-estimators.html) combine timestamped vision with gyro and wheel inputs.

## Know which frame a value describes

A **pose** describes position and orientation relative to a reference. In this discussion, field coordinates use a fixed field origin; robot coordinates move with the chassis; camera coordinates move with the camera. A detected tag's location relative to the camera is not automatically the robot's location on the field. The field tag map supplies a field-to-tag relationship, and a calibrated, measured robot-to-camera transform connects camera to robot. Both translation and rotation matter. Incorrect mounting offsets create systematic errors even when the detector reports a clean tag.

For MultiTag, PhotonVision combines visible tag corners and a field layout to estimate the camera pose. Its [2026.3.3 MultiTag documentation](https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/multitag.html) notes that the layout and calibration must match reality; for 2026, welded and AndyMark fields require the correct layout. A field origin convention must remain consistent through camera output, odometry, reset and target selection. Alliance-dependent target selection is a separate operation; do not flip an already field-relative pose twice.

| Input | Useful information | A misleading assumption |
| --- | --- | --- |
| Wheel encoders and gyro | Frequent relative motion and heading | Wheel travel always equals ground travel; slip and bias can accumulate. |
| Vision pose | A field-relative observation from a camera and known tags | Every visible tag yields a correct, independent pose. |
| Robot-to-camera transform | Camera mounting location and orientation relative to robot | The camera is centered or still mounted exactly as measured. |
| Timestamp | When the image measurement describes the robot | The instant the program receives data is when the image was captured. |
| Standard deviations | A model of measurement uncertainty for fusion | A small number repairs bad calibration or makes a false result valid. |

## Time is part of the measurement

A camera frame takes time to expose, process and travel over the network. Its **capture time** refers to the robot state seen in the image; **arrival time** is when the robot receives the result. A moving robot can travel a meaningful distance between those instants. A pose estimator needs a capture timestamp in the time base expected by the estimator, with sufficient history to relate the past observation to the current state. WPILib describes latency-compensated updates; verify the API and camera time synchronization on the versions in your project. A wall-clock timestamp, a coprocessor uptime and robot FPGA time cannot be subtracted blindly.

A historical-state comparison also matters for fault detection. An **innovation** or residual is the difference between the camera observation and the estimator's predicted state **at the capture time**, expressed in consistent frames and units. Comparing an old image against the current moving robot can create a large, perfectly ordinary difference. A real system may apply a quality gate or covariance-aware residual check, but thresholds require calibration and testing: rejecting every surprise can prevent recovery from odometry drift, while accepting every result can produce pose jumps. Logging rejection reasons makes both cases visible.

### Worked example: an image arrives late

Assume a one-dimensional teaching case with aligned axes. At capture time **10.00 s**, the stored odometry prediction is **1.94 m**, while the vision solution says **2.00 m**. The frame arrives at **10.20 s**. During those 0.20 s, assume the robot moves forward at a steady **1.2 m/s**, so the current odometry prediction is **2.18 m**. The capture-time residual is `2.00 − 1.94 = +0.06 m`. Comparing `2.00` to the current prediction instead gives `−0.18 m`, a different and misleading comparison.

The example assumes an accurate common clock, constant speed and a history that includes 10.00 s. A real estimator's correction depends on its uncertainty model and implementation; **do not simply add 0.06 m to the current pose and call that a WPILib result**. Test whether the estimator has the needed history and inspect what happens for an old, future or out-of-order frame.

<!-- lab: odometry -->

The linked odometry lab uses deterministic synthetic observations and a deliberately simplified correction. Change its vision delay and correction strength, then compare the displayed capture and delivery times. It teaches the timing distinction; it is not a physical simulator or WPILib's estimator.

## Decide whether to fuse a candidate

Before an update, check that a new observation exists, its timestamp is finite, on the expected clock, fresh enough for the estimator history and not in the future, and that its pose is finite and geometrically plausible. Check the tag IDs, map version, field bounds with a justified margin, camera connectivity and calibration. Examine target distance, view geometry and the reported ambiguity where applicable; a low ambiguity or multiple tags is helpful evidence, not a guarantee against a shifted camera or wrong map. Choose standard deviations to reflect the uncertainty of the relevant x, y and heading components, not to force a desired output.

Deduplicate frames using a camera-specific frame identity or timestamp where appropriate: submitting a cached result again does not create another independent observation. Multiple cameras or successive frames can share the same wrong tag map, gyro input, calibration bias or target occlusion. Treating correlated estimates as independent high-confidence evidence can make the system overconfident. In particular, a pose strategy that uses the robot's heading is not an independent heading measurement. [Limelight's MegaTag2 documentation](https://docs.limelightvision.io/docs/docs-limelight/pipeline-apriltag/apriltag-robot-localization-megatag2) explicitly requires robot orientation input; follow its version-specific conventions rather than assuming all localization outputs are independent of the gyro.

**Illustrative pseudocode — not executable or a library API:**

```text
for each genuinely new camera frame:
    estimate candidate pose and capture time
    if clock/history, geometry, status or duplicate check fails: log rejection; continue
    compare candidate with predicted pose at capture time
    if reviewed quality/innovation policy accepts it:
        fuse with chosen per-axis uncertainty
    else: log candidate and reason; keep odometry-based estimate
```

Establish behavior for relocalization after a long drift, camera reconnect, estimator reset and lack of historical data; do not continuously reject legitimate recovery measurements because the estimate itself may be wrong.

## A real Team 1257 source trace

At pinned commit [`0c9a024`](https://github.com/FRC1257/2026-Robot/tree/0c9a024dec1f58648d573ce26fcfd02639c5ca66), Team 1257's [`VisionIOPhoton.java`](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/vision/VisionIOPhoton.java) reads unread camera results, retains the latest result when none are unread, and configures position and rotation estimation strategies. [`Drive.java`](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/src/main/java/frc/robot/subsystems/drive/Drive.java) separately submits position and rotation observations using per-camera timestamps and different standard-deviation vectors. Inspect the whole surrounding code before drawing conclusions about actual acceptance and repeated frames. In simulation, the source passes odometry as the simulated vision position reference; agreement in that setup is not independent field truth.

**Version boundary:** that robot snapshot's [vendor dependency](https://github.com/FRC1257/2026-Robot/blob/0c9a024dec1f58648d573ce26fcfd02639c5ca66/vendordeps/photonlib.json) specifies PhotonLib `v2026.1.1-rc-2`; the teaching documentation linked above is PhotonVision **2026.3.3**. Do not assume its current API examples compile unchanged against the historical snapshot. Reading code is not evidence of a build, deployment or observed match behavior.

## Quick review

1. Why does a 200 ms-old frame need its capture time, rather than the current pose at arrival?
2. What can cause three cameras to agree and still be wrong?
3. Why can a large residual be either an invalid vision pose or a legitimate correction after wheel slip?
4. What should happen when a camera repeats its last frame after a disconnect?

<details>
<summary>Check your reasoning</summary>

1. The robot may have moved since capture; compare with the predicted historical state in the same clock domain.
2. Shared tag-map, mounting, calibration or gyro errors can correlate their estimates.
3. Either the camera or the predicted pose can be wrong; use context, quality, timestamps and a tested recovery policy.
4. Mark it as duplicate or stale and follow the reviewed loss-of-vision policy; a cached value is not a new observation.

</details>

## Sources and related pages

[PhotonVision 2026.3.3 pose estimator](https://docs.photonvision.org/en/v2026.3.3/docs/programming/photonlib/robot-pose-estimator.html) · [PhotonVision MultiTag](https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/multitag.html) · [WPILib pose estimators](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/state-space/state-space-pose-estimators.html) · [Limelight MegaTag2](https://docs.limelightvision.io/docs/docs-limelight/pipeline-apriltag/apriltag-robot-localization-megatag2) · [Alignment and debugging](4-Alignment_And_Debugging.md).

For a smaller, seven-step introduction, use the [AprilTag vision walkthrough](../labs/vision.html): its last steps isolate placement error from capture-time error.
