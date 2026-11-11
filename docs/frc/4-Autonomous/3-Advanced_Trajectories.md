> **Historical lesson:** This material predates the 2026 course and may use older WPILib, vendor APIs, team wrappers, and game rules. Its original version is not verified here. Do not copy its robot code into a 2026 project without migration and mentor review. Start with [the 2026 subsystem lesson](../1-Basics/5-First_Subsystem.md).

# Advanced Trajectories

In the next few sections, we'll learn how to create curved trajectories that the drivetrain can use to smoothly follow. These trajectories run much faster than segmented trajectories since the robot doesn't have to stop after each motion and the paths are much shorter, but they are far more complicated as a result. It is highly recommended that you have a good understanding of velocity PID and how to tune it before moving on to these tutorials.

This historical 2020–2021 differential-drive trajectory material was not extensively tested. The former example repository is no longer publicly available. For a source-backed, season-specific example, read Team 1257's [2026 drivetrain case study](../../robots/2026-code.md) and [swerve and autonomous project](../1-Basics/Modern_Drivetrain_Project.md). The 2026 robot uses different hardware and software; it is not a drop-in replacement for these historical examples.
