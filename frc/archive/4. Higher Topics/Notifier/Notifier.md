### Notifier

WPILib as a system realizes that some tasks will need to be asynchronous, being run non-sequentially.  Some common examples are sensor updates, like a gyro or an encoder, or a camera for computer vision.  These may need to be run asynchronously, but it also enables them to be run in a seperate thread.  The WPILib Notifier is the feature that enables such behavior.

### Use

To use the WPILib notifier in Java, we need to import the object for use as follows:

```java
import edu.wpi.first.wpilibj.Notifier;
```

This allows us to actually define it rather simply, as follows:

```java
Notifier notif = new Notifier(() -> {
// our code goes here
});
```

To break this down, let's start at the beginning.  `Notifier notif = new Notifier(` is standard Java syntax to instantiate an object, but following it is `->`, the arrow indicator.  This signifies in Java the lambda expression, to define a function with no name to be run / fed into the Notifier.  As such, anything in the brackets immediately following the lambda operator will be run with the notifier's execution.  It can be another function, or it can be standalone code.

As such, an example usecase might be the following:

```java
import edu.wpi.first.wpilibj.Notifier;

public class ColorSensor {
	Notifier notif = new Notifier(this::periodic);
	String currentColor = "";

	public ColorSensor(int port) {
		notif.startPeriodic(0.05); //Runs every .05 seconds, or 1/.05s
	}

	public void periodic() {
	getColorSensorValue(); //This doesn't exist but it'll be executed every time the Notifier executes.
	}

}
```
