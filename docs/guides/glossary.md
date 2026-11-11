<!-- ai-assisted -->

# Robotics vocabulary

| Term | Working definition |
| --- | --- |
| Actuator | A device applying effort, such as a motor or pneumatic cylinder |
| Subsystem | Software owner of a mechanism and its interfaces |
| Command | An action with scheduler-managed requirements and lifecycle |
| Requirement | A subsystem reserved to prevent competing control |
| IO interface | A boundary for observations and actuator requests |
| Setpoint | Requested state with units |
| Measurement | Sensor-derived observation with possible noise, bias or delay |
| Error | Setpoint minus measurement in this course |
| Feedback | Control based on requested versus measured state |
| Feedforward | Predicted effort from a model and desired motion |
| Saturation | An output reaches a configured or physical limit |
| Integral windup | Error accumulates despite output limits, delaying recovery |
| Motion profile | Time-varying reference with motion constraints |
| Kinematics | Geometry relating motion without forces |
| Dynamics | Relationships between effort, inertia and motion |
| Pose | Position and orientation in a named frame |
| Odometry | Pose updates from incremental measured motion; errors accumulate |
| Localization | Estimating where a robot is relative to its surroundings |
| Latency | Delay between measurement and availability |
| AprilTag | Visual fiducial with known geometry for detection and pose estimation |
| SysId | Estimating a system model from measured response to known inputs |
| Telemetry | Signals communicated for observation or diagnosis |
| Replay | Running software on recorded inputs, not a new physical test |
| CAN ID | Device identifier on the robot CAN network |
| Brownout | A low-voltage condition that can affect operation |

Naming a quantity does not establish its units or how it was measured. Ask for a worked example whenever either is unclear.
