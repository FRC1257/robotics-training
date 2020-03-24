# Zeroing Sensors

When we have sensors on our system, they will frequently drift due to various reasons, which can make going to absolute positions gradually worse and worse as we continue to use our mechanisms. As a result, we frequently have a limit switch at the end of our mechanism that allows us to "zero" our sensor reading. For instance, if we had an encoder on our arm that was measuring the angle that it was at, we might include a limit switch at the bottom that will zero the encoder's position when it hits the bottom. This not only allows us to zero the reading as the match progresses (since we will inevitably put our arm down), but it also gives us a way to recalibrate our arm if we know there are issues.

## When to Zero the Switch

When we try to apply the above, we sometimes run into issues where after the button is first pressed, the mechanism might still have some leeway and continue to press the button as it goes deeper. Then, once it goes back up, it will take some time for the button to stop being pressed and rise up, which means that while the system is rising, the sensor value is staying at zero (because we are constantly zeroing it). This can have **extremely** unpredictable behavior, especially when we throw in PID controllers with their integral and derivative terms (more on that in the next few guides).

As a result, we change when we zero the sensor. We use a system where we will only trigger the zeroing on something called the "rising edge" or "falling edge" of the switch's signal. A rising edge is when the signal first goes from false to true, and the falling edge is when it first goes from true to false (you can think of true as climbing up a mountain and false as the normal ground as sort of an analogy). This allows us to avoid the constant zeroing problem since our sensor will not only be zeroed at two points instead of continuously.

Most of the time we should use the edge that corresponds to when the mechanism first comes in contact with the switch. This is because then as the mechanism is rising up, it will not trigger a zero in the middle of its movement.

To perform this in code, we need to just store the last switch that we read in and then compare it with the current one to see if we should zero the sensor.

### Old Code

```java
public class Arm extends SnailSubsystem {
    ...

    DigitalInput limitSwitch;

    ...

    public void update() {
        if(limitSwitch.get()) encoder.setPosition(0);
    }
}
```

### New Code

```java
public class Arm extends SnailSubsystem {
    ...

    DigitalInput limitSwitch;

    boolean lastLimitSwitch;

    ...

    public void update() {
        if(!lastLimitSwitch && limitSwitch.get()) encoder.setPosition(0); // rising edge

        lastLimitSwitch = limitSwitch.get();
    }
}
```
