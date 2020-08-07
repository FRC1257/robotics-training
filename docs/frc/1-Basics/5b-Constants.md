# Constants (Roller Intake)

## Overview

In our subsystems, you might have noticed that we directly typed in numbers for numerical constants, such as motor speeds in `.set()`. While the original programmer might understand what such a number means and why it's there, this gets messy and becomes confusing for other programmers reading the code.

To allay confusion, a `constant`, or a variable assigned to that numerical value, is used. This variable is declared in `Constants.java` and the `final` keyword is usually used when making them so they can not be changed while the code is being run. By using a `constant`, a programmer can quickly see the function of that "magic number" in the code and they can quickly modify it in the future since all of the constants are in one place.

## Examples

Below are two examples of where constants can be useful.

```java
public RollerIntake() {
    rollerIntakeMotor = new CANSparkMax(2, MotorType.kBrushless);
    ...
}
```

turns into

```java
public RollerIntake() {
    rollerIntakeMotor = new CANSparkMax(ROLLER_INTAKE_MOTOR_ID, MotorType.kBrushless);
    ...
}
```

In this example, we take away the "magic number" `2` from our program and replace it with a name so we can see where it is. Also, by moving the number out of this file and putting all of our various constants in the same file, it makes tracking down the value of this number extremely easy.

---

```java
case NEUTRAL:
    rollerIntakeMotor.set(0.0);
    break;
```

turns into

```java
case NEUTRAL:
    rollerIntakeMotor.set(ROLLER_INTAKE_NEUTRAL_SPEED);
    break;
```

Now, instead of guessing what 0.0 means (speed, port, some mode), the reader will easily understand that it pertains to the speed during the neutral state.

## The Constants File

Above, we briefly showed how to use the constants in code. Now we will get to making the variables for constants in `Constants.java`. Below is the basic layout:

```java
package frc.robot;

public final class Constants {

    public static class ElectricalLayout {

    }

    public static class Autonomous {

    }

    public static class RollerIntake {

    }

    // Other global/misc. constants such as current limits or pi
}
```

Let's break down the file structure:

Within the `Constants` file, there are 3+ subclasses inside of it: `ElectricalLayout`, `Autonomous`, and one class per subsystem. In this case, we only made one subsystem, so we have a single nested static class named `RollerIntake`. Each class is sort of a container to better organize our various constants and improve readability in this file.

- The `ElectricalLayout` stores the various IDs used by our actuators, controllers, and sensors. Every subsystem has all of their IDs in there. Anytime a change is made to the robot and we need to edit any IDs, we can quickly visit this class.

- `Autonomous` holds enums and variables which are only related to autonomous. Don't worry about this for now.

- Subsystems (such as `RollerIntake`) each have their own static class, where constant values such as motor speeds and setpoints for advanced control are organized here. For example, `ROLLER_INTAKE_NEUTRAL_SPEED` is a constant value goes here.

## Naming Convention

Constants are named slightly differently compared to normal variables. The reason is to identify them more easily on your code.

- Constants are always completely upper-case.
- Words are separated by underscores.

Example: `ROLLER_INTAKE_EJECT_SPEED`

## Creating Constants

```java
package frc.robot;

public final class Constants {

    public static class ElectricalLayout {
        public final static int ROLLER_INTAKE_MOTOR_ID = 2;
    }

    public static class Autonomous {
        // nothing
    }
    public static class RollerIntake {
        public static double ROLLER_INTAKE_NEUTRAL_SPEED = 0.0;
        public static double ROLLER_INTAKE_INTAKE_SPEED = 1.0;
        public static double ROLLER_INTAKE_EJECT_SPEED = -1.0;
    }

    // Other constants such as current limit
    public static int NEO_550_CURRENT_LIMIT = 25;

}
```

In this example, there is something that may look peculiar. The ID is declared with a `final` keyword while all of the other constants are not. The reason is that constants such as motor speeds may need to be adjusted during testing, so we don't create them as final. We will discuss this again later when we go over constant tuning.

Another important thing to notice is the phrase `public static` in front of every variable. `public` makes the constant globally accessible, and `static` means that this variable belongs to the class itself, not an object of it. For more information on `static` variables, check [this link](https://beginnersbook.com/2013/04/java-static-class-block-methods-variables/). For now, just know that all of our constants must have the prefix `public static`, while `final` is optional.

## Using Constants

```java
...
import com.revrobotics.CANSparkMax;
import com.revrobotics.CANSparkMax.IdleMode;
import com.revrobotics.CANSparkMaxLowLevel.MotorType;

public class RollerIntake extends SnailSubsystem {
    ...
}
```

Now that the constants are imported, it is time to put them where they belong. Below is the code from the previous lesson, except for the fact that the `Constant.java` variables are now used.

```java
package frc.robot.subsystems;

import com.revrobotics.CANSparkMax;
import com.revrobotics.CANSparkMax.IdleMode;
import com.revrobotics.CANSparkMaxLowLevel.MotorType;

import frc.robot.Constants;

public class RollerIntake extends SnailSubsystem {

    private final CANSparkMax rollerIntakeMotor;

    public enum State {
        INTAKING,
        EJECTING,
        NEUTRAL
    }

    State state = State.NEUTRAL;

    public RollerIntake() {
        rollerIntakeMotor = new CANSparkMax(Constants.ElectricalLayout.ROLLER_INTAKE_MOTOR_ID, MotorType.kBrushless);
        rollerIntakeMotor.restoreFactoryDefaults();
        rollerIntakeMotor.setIdleMode(IdleMode.kBrake);
        rollerIntakeMotor.setSmartCurrentLimit(Constants.NEO_550_CURRENT_LIMIT);
    }

    @Override
    public void update() {
        switch(state) {
            case NEUTRAL:
                rollerIntakeMotor.set(Constants.RollerIntake.ROLLER_INTAKE_NEUTRAL_SPEED);
                break;
            case INTAKING:
                rollerIntakeMotor.set(Constants.RollerIntake.ROLLER_INTAKE_INTAKE_SPEED);
                break;
            case EJECTING:
                rollerIntakeMotor.set(Constants.RollerIntake.ROLLER_INTAKE_EJECT_SPEED);
                break;
        }
    }

    public void neutral() {
        state = State.NEUTRAL;
    }

    public void eject() {
        state = State.EJECTING;
    }

    public void intake() {
        state = State.INTAKING;
    }

    public State getState() {
        return state;
    }
}
```

### Import Static

However, it might get tiring to have to write `Constants.RollerIntake` or `Constants.` in front of everything. Instead of doing this, we can use somethign known as a `static import`. We can include these three lines at the top of our file underneath the rest of our import statements.

```java
import static frc.robot.Constants.ElectricalLayout.*;
import static frc.robot.Constants.RollerIntake.*;
import static frc.robot.Constants.NEO_550_CURRENT_LIMIT;
```

These lines allow us to import all of the static variables either contained within entire classes like `ElectricalLayout` or `RollerIntake`, or allow us to import specific static variables we need such as `NEO_550_CURRENT_LIMIT`. As a result, we no longer have to say `Constants.RollerIntake.ROLLER_INTAKE_NEUTRAL_SPEED` and can instead just put `ROLLER_INTAKE_NEUTRAL_SPEED`.

However, we don't **have** to do this and we can omit that occasionally (if we forget). We would prefer to use more static imports to increase code readability and brevity, but it is not strictly necessary.
