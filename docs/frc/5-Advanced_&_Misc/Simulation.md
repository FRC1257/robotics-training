# Simulation beyond the starter

Start with [the simulated intake](../1-Basics/5e-Simulation.md). That lesson simulates a requested output, not physical motion. A useful plant model states its inputs and outputs, units, sample period, motor, gearing, load, limits, and assumptions. In WPILib, a simulator can advance a model in `simulationPeriodic` and feed simulated sensor values back into the robot code. Check that simulation and controller periods match your design and that the code behaves sensibly on disable.

**Exercise:** design an elevator model with position in meters and voltage as input. Predict whether gravity matters at zero volts, then compare it with a suitable WPILib physics simulation configured with an explicitly stated mass and gearing. Plot input voltage and position; verify physical limits and sensor direction. These are assumptions until measured. If a simulated elevator accelerates in the wrong direction, inspect the sign conventions and gearing first. Simulation is not proof of safe hardware behavior.

Source: [WPILib physics simulation](https://docs.wpilib.org/en/stable/docs/software/wpilib-tools/robot-simulation/physics-sim.html).

[Archived original lesson](../archive/Simulation_legacy.md) (historical APIs; unverified).
