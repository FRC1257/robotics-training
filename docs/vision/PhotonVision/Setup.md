# PhotonVision setup and calibration

**Prerequisites:** cameras, coordinate frames, and a mentor-reviewed network configuration. **Time:** 45–90 minutes. Use a PhotonVision release matched to the installed PhotonLib vendordep; do not mix `latest` documentation with a different release. Record camera model, resolution, pipeline, software versions and robot-to-camera transform.

1. Install and connect using the [PhotonVision 2026.3.3 setup guide](https://docs.photonvision.org/en/v2026.3.3/). Verify the camera appears and timestamps update.
2. Calibrate that camera at the resolution used by the pipeline, following the [calibration guide](https://docs.photonvision.org/en/v2026.3.3/docs/calibration/calibration.html). Use a correctly sized, flat target and a variety of views. A low reported error alone does not establish accurate field pose.
3. Configure the AprilTag pipeline and the correct season's field layout. Measure the robot-to-camera translation and rotation in WPILib coordinates and check sign conventions. A wrong transform or layout can produce plausible but shifted poses.
4. Compare estimated poses at several surveyed positions and orientations before using them for control. Record uncertainty, latency and capture timestamps; reject stale or implausible observations. MultiTag needs a compatible layout and calibration. See [MultiTag](https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/multitag.html).

**Exercise:** rotate the robot in place and predict whether the estimated robot center should travel in a circle if the camera offset is correct (it should stay approximately stationary). If it traces a circle, investigate transform and calibration. Do not claim a physical calibration from this exercise alone.
