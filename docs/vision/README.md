<!-- ai-assisted -->

# Robot vision: from pixels to a useful decision

Robot vision turns camera images into measurements that software can use: a target's direction, a game piece's image location, or an estimate of the robot's position and heading on the field. A camera does not directly report an instruction such as “drive left.” Your program must interpret what was measured, where and when it was measured, and whether it is reliable enough for the requested action.

A driver camera stream and an autonomous vision pipeline solve different problems. In a stream, a person interprets the image. In a processing pipeline, software extracts measurements from frames. Both are useful; a working video stream does not establish that pose estimation is configured correctly. [WPILib explains this distinction](https://docs.wpilib.org/en/stable/docs/software/vision-processing/introduction/what-is-vision.html).

## Follow the whole pipeline

Read this sequence from top to bottom. Each row changes the meaning of the data; the last row is a robot-program decision, not a camera output.

| Stage | What comes out | Question to ask |
| --- | --- | --- |
| Image capture | Pixels and a capture time | Was the target sharp, visible and properly exposed? |
| Detection | Corners, a contour, a tag ID or an object detection | Did we find the intended target? |
| Geometry | A bearing, distance or camera-relative transform | Are calibration, target geometry and axes correct? |
| Localization | A field-relative robot pose estimate | Did we use the correct layout and robot-to-camera transform? |
| Validation and fusion | Accepted observations and an updated state estimate | Is the timestamp usable, and how uncertain is this measurement? |
| Control | A bounded velocity or mechanism request | What happens if the target disappears or the estimate is wrong? |

[PhotonVision's pose estimator](https://docs.photonvision.org/en/v2026.3.3/docs/programming/photonlib/robot-pose-estimator.html) documents the field layout and camera transform used to turn tag observations into robot poses. The four lessons below separate those steps so that a plausible-looking dashboard number does not hide a frame, time or calibration error.

## Learn the concepts in order

| Lesson | What you should be able to explain |
| --- | --- |
| [1. Pixels, targets and AprilTags](1-Pixels_To_Targets.md) | How exposure and image processing affect a detection, and why identifying a tag is different from locating the robot |
| [2. Camera geometry and calibration](2-Geometry_And_Calibration.md) | How pixel coordinates become rays, what calibration measures, and how camera offsets affect robot pose |
| [3. Pose estimation and delayed measurements](3-Pose_Fusion.md) | Why odometry and vision complement one another, and why capture time and uncertainty matter |
| [4. Alignment and systematic debugging](4-Alignment_And_Debugging.md) | How to turn an estimate into a controlled approach, and how to diagnose bad measurements before tuning a controller |

Then choose the implementation guide for your installed system. The concepts transfer between systems; their APIs, sign conventions and time contracts still need checking.

## Choose a processing arrangement

Processing can run on the robot controller, a coprocessor or an integrated smart camera. Choose based on measured processing demand, camera compatibility, supported software, wiring and your team's ability to maintain it. Hardware names alone do not establish latency or pose accuracy.

| Arrangement | What it does | What to verify |
| --- | --- | --- |
| Driver camera stream | Gives the operator a view | Usable image, bandwidth and delay for the intended driving task |
| [PhotonVision](PhotonVision/README.md) | Processes camera frames and supplies observations through PhotonLib | Supported camera/compute hardware, matching versions, calibration, transforms and timestamp handling |
| [Limelight](Limelight/README.md) | Integrates camera and processing with configurable pipelines and published results | Device-specific pipeline, pose convention, calibration, layout and API time semantics |
| [WPILibPi or custom processing](WPILibPi/README.md) | Provides an environment for camera streaming or custom processing | Current image/hardware support, actual processing code and a defined measurement contract |

Follow the [PhotonVision hardware documentation](https://docs.photonvision.org/en/v2026.3.3/docs/hardware/selecting-hardware.html) or [Limelight's device documentation](https://docs.limelightvision.io/docs/docs-limelight/getting-started/summary) for the system in front of you. Avoid assuming that an older team setup describes the current robot.

## Work through one observation

**Hypothetical example:** a frame is captured at 12.000 s, its tag corners are detected, and a calibrated system estimates the camera's position. The field layout supplies the observed tag's known pose. The measured robot-to-camera transform lets the system convert the camera pose into a robot pose. The result reaches the robot at 12.080 s.

That result describes the earlier instant. If the robot traveled at a constant 2 m/s, it moved approximately **0.16 m** during those 80 ms. Passing the estimate with the arrival time makes old information look current. Passing a valid, synchronized capture timestamp lets a pose estimator relate the observation to its motion history. The [fusion lesson](3-Pose_Fusion.md) works through the distinction and its limits.

Even correct timestamps do not fix a wrong camera mount measurement. Even multiple tags do not prove that the field layout is right. Check each stage independently before deciding that the controller gains are the problem.

## Connect vision to the rest of the robot

- [State estimation](../frc/6-Architecture/8-State_Estimation.md) explains measurements, hidden state, noise, bias and uncertainty.
- [Control-loop design](../frc/6-Architecture/9-Control_Loop_Design.md) connects estimates to profiles, feedforward, feedback, saturation and actuator limits.
- [Timing and state](../frc/6-Architecture/6-Timing_And_State.md) explains event freshness and repeated data.
- [Filtering and validity](../frc/6-Architecture/7-Filtering_And_Validity.md) explains why smoothing a bad measurement does not make it valid.
- [The 2026 code walkthrough](../robots/2026-code.md) shows how these concerns appear in a pinned Team 1257 codebase.

## Quick review

1. A dashboard displays a tag ID. What else is required before using it as a field-relative robot pose?
2. A camera produces sharp video, but every estimated pose is shifted by a similar amount. Which configuration errors would you check?
3. Why can a camera frame be valid but still unsuitable for an immediate alignment decision?
4. Which part of the system decides what to do when a target disappears?

<details><summary>Compare your reasoning</summary>

1. Calibrated image geometry, target geometry, the matching field layout, the robot-to-camera transform, a valid timestamp and an acceptance policy are still needed.
2. Check the mount transform, field layout and frame/origin conventions, then the calibration. Sharpness alone does not establish geometric correctness.
3. It can be too old for the available history or action, poorly constrained by geometry, or too uncertain for that task. Rejecting it and reducing its influence are different choices.
4. The robot's command and control logic. A missing observation must have an explicit behavior rather than silently reusing an old target indefinitely.

</details>

## Sources and next steps

Start with [pixels and targets](1-Pixels_To_Targets.md), then the [camera setup guide](PhotonVision/Setup.md). The examples in this sequence are teaching calculations and proposed experiments; they do not claim that a camera was calibrated or a robot tested.
