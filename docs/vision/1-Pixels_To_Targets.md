<!-- ai-assisted -->
# From pixels to a useful target

A robot camera measures light, not distance, identity or the robot's position. A vision pipeline turns an image into candidate features, decides what those features might represent, and may estimate a geometric relationship using additional information. Each step can fail independently. A recognized tag ID, for example, does not by itself establish an accurate robot pose.

**Prerequisites:** variables, angles and the idea of a coordinate frame. **Time:** 35–45 minutes. **You should be able to:** distinguish an image from a detection and a pose estimate, describe exposure and field-of-view tradeoffs, and diagnose a missing or unreliable target without inventing measurements.

## What an image contains

A lens directs light onto an image sensor. The sensor samples the image into a rectangular grid of pixels. In the usual image convention, a pixel coordinate `(u, v)` starts at the upper left, increases rightward in `u` and downward in `v`. A `640 × 480` image has 640 columns and 480 rows; its pixel values represent brightness or color information after the camera's processing. They are samples of the scene, not a map in meters. [WPILib: identifying and processing targets](https://docs.wpilib.org/en/stable/docs/software/vision-processing/introduction/identifying-and-processing-the-targets.html).

Exposure is how long the sensor collects light for a frame. A longer exposure can help in a dim scene but allows more motion blur if the camera or target moves. A very short exposure can freeze motion but leave a dark image. Gain and other camera controls can change brightness, often at the cost of noise; changing one setting does not guarantee a better detector. Start by making the target's edges and pattern clear at the anticipated distance and motion, then check performance under representative lighting. PhotonVision's [camera input documentation](https://docs.photonvision.org/en/v2026.3.3/docs/pipelines/input.html) describes the resolution, exposure and gain controls.

**Field of view (FOV)** is the angular extent of the scene a camera can see. A wider horizontal FOV can keep more of the field visible, but on the same image width a particular distant target may occupy fewer pixels. A narrow view can put more pixels on that target while making it easier to lose the target at the edge. Resolution, lens, crop, processing speed and lighting all affect the result; a higher pixel count alone does not guarantee a better or faster estimate. PhotonVision notes the tradeoff between resolution and update rate in its [input guide](https://docs.photonvision.org/en/v2026.3.3/docs/pipelines/input.html).

## Four stages, four different claims

The table is a map of the pipeline. Read downward: later claims depend on the earlier evidence plus extra assumptions. It is a conceptual model, not a claim about the internals of every vendor pipeline.

| Stage | Example output | What it establishes | What it does **not** establish |
| --- | --- | --- | --- |
| Image | A frame captured at a particular time | Sampled light at image locations | Object identity or physical distance |
| Detection | A candidate contour or four corners | The pipeline found a feature fitting its criteria | That it is the intended object |
| Identification | An AprilTag family and ID | The detector decoded a marker pattern | Where the robot is on the field |
| Geometry / pose | A camera-to-tag transform, or a field-relative estimate | A pose estimate under the supplied model and calibration | Ground truth or a guaranteed safe movement |

A colored-object pipeline might threshold pixels, group nearby pixels into contours and filter candidates by area or shape. An AprilTag pipeline instead finds and decodes a designed fiducial pattern, then may estimate the marker's orientation and translation from its corners and the camera model. The detector can report an ID even when the image is too small, blurry or oblique to support a reliable pose. Conversely, a visually plausible geometric solution for the wrong target or wrong field layout is not useful localization. PhotonVision's [target-data reference](https://docs.photonvision.org/en/v2026.3.3/docs/programming/photonlib/getting-target-data.html) distinguishes target identification from camera-to-target transforms and pose ambiguity.

A bounding rectangle is not the object itself; its center can shift if the object is clipped. A camera-relative direction depends on calibration, lens model and coordinate convention. Being centered in a side-mounted camera does not prove the robot center is aligned.

## Worked example: a target at the edge

**Hypothetical observation.** A 640-pixel-wide image contains a detected marker whose center is at `u = 480`. Assume an idealized image with optical center at `u = 320`. The offset is `+160 pixels`, so the detected center is to the right of the optical center. The offset is one quarter of the image width, but it is **not automatically one quarter of the horizontal FOV in degrees**. Perspective projection is nonlinear; a calibrated pinhole model uses `atan((u − cx) / fx)` for a horizontal ray angle in its stated convention. [OpenCV's projection and PnP overview](https://github.com/opencv/opencv/blob/4.11.0/modules/calib3d/doc/solvePnP.markdown) explains the camera matrix and perspective projection.

Now suppose the frame is blurred and the marker corners move by several pixels between images. The ID might still decode, but the corner locations feeding a pose calculation are less certain. A sensible next observation is the raw image and its detected corners, not a guess that the robot suddenly moved. The [geometry lesson](2-Geometry_And_Calibration.md) turns pixels and known dimensions into an explicitly bounded depth example.

## Follow the data, including time

A common FRC arrangement sends camera frames to a coprocessor running a pipeline. The robot receives results such as target ID, corners, timestamp or estimated transform. Measure timing for the chosen setup.

A result received now describes the scene at capture, before processing and communication. Record capture timestamp, target identity, quality and camera name. Represent a missing target as missing or invalid, not a zero-distance target.

## Diagnose what you can see

| Symptom in the image or output | Plausible cause | First check |
| --- | --- | --- |
| Target absent from frame | Outside FOV, blocked, aimed incorrectly | Inspect the raw frame and camera orientation |
| Pattern visible but ID unreliable | Too few pixels, blur, glare or exposure | Inspect corners and tune resolution/exposure under the same conditions |
| ID stable but estimated pose jumps | Geometry ambiguity, calibration, reflections or corner error | Check calibration and pose quality, not just the ID |
| Target centered but robot is offset | Camera mounted away from robot center | Check robot-to-camera transform and alignment goal |
| Image looks old while robot moves | Capture/processing/transport latency or clock issue | Compare capture and receive times in the correct clock domain |

These are hypotheses, not automatic diagnoses. A transparent pipeline makes the raw observation, selected target and validity visible so the operator can distinguish them from the robot's decision.

## Quick review

1. A detector finds a square but cannot decode an ID. What has been established?
2. Why might doubling image resolution improve a distant tag's visibility but worsen responsiveness?
3. A tag is centered in a side-mounted camera. Is the robot necessarily centered on it?
4. Why can a correctly decoded tag still yield a poor pose?
5. A result arrives at 5.10 s for an image captured at 5.02 s. Which moment does the observation describe?

<details>
<summary>Answers and reasoning</summary>

1. A candidate shape was detected; its identity and field location are not yet established.
2. More pixels may resolve smaller features, but more image data can take longer to capture or process. Measure actual frame rate and latency.
3. No. The camera and robot centers differ; the mounting transform and desired final pose matter.
4. Blur, corner error, wrong camera calibration, ambiguity or an incorrect tag layout can corrupt geometry even when the ID is right.
5. The scene at capture, 5.02 s. The 0.08 s delay matters if the robot or target moved, assuming both timestamps share a compatible clock.

</details>

## Sources and related pages

Continue with [camera geometry and calibration](2-Geometry_And_Calibration.md) and [PhotonVision setup](PhotonVision/Setup.md). Primary references: [PhotonVision camera input](https://docs.photonvision.org/en/v2026.3.3/docs/pipelines/input.html), [PhotonVision target data](https://docs.photonvision.org/en/v2026.3.3/docs/programming/photonlib/getting-target-data.html), [WPILib target processing](https://docs.wpilib.org/en/stable/docs/software/vision-processing/introduction/identifying-and-processing-the-targets.html), and [OpenCV PnP](https://github.com/opencv/opencv/blob/4.11.0/modules/calib3d/doc/solvePnP.markdown). PhotonVision links are pinned to 2026.3.3; WPILib's stable documentation can change with the season.
