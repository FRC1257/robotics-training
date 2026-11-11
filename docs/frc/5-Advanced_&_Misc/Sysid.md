# SysId: characterize before tuning

**Prerequisites:** [feedforward](../3-Closed_Loop_Control/4-Feedforward.md), logging and safe mechanism handling. **Time:** 45 minutes plus mentor review. SysId estimates a model from voltage and measured motion; it does not find universally safe PID gains. Choose the mechanism type, record units and gear/encoder conversion, and inspect the fit and residuals. Values apply to the tested configuration, not every robot.

In simulation, generate or load a characterized example, run quasistatic and dynamic tests in both directions, then fit the model. Inspect voltage, position and velocity traces, units, saturation and whether all requested runs are present. Compare estimated `kS`, `kV`, and (when supported) `kA`; a poor fit or absent data is a reason to investigate, not to trust a number.

For hardware, have a mentor review wiring, sensor polarity, safe travel, output limits and an immediate disable plan. Clear the test area, constrain motion and stop immediately for unexpected behavior. A gravity-loaded mechanism needs special attention. Never run a characterization procedure unattended or use gains without validating the model and controlled behavior.

**Task:** explain why a mechanism hitting a hard stop invalidates part of the fit; expected: the recorded motion no longer reflects the free-motion model. Troubleshoot implausible constants by checking units, sign, timestamps, battery voltage and mechanical binding. Sources: [WPILib SysId introduction](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/system-identification/introduction.html), [running characterization](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/system-identification/running-routine.html).

## Worked interpretation

For a simple motor, an approximate voltage model is `V = kS * sign(v) + kV * v + kA * a`. `v` is mechanism velocity, `a` acceleration, and coefficients depend on the chosen mechanism units. An arm or elevator requires a gravity term appropriate to its model. The model predicts voltage for a requested motion; feedback corrects the remaining error.

For example, if a *hypothetical* model uses `kS = 0.2 V`, `kV = 1 V/(m/s)` and `kA = 0.1 V/(m/s²)`, then at +2 m/s and +1 m/s² it predicts 2.3 V. These are arithmetic examples, not measured team values or tuning recommendations. Negative motion changes the sign of the static term. Verify the actual API's unit conventions before using coefficients.

In the SysId tool, select the matching mechanism model and examine both directions and both slow and dynamic runs. Overlay predicted and measured voltage/velocity, identify samples at travel limits, and check residual patterns. If fit quality differs by direction, look for asymmetric friction, slack, voltage saturation or inconsistent sign; do not average away a mechanism defect. Save the raw log, model choice, units, test conditions and software revision with the fitted results. Re-test with a small, controlled reference before using feedforward in a full motion profile.
