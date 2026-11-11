<!-- ai-assisted -->

# Interactive labs

Start with the guided walkthrough: use **Next** to change one idea at a time and read what to notice in the visual. Choose **Explore controls** when you want to vary inputs yourself; **Return to guide** resets the current step. The labs run locally in your browser with no account or installation. They are teaching models, not validated robot simulations or hardware tuning tools.

## Concept labs

- [PID and feedforward lab](labs/pid.html ':ignore') — investigate error, saturation, windup, and gravity compensation.
- [Swerve kinematics lab](labs/swerve.html ':ignore') — investigate coordinate frames, module velocities, desaturation, and steering optimization.

- [Command scheduler lab](labs/scheduler.html ':ignore') — step through requirements, interruption, release, and default commands.
- [Encoder units and homing lab](labs/encoder.html ':ignore') — trace turns to distance and interpret switch polarity.

- [Motion profile lab](labs/motion.html ':ignore') — compare triangular and trapezoidal rest-to-rest reference moves.

- [Robot log explorer](labs/log.html ':ignore') — inspect recorded voltage, module velocity, and enabled samples.
- [Odometry and delayed vision lab](labs/odometry.html ':ignore') — compare drift and a simplified timestamped correction.

## Mechanisms and real robot code

Open a robot-type lesson to use its embedded demo beside the explanation. Each pairs an original browser model with a short, pinned, MIT-licensed excerpt from Team 254 or Team 2910. Follow the short walkthrough first, then choose **Explore controls** for Run/Pause, 20 ms steps, sensor inputs, decisions and outputs; the browser does not execute the team's Java.

| Mechanism lesson | Try changing | Full-size demo |
| --- | --- | --- |
| [Fixed-heading shooter](../robot-types/fixed-shooter.md) | Wheel speed and chassis heading before feed | [Open](mechanism-fixed-shooter.html) |
| [Turreted shooter](../robot-types/turret-shooter.md) | A reachable angle, a travel limit and a wrapped equivalent | [Open](mechanism-turret-shooter.html) |
| [Piece handling](../robot-types/piece-handling.md) | Front/back sensor priority and collection versus holding | [Open](mechanism-piece-handling.html) |
| [Elevator and wrist](../robot-types/elevator-wrist.md) | A home reference, clearance height and wrist angle | [Open](mechanism-elevator-wrist.html) |
| [Telescoping arm](../robot-types/telescoping-arm.md) | Shoulder alignment before extension | [Open](mechanism-telescoping-arm.html) |
| [Drivetrain](../robot-types/drivetrain.md) | Translation, rotation and the lateral-drive constraint | [Open](mechanism-drivetrain.html) |
| [Climber](../robot-types/climb-balance.md) | Homing, simulated cage detection and lift permission | [Open](mechanism-climb-balance.html) |

The source panel identifies the team, revision, file and lines, and explains what the demo adds or simplifies. Sensor toggles are scenario inputs, not proof of physical detection or engagement. The climber demo illustrates a cage-related sequence, not a charge-station balance simulation.

All labs work with a keyboard. Use the numerical results alongside the plots and diagrams. Ask a mentor to review any plan to apply a concept to a real robot.
