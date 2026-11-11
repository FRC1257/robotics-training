# Binding commands

After [making a command](5c-Making_Commands.md), connect it to a trigger. The starter uses a dashboard button so it needs no physical controller. In a project with an installed `CommandXboxController controller`, a typical binding is:

```java
controller.a().whileTrue(
    Commands.runEnd(() -> intake.setSpeed(0.5), () -> intake.setSpeed(0), intake));
```

This excerpt requires a controller, imports and a subsystem defined by the project. The command runs while the trigger is held and is canceled on release; the end action stops output. Requirements still prevent conflicts. Don't assume a held trigger restarts a command that has already ended without checking WPILib semantics.

**Task:** trace press, hold, release and disable on paper; then use a simulated controller in a mentor-reviewed project. Expected: stop on release or interruption. If a binding does not fire, check port and Driver Station enable state. [WPILib binding reference](https://docs.wpilib.org/en/stable/docs/software/commandbased/binding-commands-to-triggers.html).
