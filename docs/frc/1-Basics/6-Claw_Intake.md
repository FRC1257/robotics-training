# Claw Intake

Now that you know the basics behind making a subystem and its supporting files, we are going to cover making other common subsystems to practice. The next few lessons will be about learning each of the major subsystems that 1257 uses and how to program them.

## Overview

![openClaw](img/openClaw.jpeg) ![closedClaw](img/closedClaw.jpeg)

The first subsystem we'll be covering is a claw intake, which uses force to clamp onto game pieces and hold them. Above is what a typical claw looks like that uses pneumatics to control the actuation of the claw. In this specific instance, when the cylinder extends, the claw closes, and when it retracts, the claw opens. In the past, we've used claws in robots such as Team 1257's second 2018 robot (the original robot did not have a claw, but it was rebuilt for the offseason Brunswick Eruption event).

### Why Pneumatics?

When looking at a claw, pneumatics seem to be an obvious choice. Pneumatics excel when a mechanism only has two states and needs to hold that state with a lot of force, which works perfectly with pneumatics. The compressed air provides a lot of force with which we can clamp down on game pieces and hold them firmly. Since we don't need to have the claw in any intermediate position between closed or open, the discrete nature of pneumatics is actually a bonus since doing the same with motors would rely on some complicated control to get the claw's movement consistent.

## Subsystem File

### Declaring Solenoids

```java
package frc.robot.subsystems;
import edu.wpi.first.wpilibj.DoubleSolenoid;
import edu.wpi.first.wpilibj.DoubleSolenoid.Value;

import static frc.robot.Constants.ElectricalLayout.*;
import static frc.robot.Constants.Claw.*;

public class Claw extends SnailSubsystem {

    private DoubleSolenoid rightSolenoid;
    private DoubleSolenoid leftSolenoid;
```

First, the solenoids are declared. Since this subsystem uses pneumatics (air) instead of motors, solenoids replace motor controllers in the code. The solenoids are responsible for determining if air goes to the pneumatic cylinders or not. Since the claw we are making has a pneumatic cylinder on each side, there are two solenoids declared. Each of the solenoids is a part of the class `DoubleSolenoid` which means that the solenoids can hold two positions, forward and reverse. Each of these corresponds to the claw being either open or closed.

Note: A different class would be used for a single-acting solenoid, which can apply force to one direction, but not the other.

### States

```java
    public enum State {
       CLOSED,
       OPEN
    }

    private State state;
```

After declaring the solenoids, the states are declared. For the claw subsystem, there are only two states: `CLOSED` and `OPEN`. Closed represents when the claw shuts around the object and open is when the claw is opened so it is not capable of holding an object.

### Constructor

```java
    public Claw() {
        leftSolenoid = new DoubleSolenoid(CLAW_LEFT_FORWARD_ID, CLAW_LEFT_REVERSE_ID);
        rightSolenoid = new DoubleSolenoid(CLAW_RIGHT_FORWARD_ID, CLAW_RIGHT_REVERSE_ID);

        state = State.OPEN;
    }
```

The constructor is pretty simple as all we do is just set up the solenoids and set up our initial state. In the parameters, there are two IDs representing the forward and reverse direction for each pneumatic cylinder. The reason there are two IDs is because air needs to be pumped from a different tube for each direction the double-acting solenoid makes the piston in the cylinder go in. In our previous subsystem, we would also define a ton of motor configuration settings here, but solenoids are much simpler and don't have such methods.

### Update Function

```java
    @Override
    public void update() {
        switch(state) {
            case CLOSED:
                leftSolenoid.set(Value.kForward);
                rightSolenoid.set(Value.kForward);
                break;
            case OPEN:
                leftSolenoid.set(Value.kReverse);
                rightSolenoid.set(Value.kReverse);
                break;
        }
    }
```

Once each of the solenoids is defined and the states are declared, the update function is made in order to define what happens during each state. In the `CLOSED` state the pneumatic cylinders extend as the solenoids are set to `Value.kForward` which will close the claw. In the `OPEN` state, the pneumatic cylinders retract as the solenoids are set to `Value.kReverse`, which will open the claw.

### State Functions

```java
    public void open() {
        state = State.OPEN;
    }

    public void close() {
        state = State.CLOSED;
    }

    public State getState() {
        return state;
    }
}
```

The next thing that is done is the declaration of the functions that have to do with modifying the state. These will be used in the next section and will be called by our commands to perform actions on our subsystem.

### ShuffleBoard Functions

```java
    @Override
    public void displayShuffleboard() {

    }

    @Override
    public void tuningInit() {

    }

    @Override
    public void tuningPeriodic() {

    }
```

Just like before, we need these functions present in our file to allow the robot project to compile. However, we will be leaving them blank for now.

## Commands

### Close Command

```java
package frc.robot.commands.claw;

import edu.wpi.first.wpilibj2.command.CommandBase;
import frc.robot.subsystems.Claw;

public class ClawCloseCommand extends InstantCommand {

    private Claw claw;

    public ClawCloseCommand(Claw claw) {
        this.claw = claw;

        addRequirements(claw);
    }

    @Override
    public void initialize() {

    }

    @Override
    public void execute() {
        claw.close();
    }

    @Override
    public void end(boolean interrupted) {
        
    }
}
```

The commands here are very similar to those of the roller intake in that all it does is simply call a single function on our `Claw.java` subsystem.

One important caveat here is that while we were programming the roller intake's commands, we put code to return the intake to its neutral position when the command ended. However, here, we don't actually want to do that. The reason is because we want the commands to sort of act as a toggle for the claw. When `ClawCloseCommand` is ran, it should just close the claw. However, when it has stopped running, we don't want to just have the claw opened up again; we want to keep it closed. On the other hand, our roller intake shouldn't act as a toggle.

Another important thing to note is that we used `InstantCommand` instead of `CommandBase` here. The reason we did is that because this type of command is one that will just perform a single action and then instantly end. To make this happen, we can use the `InstantCommand` parent class, which is actually a subclass of `CommandBase`. We can actually put the `claw.close()` instruction in either `initialize()` or `execute()` since they will both run once. Because the command is an `InstantCommand`, we don't actually need to override the `isFinished()` function, and doing so will actually result in an error.

### Open Command

The command for opening is the exact same as the command for closing besides the change in the function called during `execute()` Nevertheless, the code for this command is included below.

```java
package frc.robot.commands.claw;

import edu.wpi.first.wpilibj2.command.CommandBase;
import frc.robot.subsystems.Claw;

public class ClawOpenCommand extends InstantCommand {

    private Claw claw;

    public ClawOpenCommand(Claw claw) {
        this.claw = claw;

        addRequirements(claw);
    }

    @Override
    public void initialize() {

    }

    @Override
    public void execute() {
        claw.open();
    }

    @Override
    public void end(boolean interrupted) {

    }
}
```

If the specific functions in the commands need more explanation, refer to the section in the Roller Intake tutorials that cover making commands in more depth.

## Robot Container (Bindings)

The bindings for a claw are extremely similar to the roller intake bindings. If more information is needed about how bindings work, please go to the roller intake bindings tutorial.

```java
package frc.robot;

import edu.wpi.first.wpilibj.Notifier;
import edu.wpi.first.wpilibj.XboxController.Button;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.Command;
import frc.robot.subsystems.SnailSubsystem;
import frc.robot.util.SnailController;
import frc.robot.subsystems.Claw;

import frc.robot.commands.claw.ClawCloseCommand;
import frc.robot.commands.claw.ClawOpenCommand;
import java.util.ArrayList;

import static frc.robot.Constants.ElectricalLayout.CONTROLLER_DRIVER_ID;
import static frc.robot.Constants.ElectricalLayout.CONTROLLER_OPERATOR_ID;
import static frc.robot.Constants.UPDATE_PERIOD;

public class RobotContainer {

    private SnailController driveController;
    private SnailController operatorController;

    private Claw claw;

    private ArrayList<SnailSubsystem> subsystems;

    public RobotContainer() {
        driveController = new SnailController(CONTROLLER_DRIVER_ID);
        operatorController = new SnailController(CONTROLLER_OPERATOR_ID);

        configureSubsystems();
        configureButtonBindings();
    }

    private void configureSubsystems() {
        claw = new Claw();

        subsystems = new ArrayList<>();
        subsystems.add(claw);
    }

    private void configureButtonBindings() {
        operatorController.getButton(Button.kX.value).whenPressed(new ClawCloseCommand(claw));
        operatorController.getButton(Button.kY.value).whenPressed(new ClawOpenCommand(claw));
    }
}
```

In here, almost everything here is the same as for the roller intake except for a few crucial differences. First of all, we don't set up a default command for our `Claw` subsystem. Instead, we will take both of our commands and assign them to buttons.

In `configureButtonBindings()`, we take our X and Y buttons on our Xbox controller and set them up so that they run the appropriate commands. Here, we chose to use `whenPressed()` instead of `whileActiveOnce()`. For more details on all of the possibilities, see the section on binding commands in the roller intake tutorials.

Here, we want to use `whenPressed()` because we just want the command to run once when the button is first pressed. This will cause the claw intake to change its state, and after it runs once, there's no need to keep the command running. As a result, using `whenPressed()` fits this perfectly since we just want the command to run when the button is pressed but it doesn't have to keep running while the button is being held down.

## Constants

Below is the constants file which is self-explanatory and has been reviewed in the roller intake subsystem tutorial. Refer to that if you need a refresher.

```java
package frc.robot;
public final class Constants {

    public static class ElectricalLayout {
        public final static int CONTROLLER_DRIVER_ID = 0;
        public final static int CONTROLLER_OPERATOR_ID = 1;

        public final static int CLAW_LEFT_FORWARD_ID = 0;
        public final static int CLAW_LEFT_REVERSE_ID = 1;
        public final static int CLAW_RIGHT_FORWARD_ID = 2;
        public final static int CLAW_RIGHT_REVERSE_ID = 3;
    }

    public static class Autonomous {
        // nothing
    }

    public static class Claw {
        // nothing here for now
    }

    public static double PI = 3.14159265;
    public static double UPDATE_PERIOD = 0.010;

}
```

## Final Remarks

If there are any lingering questions about anything gone over in this lesson, please contact a senior programming member.

With the claw lesson over, you now know how to code two major subsystems that team 1257 uses! Next lesson, we will learn about yet another subsystem that team 1257 uses nearly every year: the arm!
