# Command (Roller Intake)

With our subsystem file finished and filled with constants, it is now time to go onto the next topic: commands.

## What are commands?

Each action that the robot can perform should be represented as a command. The purpose of a command is to make the robot actually complete an action. As a result, there is usually one command per subsystem state. Each subsystem will *always* have a command running on it, whether it be a default neutral command, or a command called manually.

Here is the flowchart explaining the entire program again. If the flowchart does not load, please [press here](https://drive.google.com/file/d/1OdYeyfamvG7weoWkQY1DDX4__NVKelgm/view?usp=sharing) to view a copy of it.

<iframe frameborder="0" style="width:100%;height:343px;" src="https://app.diagrams.net/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Roller%20Intake%20Flowchart.drawio#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1OdYeyfamvG7weoWkQY1DDX4__NVKelgm%26export%3Ddownload"></iframe>

Looking at our flowchart, this section will handle defining what our commands do and how they modify the state of the roller intake subsystem. The corresponding cells are: "Initialize the command on the roller intake (does nothing for this subsystem)" and "Call the currently running command, which will configure the state of the roller intake."

## Command File Format

We'll continue working with a roller intake. Below, you'll find the basic skeleton of a command.

One thing you should note is the naming of the command: first comes the name of the subsystem, then the action, and then the word `Command`. This way, we can keep our class names consistent while also making them easy to organize / find. Note that this creates some interesting command names, as you will see with `RollerIntake + Intake + Command = RollerIntakeIntakeCommand`.

Our class will extend `CommandBase`, which essentially allows our command to be recognized by WPILib's command-based framework.

```java
package frc.robot.commands.rollerintake;

import edu.wpi.first.wpilibj2.command.CommandBase;
import frc.robot.subsystems.RollerIntake;

public class RollerIntakeIntakeCommand extends CommandBase {

    public RollerIntakeIntakeCommand()

    }

    @Override
    public void initialize() {

    }

    @Override
    public void execute() {

    }

    @Override
    public void end(boolean interrupted) {

    }

    @Override
    public boolean isFinished() {

    }
}
```

Now we will briefly look over the purpose of the constructor and each function.

* `RollerIntakeIntakeCommand()` - This is the constructor for the command. All this deals with is defining the intake for usage in the subsequent functions.

* `initialize()` - This function is run once when the command is first scheduled. Nothing is usually put here since we generally use commands to call subsystem functions (therefore nothing really to initialize).

* `execute()` - This function runs constantly at 50 Hz (once per period of 20 ms) *while* the command is scheduled. We use this to change the state of the subsystem with our command. This is where the actual functionality of our command is defined. 

* `end(boolean interrupted)` - The end function is run once when the command ends, whether `isFinished()` returned true, or if the command was interrupted. It is usually used for reverting the subsystem back to the default state although occasionally, it is also used for other things like setting variables to certain values.

* `isFinished()` - This function is called after `execute()` and is in charge of setting the conditions for which the command should stop running. If this returns true, then `end()` is called, and the command is unscheduled.

## Roller Intake Functionality

Now that we have the skeleton of the command out of the way, we can start programming the command.

### Initializing the Command

```java
public class RollerIntakeIntakeCommand extends CommandBase {

    private RollerIntake rollerIntake;

    public RollerIntakeIntakeCommand(RollerIntake rollerIntake) {
        this.rollerIntake = rollerIntake;

        addRequirements(rollerIntake);
    }

    @Override
    public void initialize() {

    }
```

* We first declare a variable for the subsystem we will be using so that we can send instructions to it when this command is being processed by WPILib

* Then, we define the constructor as taking in the subsystem that will be adjusted by the command.

* After that, we define the requirements of the command with `addRequirements(rollerIntake)`. **The purpose of `addRequirements()` is for the `CommandScheduler` to know which subsystems are being used for commands.** If the scheduler sees two commands running that *both* have the `RollerIntake` subsystem as a requirement, it will cancel the earlier command in favor of the new one.

* Lastly, there is the `initialize()` function. There is currently nothing inside of it as this is a basic command. Though it is still not deleted in case there will be a future need of it. It is generally a good idea not to delete these functions from our class even if they are unused because we may find that we need to add stuff for debugging.

### Changing The Subsystem State

```java
    @Override
    public void initialize() {
    }

    @Override
    public void execute() {
        rollerIntake.intake();
    }
```

In `execute()`, there is only one line, and this line is entirely responsible for actually making the robot enter the `INTAKING` state. Recall that in our subsystem file, we made the function called `intake()`, which we now call in `execute()`.

```java
// from RollerIntake.java
public void intake() {
    state = State.INTAKING;
}
```

By calling this function, we actually change the subsystem state to `INTAKING` which triggers the update function to respond and command the motor accordingly.

```java
// Note: this code is inside of our RollerIntake.java file and is already programmed

@Override
public void update() {
    switch(state) {
        case NEUTRAL:
            rollerIntakeMotor.set(0.0);
            break;
        case INTAKING:
            rollerIntakeMotor.set(1.0);
            break;
        case EJECTING:
            rollerIntakeMotor.set(-1.0
            break;
        }
}
```

### Other Commands

If we were writing, for instance, `RollerIntakeEjectCommand` or `RollerIntakeNeutralCommand`, they would look nearly identical to `RollerIntakeIntakeCommand`. The only major change would be in `execute()`, with either `rollerIntake.eject()` or `rollerIntake.neutral()`.

### Ending The Command

With the main functionality of the command complete, it is now time to define what happens to it when it ends.

```java
    ...

    @Override
    public void end(boolean interrupted) {
        rollerIntake.neutral();
    }

    @Override
    public boolean isFinished() {
        return false;
    }
}
```

* The `end()` function is called when the command is finished running. In this case, the `RollerIntake` is reverted to the `neutral` state, which we defined as the default.
  * Side note: when the function is called, the `interrupted` variable will either be set to `true` or `false` depending on how the function was ended. The `interrupted` variable is set to `true` if another command had interrupted this command.
* The `isFinished()` function is in charge of giving the conditions for which a command ends. By default, `false` is returned, which means that the function will never end by some specified condition in `isFinished()`. Instead, it will end when its corresponding button/trigger is no longer calling the command (we'll cover binding commands in the next section).

<hr>

Below is all of the code we wrote for `RollerIntakeIntakeCommand`. Next, we'll cover how to call these commands with user input.

```java
package frc.robot.commands.rollerintake;

import edu.wpi.first.wpilibj2.command.CommandBase;
import frc.robot.subsystems.RollerIntake;

public class RollerIntakeIntakeCommand extends CommandBase {

    private RollerIntake rollerIntake;

    public RollerIntakeIntakeCommand(RollerIntake rollerIntake) {
        this.rollerIntake = rollerIntake;

        addRequirements(rollerIntake);
    }

    @Override
    public void initialize() {
    }

    @Override
    public void execute() {
        rollerIntake.intake();
    }

    @Override
    public void end(boolean interrupted) {
        rollerIntake.neutral();
    }

    @Override
    public boolean isFinished() {
        return false;
    }
}
```
