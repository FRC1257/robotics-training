# Extra Features

So far, we've just gone over very basic control of our subsystem. In this section, we're going to learn how we can augment a bit of that to create a better experience for the people controlling our robot.

## Capping Max Speed

So far, what we've done for subsystems such as the arm or the elevator is that we've taken our input from our controller that is in the range [-1.0, 1.0] and passed it directly to our motor. However, this is frequently inadvisable because these high speeds can be incredibly unstable. In these cases, we can choose to sacrifice a bit of speed for stability by capping the max speed of our subsystem.

To do this, what we'll do is create a multiplier that will dampen down our speed whenever we send it to our subsystem. The first thing we do is that we create a constant that holds this multiplier inside of `Constants.java`.

```java
public final class Constants {

    public static class ElectricalLayout {
        public final static int CONTROLLER_DRIVER_ID = 0;
        public final static int CONTROLLER_OPERATOR_ID = 1;

        // Arm
        public final static int ARM_MOTOR_ID = 0;
    }

    public static class Autonomous {
        
    }

    public static class Arm {
        public static double ARM_MAX_OUTPUT = 0.7; // new line that we are adding
    }

    public static double PI = 3.14159265;
    public static double UPDATE_PERIOD = 0.010; // seconds

    public static int NEO_CURRENT_LIMIT = 80; // amps
}
```

Then, inside of `Arm.java`, we can apply this max output multiplier. We can simply modify the `manualControl` function. The function is originally passed in the value from the controller which is between -1.0 and 1.0. Now, we simply take that and multiply it by our multiplier, which will now limit it to between -0.7 and 0.7.

```java
public void manualControl(double speed) {
    state = State.MANUAL;
    this.speed = speed * ARM_MAX_OUTPUT;
}
```

## Precision Mode

While capping our max speed is good for stability, another issue with subsystems is precision control. When we want to move our arm just a tiny bit to get it into the correct position, it can be difficult to do so because of the nature of controller joysticks. It's hard to move a controller only a small amount while still having it be registered as an input by the computer. One way to solve this would be to just lower our max speed to something very low such as `0.5`. This would allow the operator to have a lot more control over the arm. However, this would also sacrifice our speed, meaning that we can't move the robot as quickly.

To solve this, we can implement a precision mode. The way it works is the following: when the match starts we have normal full control over our arm. Then, when we push a button such as left bumper, then the arm will enter a precision mode. Our output will now be extremely limited to a very low value, which will give the operator a lot of control over the exact position of the arm. Once the arm is properly positioned, the operator can click the left bumper again and exit precision mode, returning full control of the arm.

One issue with this method is that it takes up an extra button. Our robots frequently have many subsystems that need to be controlled, meaning that sometimes we run out of buttons to implement all of our features. As a result, it is critical to take this into account. However, to leave options open, we can always just implement this feature but not bind it to a button so that at a later date we can use the feature if we desire rather than have to reprogram it on the fly.

To implement this, we will first take a look at the `Arm.java` file. The first thing we'll do is to add a boolean to our file that will store whether or not the precision mode is enabled or not.

```java
...
public State state;
private double speed;

private boolean precisionEnabled; // new line

public Arm() {
...
```

Next, we will modify our `update()` method to adjust our speed depending on whether or not this boolean variable is true or not. Don't forget to also add the precision multiplier to the constants file! In this case, we set it to a value of `0.2`, but this can change upon testing.

```java
@Override
public void update() {
    switch(state) {
        case MANUAL:
            // this entire block has been modified
            double adjustedSpeed = speed;
            if(this.precisionEnabled) adjustedSpeed *= ARM_PRECISION_MULT;

            motor.set(adjustedSpeed);
            break;
    }
}
```

The final thing we have to do in this file is to create a function that will allow outside code to modify the `precisionEnabled` variable. We will make a simple toggle function that simply flips the value of the variable.

```java
public void togglePrecision() {
    this.precisionEnabled = !this.precisionEnabled;
}
```

Next, we need to create a new command that will switch on the precision mode. Note that we're using `InstantCommand` here because this command should just run once and execute its action.

```java
package frc.robot.commands.arm;

import edu.wpi.first.wpilibj2.command.InstantCommand;
import frc.robot.subsystems.Arm;

public class ArmTogglePrecision extends InstantCommand {

    private final Arm arm;
    
    public ArmTogglePrecision(Arm arm) {
        this.arm = arm;
    }

    @Override
    public void initialize() {
        arm.togglePrecision();
    }

    @Override
    public void end(boolean interrupted) {

    }
}
```

The final step is to bind this command to a button inside of `RobotContainer`. With that, we're done!

```java
private void configureButtonBindings() {
    operatorController.getButton(Button.kY.value).whenPressed(new ArmTogglePrecision(arm));
}
```

## Drivetrain Reverse and Slow Turn

Another common thing we do inside of our drivetrain is to implement reverse drive and slow turn. These are both toggleable features that allow us to drive backwards and turn slowly upon pressing them. These are incredibly useful features that allow the driver to control the robot more precisely. They're implemented very similarly compared to the above, so we won't go over it here. However, you can check out the example drivetrain code at [https://github.com/FRC1257/training-programs](https://github.com/FRC1257/training-programs) to see an example of how it's implemented.

## Limp Mode
We can decrease the current limit for our motors so they don't resist opposing forces as much.