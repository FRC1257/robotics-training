# Limelight overview

A Limelight camera can provide target observations and robot pose estimates over NetworkTables. Camera configuration, field layout, coordinate frames, calibration and measurement timestamps determine how useful these observations are. Read the [Limelight documentation](https://docs.limelightvision.io/) matching the device software, and compare the [PhotonVision pose integration lesson](../PhotonVision/Code.md) for general validation principles. The API and pose conventions differ between devices; do not substitute field names blindly.

**Exercise:** before using an estimate, record device firmware, pipeline, capture timestamp, coordinate frame, target count and robot-to-camera transform. Compare it at several independently measured poses. Expected: the result follows robot motion within measured uncertainty; a fixed offset suggests transform or layout issues. A missing target is not a zero pose. No camera or robot was tested in this lesson.
