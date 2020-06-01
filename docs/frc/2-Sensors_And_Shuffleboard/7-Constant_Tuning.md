# Constant Tuning

One thing that we commonly do with our robot is constant tuning. Essentially, we have constants such as intake speeds that we want to fine tune so that they work effectively. However, redeploying code to the robot can take anywhere from 30 seconds to a minute, making it desirable to update constants without needing to redeploy code. Luckily, we can do this with Shuffleboard.

While we can display data in Shuffleboard, we can also modify values that we put inside of Shuffleboard. For instance, if we put a number onto Shuffleboard, we can click on it in Shuffleboard and write in something else.

## Getting Constants onto Shuffleboard

First, we need to somehow get the modifiable values into Shuffleboard. We do this with the `tuningInit()` function in every subsystem. We simply just put all of our constants and their initial values here.

```java
public class Arm extends SnailSubsystem {
    ...

    @Override
    public void tuningInit() {
        SmartDashboard.putNumber("Arm Max Speed", ARM_MAX_SPEED);
    }

    @Override
    public void tuningPeriodic() {

    }
}
```

> [!WARNING]
> Do **NOT** use arrays for constant tuning. They are **NOT** editable.

Just a note for when you're actually using the robot, enable `Test Mode` for a brief second before going back to `Teleoperated Mode` to actually populate Shuffleboard with the constant tuning variables.

## Retrieving Constants from Shuffleboard

Once we have put the constants put in Shuffleboard, we need to actually query Shuffleboard for if there are any changed values. Then, we need to store these back in our code. We can do this in the `tuningPeriodic()` function.

All of the functions for Shuffleboard that retrieve values are named the same as those for putting data. The only difference is that `put` is replaced with `get`.

One important thing is the meaning of the second parameter when we use `get` instead of `put`. When we used `put`, this would represent what we're trying to send to the Shuffleboard. However when we use `get`, this represents the default value. Essentially, if the key you're querying does not exist, it will return the default value. Though, if it does exist in Shuffleboard, it will return the actual value in Shuffleboard instead. For constant tuning, we will set it so that if the key does not exist, it will just return the same constant so we do not modify anything.

```java
public class Arm extends SnailSubsystem {
    ...

    @Override
    public void tuningInit() {
        SmartDashboard.putNumber("Arm Max Speed", ARM_MAX_SPEED);
    }

    @Override
    public void tuningPeriodic() {
        ARM_MAX_SPEED = SmartDashboard.getNumber("Arm Max Speed", ARM_MAX_SPEED);
    }
}
```

Another note: when you're actually using the robot, you need to set the boolean `Testing` to true while `Teleoperated Mode` is enabled so that the robot will actually query the Shuffleboard for updates.
