# Command-Based

Now that we've gone over our program structure and some technical knowledge, we're going to discuss some of the basics behind our robot program structure.

Ultimately, to organize our robot code, we use what is known as a **command-based** design pattern. In this framework, all mechanisms on our robot are grouped into what are known as `subsystems`, and each of these `subsystems` can run certain `commands`. In almost all cases, every action that our robot can perform will be a `command`.

## Subsystems

All subsystems on a robot are composed of actuators (motors/pistons) and sensors. However, we won't worry about sensors right now. For each of these subsystems, we will make a class inside of our `/subsystems` folder that represents it. For instance, we will make a file called `Intake.java`, and this class should extend `SnailSubsystem`. In this class, we will include all of the code to run the subsystem.

Each of these subsystems will have a few actions it can do with these actuators. For instance, a drivetrain can be moved with manual driver control. An intake could either intake or eject a game piece. An elevator can use either manual control or precise closed loop control to get to a specific position.

## Commands

Each of those aforementioned actions are known as a `command`. At any given time, a subsystem has a current command running on  it that tells us what this subsystem is currently doing. For instance, an intake subsystem would have multiple commands available to it such as running in its neutral state, ejecting, or intaking an object. At any point, the roller intake subsystem would have one of these three commands running on it, which would tell us what the intake should currently be doing.

We can set which command is currently running on our subsystem in two different ways. The first way we can do it is via setting one as the default command of a subsystem, which will run as long as no other commands are scheduled to run on the subsystem. The next way to set commands to a subsystem is to associate it with the press of a button.

For instance, the roller intake might be set up such that whenever nothing is being pressed on the controller, its default `command` is to run at a low, constant speed that is associated with the neutral position. Then, if the A button is pressed, we could schedule it to run an ejecting command, and when the B button is pressed, we might schedule it so that it runs an intaking command. When these buttons are released, we can end these commands, and then the default nuetral command would take over.

## CommandScheduler

The way WPILib handles everything command-based is through something known as the `CommandScheduler`. Its function is right in the name: it executes commands that are called, preventing conflicts between commands (e.g. stopping an elevator from moving up and down simultaneously), and removing completed or interrupted commands. We have to constantly call the `CommandScheduler` to make sure it actually reads our commands and sets the robot into action. Inside our `periodic` functions, or rather in Robot.java's `robotPeriodic()`, we will put the line `CommandScheduler.getInstance().run();`. As a result, the scheduler's `run()` method will be called once every 20 ms. Here is `Robot.java`:

```java
package frc.robot;

import edu.wpi.first.wpilibj.TimedRobot;
import edu.wpi.first.wpilibj2.command.CommandScheduler;

public class Robot extends TimedRobot {

    @Override
    public void robotInit() {

    }

    @Override
    public void robotPeriodic() {
        CommandScheduler.getInstance().run();
    }

    ...
}
```

> [!TIP]
> You don't have to worry about these intricacies with `CommandScheduler` however since they are already included in our `snail-robot-template` repository, but it is useful to know what is going on in here.

## Flowchart

To help break down the entire system and make it easier to understand, we've created a flowchart for the general structure of the robot code. If the flowchart below doesn't load, [press here](https://drive.google.com/file/d/14_5zEcy0pHjJd9FZBrlYS0tvzkuuFQxd/view?usp=sharing) to view it.

<iframe frameborder="0" style="width:100%;height:525px;" src="https://app.diagrams.net/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Command%20Based%20Flowchart.drawio#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D14_5zEcy0pHjJd9FZBrlYS0tvzkuuFQxd%26export%3Ddownload"></iframe>

The blue sections are sections that WPILib handles for us, while the orange/yellow sections are sections that we don't necessarily need to program **entirely** ourselves, but we need to have a bit of code to handle them.

| Flowchart Box | Our Responsibility |
| :-: | :-: |
| Are there any subsystems with finished commands? | Define when our commands will be finished (could be custom or just button released) |
| End the command on the subsystem | Define what happens when the command ends (could be nothing) |
| Are there any new commands called? | Define when commands should be called (could be button presses) |
| Initialize the new command on the required subsystem | Define what happens when the command (how does it change the state of the subsystem initially) |
| For each subsystem, run the code associated with its current command | Define what each command actually does periodically (how does it change the state of subsystems over time) |
| For each subsystem, adjust its actuators depending on the current state | In each subsystem, determine how to act depending on the state |
