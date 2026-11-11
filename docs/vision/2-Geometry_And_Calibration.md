<!-- ai-assisted -->
# Camera geometry, calibration and AprilTag pose

A camera projects three-dimensional points onto a two-dimensional image. To recover a useful direction or estimate a pose, the robot needs a camera model, known target geometry and a clear account of coordinate frames. Calibration describes the particular camera and lens; the robot-to-camera transform describes how that camera is mounted on the robot. These are different facts, and an error in either can produce plausible but wrong results.

**Prerequisites:** [pixels and detections](1-Pixels_To_Targets.md), basic ratios and angles. **Time:** 45–60 minutes. **You should be able to:** compute an idealized depth, explain what calibration and a mounting transform do, and distinguish a tag-relative observation from a field-relative robot pose.

## Follow one observation

Predict why a camera mounted ahead of the robot cannot report the robot center directly. Step through the synthetic image, corner/ID overlay and field geometry. Then move the physical camera while leaving the configured offset unchanged. In the final steps, compare an old pose with the robot's current position and test the capture timestamp. The detector observations and motion are idealized; this is a visual explanation, not a camera calibration or a full 3D pose solver.

<!-- lab: vision -->

## The pinhole model: from a point to a pixel

Imagine an ideal pinhole camera with the optical frame used in the OpenCV explanation: `Xc` points right, `Yc` down and `Zc` forward through the lens. For a point in front of the camera, ignoring lens distortion:

```text
u = fx * Xc / Zc + cx
v = fy * Yc / Zc + cy
```

`(u, v)` is the image point in pixels; `(cx, cy)` is the principal point in pixels; and `fx` and `fy` are focal lengths expressed in pixels for that image geometry. `Zc` is depth along the optical axis, not necessarily the straight-line distance to an off-center object. The ratios explain why a distant target generally occupies fewer pixels. [OpenCV's PnP and projection reference](https://github.com/opencv/opencv/blob/4.11.0/modules/calib3d/doc/solvePnP.markdown) describes this model and its camera matrix.

For a centered principal point and no distortion, horizontal FOV is `2 * atan(imageWidth / (2 * fx))`. Pixel offset is not generally a fixed fraction of FOV in degrees; an undistorted horizontal ray angle is `atan((u − cx) / fx)`. Real lenses and crops can depart from this simplification.

## A hypothetical range calculation

Assume a flat square marker is directly facing the camera, its plane is perpendicular to the optical axis, and corresponding corners have already been measured in an undistorted image. Suppose its known physical width is `0.16 m`, its apparent width is `80 pixels`, and the calibrated horizontal focal length is `800 pixels`. Similar triangles give:

```text
apparent width = focal length × physical width / optical depth
Zc = fx × width / apparent width
   = 800 pixels × 0.16 m / 80 pixels = 1.60 m
```

This is an illustrative calculation, not an observation of a real field tag. It estimates optical-axis depth under the stated assumptions; it is not a general 3D range formula. If the detected width were `79` or `81` pixels instead, the same model gives about `1.620 m` or `1.580 m`. That sensitivity illustrates why a small or blurry target can produce a noisier distance. An oblique tag, wrong printed size, distorted image or inaccurate corners violates the simple calculation. Do not use it as a replacement for a calibrated pose solver.

## Intrinsics, distortion and extrinsics

| Quantity | What it describes | Example failure when wrong |
| --- | --- | --- |
| Intrinsics | How this image geometry projects rays: `fx`, `fy`, `cx`, `cy` | Pixel offsets convert to the wrong rays or apparent depth |
| Distortion | How the lens departs from an ideal pinhole projection | Target corners near the edge appear systematically displaced |
| Robot-to-camera transform | Camera position and orientation relative to the robot frame | Robot pose is offset or rotates incorrectly even if camera-to-tag pose is good |
| Field tag layout | Expected ID, position and orientation of markers in a particular field layout | A valid ID is placed at the wrong field location |

Intrinsics are tied to the camera, lens and image mode. Calibrate at the resolution used by the pipeline and revisit calibration after a relevant lens, focus, crop or camera change. PhotonVision's [2026.3.3 calibration guide](https://docs.photonvision.org/en/v2026.3.3/docs/calibration/calibration.html) describes capturing varied views of a correctly sized calibration target and reviewing reprojection error and per-image results. A low average error is useful evidence about the calibration images, but it cannot by itself prove accurate robot pose throughout the field. Validate at independent, known positions and orientations.

## Transforming from camera to robot

WPILib's robot convention is `+x` forward, `+y` left and `+z` up. PhotonVision's camera-to-target transform is expressed in a forward-left-up camera convention; the OpenCV optical example above uses right-down-forward. For the same physically aligned camera, an optical-frame vector `(Xc, Yc, Zc)` corresponds to forward-left-up `(Zc, −Xc, −Yc)`. Do not apply this conversion twice if a library has already returned a WPILib-convention transform. Check the API's documented frame and sign convention. [WPILib coordinate systems](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html); [PhotonVision target transforms](https://docs.photonvision.org/en/v2026.3.3/docs/programming/photonlib/getting-target-data.html).

For a point, `p_robot = t_robot_camera + R_robot_camera × p_camera`: rotate the camera-frame vector, then add the camera origin. Full poses require transform composition and inversion, not coordinate-wise addition.

**Hypothetical mount.** The camera is aligned with the robot axes and is `0.30 m` forward, `0.10 m` left and `0.50 m` up from the robot origin. A target point is measured relative to the camera as `(2.00, 0.20, 0.00) m` in forward-left-up axes. With zero relative rotation, the point relative to the robot is `(2.30, 0.30, 0.50) m`. If the camera were rotated, rotate the camera-relative vector before adding the translation; simply adding coordinates would be wrong. Measuring that mount is a physical task, not something established by this example.

## From an AprilTag to a pose estimate

An AprilTag detector identifies a marker and its image corners. Perspective-n-Point (PnP) uses known 3D tag corners, corresponding image corners and camera calibration to estimate their relative pose. The API defines transform direction. A field layout and camera mount can then relate that observation to the robot on the field; identification and pose estimation are separate steps.

A planar tag can admit competing poses that fit the image similarly. Reprojection error compares observed with predicted corners; an ambiguity measure compares candidate fits. It is not a universal probability of correctness. PhotonVision discusses these alternatives and their limitations in [3D tracking](https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/3D-tracking.html).

MultiTag uses observations of multiple visible tags and their expected field geometry to estimate the camera pose. Additional views can improve constraints, but they do not cure a wrong calibration, camera transform or field map. PhotonVision 2026.3.3 documents that its MultiTag calculation requires a calibrated camera and correct layout, and that the 2026 welded and AndyMark layouts differ. Select the actual layout rather than assuming one from the season alone. [PhotonVision MultiTag](https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/multitag.html).

## Quick review

1. In the hypothetical range example, what does the result `1.60 m` measure, and which assumptions make the shortcut valid?
2. If the tag is farther away and occupies fewer pixels, why can a one-pixel corner error matter more?
3. What is the difference between camera intrinsics and the robot-to-camera transform?
4. A camera is 0.30 m forward of the robot origin and sees a point 2.00 m forward in aligned axes. Where is the point relative to the robot origin?
5. Why can a decoded tag ID and a low reprojection error still be insufficient evidence that a field pose is correct?
6. Does seeing multiple tags automatically fix a wrong field layout or camera mount?

<details>
<summary>Answers and reasoning</summary>

1. Optical-axis depth. The shortcut assumes known physical width, an undistorted image, a calibrated focal length and a front-facing marker perpendicular to the optical axis.
2. A pixel is a larger fraction of the measured target width. Since depth varies inversely with width in this simplified model, the same pixel error produces a larger relative range error.
3. Intrinsics and distortion describe how the camera produces an image; the mounting transform locates and orients that camera relative to the robot.
4. At 2.30 m forward, assuming the frames are aligned and the target's relevant component is as stated.
5. The ID only identifies a pattern. A competing planar solution, biased calibration, wrong tag size, incorrect field layout or mounting transform can still give an incorrect pose. Reprojection error measures image fit, not all sources of real-world error.
6. No. Multiple tags can add geometric constraints, but shared model and layout errors can bias the result.

</details>

## Sources and related pages

Practice the physical setup with [PhotonVision calibration and setup](PhotonVision/Setup.md), then continue to [pose integration](PhotonVision/Code.md). Primary references: [PhotonVision 2026.3.3 calibration](https://docs.photonvision.org/en/v2026.3.3/docs/calibration/calibration.html), [3D ambiguity](https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/3D-tracking.html), [MultiTag](https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/multitag.html), [WPILib coordinate systems](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html), and [OpenCV PnP](https://github.com/opencv/opencv/blob/4.11.0/modules/calib3d/doc/solvePnP.markdown). The WPILib stable link may change with the season.
