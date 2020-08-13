# Notifier

## General Description

When a program is running, you could think of it as like a single person running through each line of the code and running the lines sequentially. However, sometimes programs can benefit from instead having two or more people running through the program, each on a separate line of code and executing different segments at the same time. This is known as multi-threading, where each "person" is a thread in our program. To implement this cleanly in WPILib, the `Notifier` class is provided.

## Purpose

In team 1257, a `Notifier` is typically used in `RobotContainer` to run the `update()` functions in our subsystems. The `update()` function is responsible for in all of the subsystems for reading the states and then updating the actuator outputs. There are two reasons we want to do this in a `Notifier` instead of something like `teleopPeriodic()`.

1. WPILib `periodic()` functions might lag and not run at their typical 50 Hz if there is packet loss. To ensure this doesn't happen, we put the code in a separate thread so that the 
2. We can actually make the `Notifier` update faster than the `periodic()` functions. While the `periodic()` functions run at 50 Hz, the `Notifier` can run at any frequency and we set it to 100 Hz to make things like our PID smoother and allow more frequent updates. However, note that other processes on our robot such as polling controller inputs will still happen at 50 Hz; we can't change that.

## Example

### Import

```java
import edu.wpi.first.wpilibj.Notifier;
```

Before using the notifier, its class must be imported in the statement above.

### Declaring and Defining Notifier

```java
private Notifier updateNotifier;

public RobotContainer() {

    updateNotifier = new Notifier(this::update);
    updateNotifier.startPeriodic(1 / 100.0);
}
```

1. First, a private instance object of the `Notifier` class is declared.
2. Then, the object is defined with the constructor. The constructor takes in a function. In order to pass in a function a `::` operator is used. To read more about it, please go ot the the [Elevator Subsystem](Basics/Elevator.md) file, where we discussed it when we learned about how to pass in the controller joystick input. Now, the `Notifier` knows what function it is responsible for calling in parallel with the rest of the robot code.
3. After the notifier is defined, the `startPeriodic()` function is called. A double is passed in as a parameter which is the period between the times the notifier is executed. In the above example, the notifier is run every hundredth of a second or at 100 Hz.

## Summary

Now you know how to use the notifier. If you want to know more about its functionality, feel free to check out the [Documentation](https://first.wpi.edu/FRC/roborio/beta/docs/java/edu/wpi/first/wpilibj/Notifier.html) or ask a senior programming member.
