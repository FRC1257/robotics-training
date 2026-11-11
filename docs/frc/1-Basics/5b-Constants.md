# Constants and units

**Prerequisite:** [simulated intake](5-First_Subsystem.md). Give recurring values meaningful names and units: for example, `private static final double INTAKE_OUTPUT = 0.5;` and `private static final double RUN_TIME_SECONDS = 2.0;`. Place them in the class that owns them until several classes genuinely share them. Normalized output is dimensionless; seconds are not. Constants do not automatically enforce safety.

**Task:** replace the starter's `0.5` and `2` with named constants, rebuild, and repeat the timeout and early-disable checks. Expected behavior is unchanged. If Java cannot find a constant, check its scope and spelling. For physical mechanisms document gear ratio, encoder units, polarity, and measured limits independently; do not infer them from this simulation.
