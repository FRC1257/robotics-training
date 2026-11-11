<!-- ai-assisted -->

# Debug with evidence

Change one thing at a time. Record the symptom, expectation, revision, environment, and first point where the evidence differs from your expectation.

| Symptom | First checks | Useful evidence |
| --- | --- | --- |
| Java will not compile | First error; names, types, imports, version | Full first error and minimal source |
| Gradle cannot resolve a library | Exact vendordep and GradleRIO; first failed artifact URL | Build command and response status without credentials |
| Simulator output stays zero | Enabled mode, scheduled command, requirements, binding | Scheduler events and requested output |
| Robot does not connect | Power, Driver Station, network and current team procedure | DS messages and status lights |
| Motor runs backwards | Orientation, request sign, inversion, measured direction | Bounded signed test and sensor reading |
| PID moves away from goal | Units, motor/sensor sign, setpoint and error convention | Timestamped setpoint, measurement, output |
| Mechanism stops at wrong position | Ratio, encoder, zero, offsets and limits | Raw turns, converted units, home reference |
| Swerve wheels disagree | Module order, offsets, inversion, frame, gyro | Desired and measured named module states |
| Auto follows wrong path | Selected routine, deployed assets, pose, alliance transform | Selected command, pose, requested speeds |
| Vision makes pose jump | Calibration, layout, transform, timestamp, acceptance | Raw camera pose/time and fused pose |
| Voltage falls | Loads, current, battery, connections | Original voltage/current and test context |

## A reproducible report

```text
Expected: releasing the intake button requests zero output.
Observed: output remained 0.5 after release.
Revision and versions: ...
Reproduce: start simulation, enable teleop, press/release ...
Evidence: log timestamps and command lifecycle ...
Already checked: binding, end action, default command ...
Next hypothesis and test: ...
```

Logs describe recorded signals, not automatic causes. Save originals and analyze a copy. Practice with [the real log](../robots/2024-log.md). Disable unexpected motion before changing code; bring a mentor into damaged components or wiring. Use the team's actual hardware checklist.
