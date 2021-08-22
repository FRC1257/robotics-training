# Quick Guide to Making a Subsystem

This article will just be a quick list of all of the steps necessary to program a subsystem. It won't go into any exact details, so consult the previous subsystem tutorials for that.

## Create Project from snail-robot-template (if making a new project)

1. Go to [https://github.com/FRC1257/snail-robot-template] and press the green `Use this template` button to create a new project if you are making a new project. If working on an already existing project, skip this step.
2. If working on the GitHub website, skip the rest of this section. If using Visual Studio Code, follow the rest of the instructions.
3. Open GitHub Desktop and log in if necessary. Go to File > Clone Repository and then select the repository that you just created in Step 1.
4. Select a local area on your computer where you will download this project to. It is highly recommended that you make a folder on your computer in your Desktop or Documents folder for containing all robotics projects.
5. Press the Clone button and wait for the project to download.
6. Open VS Code. If you chose to install it separately from an existing Visual Studio Code installation, make sure the version of Visual Studio Code you're opening says "WPILib VS Code" instead of just "VS Code".
7. In VS Code, open the folder for your robot project by going to File > Open Folder. Then, select the folder containing your robot project. This should be the one that has the exact same name as the GitHub repository and should not be a parent folder of that.

## Create Subsystem File

1. Inside of the /subsystems folder, create a file to contain the code for your new subsystem. For instance, if you are making an elevator, it should be called `Elevator.java`. Make sure you add the `.java` tag to show that this is a Java file.
2. If editing in GitHub, scroll to the bottom of this article and copy and paste the preexisting template into your subsystem file. Then, skip to Step 5.
3. If editing inside of VS Code, then the class should have automatically generated as the following. If it did not, then make sure you have opened the correct version of VS Code and that you opened the correct folder.

```java
package frc.robot.subsystems;

public class SubsystemNameHere {
    
}
```

4. Add `extends SnailSubsystem` after the class definition. In VS Code, the subsystem name should now be underlined in red. Click on the subsystem name and then a yellow lightbulb icon should appear to the side. Click the lightbulb to see options to fix the error automatically and press `Add unimplemented methods`. In general, if you see a red underline in your code, you can use the lightbulb to help fix things such as import errors.
5. Add all of the actuators (motors and pneumatics) that are part of the subsystem. Make sure to declare them as variables before the constructor and then instantiate them inside of the constructor.
6. Create an enum called `State` that represents all of the possible states or operating modes the subsystem could be in.
7. Create a variable of the type `State` that will hold the current state of the subsystem. 
8. Add the switch statement to the `update()` method that will look at the current state and set the actuators accordingly.
9. Add extra methods that will allow outside code to modify the state of the subsystem such as `manualControl()` or `intake()`.

## Command

Repeat these steps for each command present in your subsystem.

1. If editing in GitHub, creating the folder for the commands will be a bit difficult. To do so, go to the /robot directory. Then, create a file with the following name: `commands/subsystem_name_here/command_name_here.java`. This will create the folders necessary.
2. If inside VS Code, you can simply right click /robot and create new folders. Create a folder called `commands` and then another folder inside that with the name of your subsystem (in lowercase).
3. Create the file for the command and make sure it follows this general structure: Subsystem Name + Action + `Command.java`. For instance, `ElevatorManualControlCommand.java` (sometimes shortened to `ElevatorManualCommand.java`).
4. Regardless of whether you are coding in GitHub or VS Code, scroll to the bottom of the article and copy the template for the Command into your file.
5. Replace `CommandNameHere` with the name of your command and `SubsystemNamdHere` with the name of your subsystem. Make sure the lowercase `subsystemNameHere` uses lowercase.
6. If applicable, you may also need to add a `DoubleSupplier` to the variables of the command and the constructor. See the `Arm` tutorial for how to do this.
7. Depending on the action of your command, add the appropriate instructions for the command inside of `initialize()` or `execute()`.
8. Depending on the action of your command, you may want to change `isFinished()` to `return true;`.

## RobotContainer

1. Go to the file `RobotContainer.java`.
2. Under the line `private ArrayList<SnailSubsystem> subsystems;`, create an instance of your subsystem like the following. Again, make sure you respect the capitalization.

```java
private SubsystemNameHere subsystemNameHere;
```

3. Inside of `configureSubsystems()`, instantiate the new subsystem

```java
subsystemNameHere = new SubsystemNameHere();
```

4. If applicable, set up the default command on the subsystem. Some commands may also need you to pass a speed supplier into the constructor. Do this with the `::` notation (check the `Arm` tutorial for more details).

```java
subsystemNameHere.setDefaultCommand(new SubsystemDefaultCommand(subsystemNameHere));
```

5. Register the subsystem by adding it to the Arraylist.

```java
subsystems.add(subsystemNameHere);
```

6. Inside of `configureButtonBindings()`, bind button actions to commands. This line is entirely customizable depending on which controller you're using, which button you're using, how the button should be bound to the command, and which command you're using. Below is just a few examples of command bindings we've used in the past.

```java
operatorController.getButton(Button.kA.value).whileHeld(new IntakeIntakeCommand(intake)); 
operatorController.getButton(Button.kB.value).whileHeld(new IntakeEjectCommand(intake));

operatorController.getButton(Button.kX.value).whenPressed(new ClimbAdvanceCommand(climb));
operatorController.getButton(Button.kY.value).whenPressed(new ClimbBackCommand(climb));
```

## Examples

For a list of tons of examples of subsystems we've programmed in the past, check this out for [examples](https://github.com/FRC1257/training-programs)!

## File Templates

### Subsystem File

```java
package frc.robot.subsystems;

public class Roller extends SnailSubsystem {

    @Override
    public void update() {
        
    }

    @Override
    public void outputValues() {

    }

    @Override
    public void setUpConstantTuning() {

    }

    @Override
    public void getConstantTuning() {

    }
}
```

### Command File

```java
package frc.robot.commands.intake;

import edu.wpi.first.wpilibj2.command.CommandBase;

public class CommandNameHere extends CommandBase {

    private final SubsystemNameHere subsystemNameHere;
    
    public CommandNameHere(SubsystemNameHere subsystemNameHere) {
        this.subsystemNameHere = subsystemNameHere;
        addRequirements(subsystemNameHere);
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
        return false;
    }
}
```