<!-- ai-assisted -->

# PhotonVision: from camera frames to robot observations

PhotonVision processes camera frames into target observations. PhotonLib is the robot-side library that receives those results and supports calculations such as field-relative pose estimation. The robot still owns the decisions about accepting an observation and using it for alignment or localization. Use the [PhotonVision 2026.3.3 documentation](https://docs.photonvision.org/en/v2026.3.3/) for this lesson's baseline, and match the installed application and PhotonLib versions.

## Know which component owns each job

| Component | Responsibility | What it does not establish |
| --- | --- | --- |
| Camera and pipeline | Capture images, detect features or tags, solve configured geometry | A valid field-relative robot pose under every viewing condition |
| Calibration | Describe the camera's projection and distortion at the configured resolution | The physical camera's location on the robot |
| Robot-to-camera transform | Describe the camera mount relative to the robot origin | That the camera mount cannot flex or move |
| Field layout | Describe known tag poses in a chosen field coordinate system | That a practice field was built to those exact positions |
| PhotonLib pose estimator | Combine observations with layout and mount geometry | That an observation should always be fused |
| Drive pose estimator | Combine motion updates and accepted timestamped vision observations | Correctness of a supplied timestamp, transform or uncertainty |

The [PhotonPoseEstimator guide](https://docs.photonvision.org/en/v2026.3.3/docs/programming/photonlib/robot-pose-estimator.html) defines the field-layout and mount-transform inputs. Read the [geometry lesson](../2-Geometry_And_Calibration.md) before treating those values as constants to copy from another robot.

## Build up in observable stages

1. Follow [setup and calibration](Setup.md), recording the camera, resolution, application version and PhotonLib vendordep version.
2. Confirm that target observations update, using the intended pipeline. Verify tag IDs against the actual target.
3. Measure the mount transform and choose the correct field layout. Test stationary poses and rotation in place.
4. Trace the result's capture timestamp into the robot program. Record both accepted and rejected observations.
5. Add observations to the pose estimator only under an explicit validity and uncertainty policy.
6. Attempt bounded alignment only after the estimate passes independent checks.

The [integration walkthrough](Code.md) links a pinned Team 1257 implementation. It is a code-reading exercise with season-specific dependencies, not a drop-in current API template.

## Check the contracts before tuning

**Proposed experiment:** with a stationary robot at an independently measured pose, log successive camera estimates. Then rotate the robot without intentionally moving its center. Compare the estimated robot center before and after rotation. A consistent offset, a circular path during rotation and random scatter point toward different problems; inspect the mount transform, calibration and target geometry rather than using one gain adjustment for all three.

Read [pose fusion](../3-Pose_Fusion.md) for timestamps and uncertainty, and [alignment/debugging](../4-Alignment_And_Debugging.md) for a step-by-step failure investigation.

## Quick review

- Why is calibration different from measuring the camera mount?
- Why should each physical camera have its own estimator/configuration?
- What evidence would make you reject an observation rather than merely give it less influence?

<details><summary>Compare your reasoning</summary>

Calibration describes image formation; the mount transform describes geometry between the camera and robot. Different cameras have different intrinsics and mounts. An incompatible timestamp, invalid pose or incorrect layout is a validity problem; uncertainty alone is not a repair for it. Use the complete acceptance contract for the installed estimator.

</details>

## Sources and related pages

- [PhotonVision 2026.3.3 documentation](https://docs.photonvision.org/en/v2026.3.3/).
- [PhotonPoseEstimator inputs and use](https://docs.photonvision.org/en/v2026.3.3/docs/programming/photonlib/robot-pose-estimator.html).
- [Camera setup](Setup.md), [team-code integration](Code.md), and [vision concepts](../README.md).
