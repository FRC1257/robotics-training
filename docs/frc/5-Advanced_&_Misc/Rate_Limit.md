# Rate Limiting

## Filters

In a way, you can think of controlling a robot as directing a stream of input into output. More concretely, there are signals that travel from a place and result in a robot's action—the joystick input on a controller, for instance. These signals travel or change at certan rates, and  that's where rate limiters come in.

A rate limiter is a type of "filter," or something we use to control that mapping of input to output. Filters are used to modify how a signal changes over time. Noise (i.e. frequency noise) reduction and rate limiting are two examples. The purpose of rate limiting is in the name: to reduce or restrict the rate at which a signal can change.

## Slew Rate Limiter

The slew rate limiter is used to curb a signal's maximum rate of change. As mentioned before, this can be applied towards control input, or, in other words, joystick input from driver controllers. Using this rate limiter is a good choice for controlling quantities such as velocity and voltage output.

Implementing the slew rate limiter in code is relatively simple: you can import the `SlewRateLimiter` class from WPILib and instantiate it as such:

```java
SlewRateLimiter filter = new SlewRateLimiter(0.5);
```

Then, you get the output by calling the `calculate()` method by passing in the most recent value of the quantity you want to control (e.g. for velocity, the current velocity of your robot):

```java
filter.calculate(input);
```

## Example

In 2020, we used the slew rate limiter to make our closed-loop driving more smooth and with much less jerking. Check out [this page](https://github.com/FRC1257/2020-Robot/blob/master/src/main/java/frc/robot/commands/drivetrain/ClosedLoopDriveCommand.java) for the full code.

## Sources

* Click [here](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/filters/introduction.html) for more info on filters.

* Click [here](https://first.wpi.edu/FRC/roborio/release/docs/java/edu/wpi/first/wpilibj/SlewRateLimiter.html) for the WPILib `SlewRateLimiter` documentation.