<!-- ai-assisted -->
# State estimation: what the robot knows and how

**Prerequisites:** [swerve and localization](../1-Basics/Modern_Drivetrain_Project.md), [IO interfaces](1-IO_Interfaces.md), and [signal validity](7-Filtering_And_Validity.md). **Time:** 45–60 minutes. **Outcome:** distinguish measurements from an estimated pose, explain drift and delayed vision, and design a check against independent evidence. The numerical examples below are invented for learning; they are not robot measurements.

A sensor produces a **measurement**: a reported quantity with units, a time, and limits. The robot's **state** is the set of quantities chosen to describe what matters for a task, such as field position `(x, y)` and heading `θ`. An **estimate** is the best available calculation of that state under a particular model and evidence. It can be useful even when it is wrong. A displayed pose is neither the field itself nor a guarantee that the robot is at that pose.

For example, a swerve robot can use module positions and a gyro to advance an estimate as it moves. A camera observing known field features can provide another pose observation. These sources answer different questions and fail differently. Combining them helps only if units, frames, timing and assumptions are correct. WPILib's [pose estimators](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/state-space/state-space-pose-estimators.html) combine odometry updates with latency-compensated vision pose measurements; the library does not certify that the inputs are correct.

## Read the information flow

This diagram is a conceptual data flow, not the implementation of a specific team robot. Follow the time attached to each observation as well as the arrow.

```text
wheel positions + module angles ─┐
gyro heading ───────────────────┼─> odometry update ─> predicted pose ─┐
previous pose + starting frame ─┘                                      ├─> estimated pose + uncertainty
camera frame + field layout ─> vision pose + capture time ─> checks ───┘
```

The [IO boundary](1-IO_Interfaces.md) should carry values, status and timestamps to the consumer. A camera pipeline can output a *pose estimate* derived from its image and an assumed tag layout; the pose estimate is already a calculation, not a raw pixel measurement. The drive estimator combines evidence, and downstream code consumes its resulting estimate. Preserve the raw observations and rejection reasons so a bad output can be investigated.

| Evidence | What it contributes | Important limitations |
| --- | --- | --- |
| Wheel/module encoder positions and steering angles | Incremental motion implied by wheel rotation and kinematics | Slip, wrong radius or gear conversion, wrong module order and impacts make wheel motion differ from field motion. |
| Gyro heading or angular rate | Orientation or rotational motion, depending on the device's reported quantity | Bias, drift, mounting direction and initial heading matter. A gyro alone does not locate the robot on the field. |
| Vision pose with capture time | A field-relative observation when landmarks and calibration are usable | Frame ambiguity, camera-to-robot transform, tag map, occlusion and latency can bias or invalidate it. |
| Known starting pose | Establishes the initial field reference | A wrong initial pose is an assumption, not a measured correction. |

For WPILib swerve odometry, module position order must match the kinematics order; wheel distances are in meters and heading uses the documented coordinate convention. Encoder-and-gyro odometry can drift, particularly when contact or slip violates the assumed motion model. See [WPILib swerve odometry](https://docs.wpilib.org/en/stable/docs/software/kinematics-and-odometry/swerve-drive-odometry.html).

## Which errors can the evidence reveal?

**Observability** asks whether the available measurements, over the motion and time considered, distinguish different possible states. It is not a sticker that makes a sensor accurate. If two different field positions produce the same wheel increments and heading, those increments alone cannot tell which starting field position was correct. A known field landmark can supply information about field pose, but only when it is seen and the layout and camera transform are credible. A single observation may be ambiguous or weak in one direction; geometry and motion matter.

**Noise** is variation around an underlying value; a **bias** is a systematic offset. Imagine a camera reporting positions clustered tightly around 2.3 m when an independent survey says 2.0 m. Low spread does not remove the 0.3 m offset. Feeding more such observations to an estimator may reinforce the wrong answer. Inspect the transform, field layout and calibration before declaring the estimator unreliable. Conversely, wheel slip can move the robot without the distance implied by wheel rotation.

An estimator's uncertainty represents uncertainty under its model and configured assumptions. It is not a guarantee that the true pose lies inside a stated interval, especially if errors are correlated, a camera has a systematic bias, or wheel slip is not modeled. In a Kalman-style explanation, prediction advances a state and its modeled uncertainty, then a measurement correction uses the discrepancy and assumed uncertainties to update the estimate. The method is not magic: an overconfident wrong input can pull the estimate in the wrong direction. Do not assume that the teaching lab below is a Kalman filter or an implementation of WPILib.

## Worked example: old information arrives late

Suppose the robot is moving straight at a constant **2 m/s**. A camera frame captured at **10.000 s** produces a valid pose observation that arrives at **10.080 s**. During 0.080 s the robot travels approximately `2 m/s × 0.080 s = 0.16 m`. This simple arithmetic assumes constant speed and direction; it does not calculate an estimator's output.

Treating that observation as if it were captured at arrival assigns old evidence to the wrong point in the motion history. Provide the capture time in the time base expected by the estimator, and check synchronization, available history, frame identity and validity. A future time, mismatched clock or observation outside retained history needs a documented policy; do not silently pretend it is current. WPILib's estimator supports latency-compensated vision measurements, but the application must provide meaningful timestamps and uncertainties. See [WPILib pose estimators](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/state-space/state-space-pose-estimators.html) and the [PhotonVision integration guide](../../vision/PhotonVision/Code.md).

### Explore the toy model

Predict whether increasing simulated odometry bias changes the uncorrected final error. In the [odometry and delayed vision lab](../../labs/odometry.html), vary bias, delay and correction strength; compare numerical final errors and capture/delivery times. A strength of zero disables the toy correction. Try a strength of one and explain why a noisy or biased observation can worsen an estimate. The lab uses synthetic truth and a simple history adjustment; it does **not** model wheel slip, camera geometry, heading error or WPILib's estimator.

<!-- lab: odometry -->

## Diagnose before changing trust

| Symptom | Check first | Next decision |
| --- | --- | --- |
| Pose jumps when a frame arrives | Capture timestamp and clock domain; field and camera transforms; accepted frame | Reject invalid data and compare residuals with independent surveyed poses before changing uncertainty. |
| Odometry drifts with no vision | Module order, distance conversion, gyro direction, slip and initial pose | Fix a reproducible input error; decide whether external field observations are available. |
| Vision estimates are tightly grouped but displaced | Camera mounting/calibration and tag layout against surveyed reference | Investigate systematic bias; repeated estimates are not independent proof. |
| No recent vision frames | Connection, visibility, detection quality and time since last valid frame | Continue with appropriately qualified odometry or a reviewed fallback; never invent a fresh observation. |

Filtering can reduce some fluctuations while adding lag; it cannot validate a disconnected sensor. See [filtering and validity](7-Filtering_And_Validity.md). In [IOSim](2-Simulation_IO.md), make the source and limitations of simulated inputs explicit; a passing toy model is not evidence of physical accuracy. A [lookup table](4-Interpolation_Tables.md) can choose a reference based on estimated distance, but only within its validated domain and with a policy for uncertain pose.

## Quick review

1. Encoders and gyro report consistent motion from two different assumed starting poses. Can they alone identify which field pose is correct?
2. A vision frame captured at 3.00 s arrives at 3.12 s while the robot moves at 1.5 m/s. How far might it have moved during the delay under a constant-speed assumption?
3. A camera's results have low spread but a repeatable 0.25 m offset from a surveyed target. Would increasing confidence fix the cause?
4. A stale but finite pose value looks plausible. What additional information does the consumer need before using it?
5. Why is an odometry-lab correction-strength slider not a tested value for a WPILib estimator?

<details><summary>Check your reasoning</summary>

1. No. The same increments can be applied to either starting pose; another justified field reference is needed.
2. Approximately `1.5 × 0.12 = 0.18 m`; actual travel depends on the motion during the interval.
3. No. It can make a biased observation more influential. Check the independent survey, field layout, calibration and transforms.
4. A capture timestamp in a compatible clock domain, age limit, health/validity, frame and units, plus an explicit fallback for invalid or stale data.
5. The lab uses synthetic data and an ad hoc deterministic history shift; WPILib uses its own estimator and uncertainty configuration. The slider is not a transferable tuning parameter.

</details>

## Sources and related pages

- [WPILib pose estimators](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/state-space/state-space-pose-estimators.html) and [swerve odometry](https://docs.wpilib.org/en/stable/docs/software/kinematics-and-odometry/swerve-drive-odometry.html).
- [Camera setup and calibration](../../vision/PhotonVision/Setup.md), [vision pose integration](../../vision/PhotonVision/Code.md), and [control-loop design](9-Control_Loop_Design.md).
