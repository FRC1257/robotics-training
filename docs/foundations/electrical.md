# Electrical power, CAN, and troubleshooting

The battery supplies energy; the power distribution device routes protected power to loads; controllers regulate motors; and the roboRIO runs robot code. **CAN is a communications network**, not the motor's power supply. Device status, sensor data and control requests can travel over it, while each device still needs its appropriate power connection. The [WPILib hardware overview](https://docs.wpilib.org/en/stable/docs/controls-overviews/control-system-hardware.html) and [wiring best practices](https://docs.wpilib.org/en/stable/docs/hardware/hardware-basics/wiring-best-practices.html) give component context and maintenance advice.

Before touching wiring, disable and isolate power using your team's procedures, control stored energy, and get a qualified mentor. Check the current season manual and manufacturer documentation for legal devices, protection, wire sizes, routing and termination. Do not infer a permitted circuit from a drawing or a device's maximum rating.

## Build a useful map

Record each device's physical location, power source, protective channel, communication connection, device identifier, firmware and software configuration. Label both ends of wires and make connectors accessible. CAN devices need correct addressing and a healthy network; consult the [FRC CAN specifications](https://docs.wpilib.org/en/stable/docs/software/can-devices/can-addressing.html) and current vendor instructions for addressing and termination. A device ID visible in code is a configuration to verify, not proof the physical device has that ID.

## Troubleshoot from evidence

1. **Describe the symptom:** Which devices fail, under which robot mode, and when? Record status indicators and timestamps before changing anything.
2. **Separate scope:** One device missing suggests a local power, connection, ID or device issue; many missing devices suggest a shared path. Both are hypotheses, not diagnoses.
3. **Inspect safely:** With power isolated, inspect connectors, strain relief, mechanical damage and labeling. Use the correct manufacturer procedure for any continuity or termination test.
4. **Measure and compare:** Under approved test conditions, compare battery voltage, device voltage/status, CAN faults, requested output and sensor values. Change one thing at a time and record the result.

**Worked example:** Two motors stop responding together. The driver station still connects to the robot. This narrows neither the power fault nor the network fault by itself: check whether the two controllers share a supply or communications segment, inspect device status, and compare a known-working neighbor. If battery voltage falls broadly under load, investigate supply and current; [WPILib's brownout guide](https://docs.wpilib.org/en/stable/docs/software/roborio-info/roborio-brownouts.html) explains why voltage and current logs help.

**Try it:** Make a table with symptom, possible cause, safe observation and outcome for a missing device. Which measurement would distinguish no power from no communication? Explain why one green indicator does not prove an entire network is healthy.
