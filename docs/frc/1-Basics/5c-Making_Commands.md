# Making commands

**Prerequisites:** [subsystems](5-First_Subsystem.md), [lambdas](../../java/3-Functions/5-Lambdas.md). A command is scheduled, initialized, executed across scheduler iterations, and ended either normally or by interruption. The scheduler resolves conflicting subsystem requirements. The starter uses:

```java
Commands.runEnd(() -> intake.setSpeed(0.5), () -> intake.setSpeed(0), intake)
    .withTimeout(2);
```

The last argument reserves the intake; `runEnd` also provides a stop action when interrupted. This is an excerpt from the starter, not a standalone class. Avoid blocking loops or sleeps in commands. `withTimeout` ends the decorated command when the time expires; disabling the robot cancels ordinary commands.

**Exercise:** start the command and disable early. Expected: output returns to zero. Start another command requiring the same subsystem and explain why the scheduler interrupts the first. If a motor would keep running, inspect `end`/`runEnd` and requirements. See [WPILib commands](https://docs.wpilib.org/en/stable/docs/software/commandbased/commands.html).

<!-- lab: scheduler -->

[Archived original lesson](../archive/Making_Commands_legacy.md) (historical APIs; unverified).
