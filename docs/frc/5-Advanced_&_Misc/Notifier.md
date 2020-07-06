# Notifier

## What's the Point of a Notifier

When coding, it is sometimes necessary to run code asynchronously(not at the same time). For example, we may want to update some functions more often or less often than others. For this, WPILib has a tool called a notifier. 

## Where is it Used?

In team 1257, a notifier is typically used in `RobotContainer` to run the `update()` function. The update function is responsible for running all the update functions in the subsystems which are responsible for updating the states. The reason the notifier is used for the function is to get rid of the irregular run intervals that happen by default due to packet loss. With the notifier, the function always runs with the same time interval.

## Using A Notifier Example

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
    updateNotifier.startPeriodic(1/100.0);
}
```

1. First, a private instance object of the Notifier class is declared. 
2. Then, the object is defined with the constructor. The constructor takes in a function. In order to pass in a function a `::` operator is used. To read more about it, please go ot the the [Elevator Subsystem](Basics/Elevator.md) file. Now whenever the notifier is executed that function would also get run.
3. After the notifier is defined, the `startPeriodic()` function is called. A double is passed in as a parameter which is meant to be the period between the times the notifier is executed. In the above example the notifier is run every hundreth of a second or at 100 hz.

## Summary

Now you know how to use the notifier. If you want to know more about its functionality, feel free to check out the [Documentation](https://first.wpi.edu/FRC/roborio/beta/docs/java/edu/wpi/first/wpilibj/Notifier.html) or ask a senior programming member.








