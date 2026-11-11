# Lambdas

**Prerequisites:** methods, interfaces, and objects. **Time:** 20 minutes. A lambda supplies behavior to a functional interface (an interface with one abstract method). It can capture a local variable only when that variable is final or effectively final.

```java
import java.util.function.DoubleSupplier;

public class LambdaDemo {
    public static void main(String[] args) {
        double scale = 0.5;
        DoubleSupplier readSpeed = () -> 0.8 * scale;
        System.out.println(readSpeed.getAsDouble()); // 0.4
    }
}
```

Save as `LambdaDemo.java`, then run `javac LambdaDemo.java` and `java LambdaDemo`. A supplier is evaluated when called, not when created. In command-based robot code, `() -> joystick.getY()` supplies the *current* value whenever the command asks; `joystick.getY()` reads once. WPILib's command factories accept callbacks such as `() -> intake.setSpeed(0.5)`; the subsystem must still be declared as a requirement when a factory accepts requirements.

**Try it:** change `scale` to `0.25` and predict output `0.2`. Then try assigning to `scale` after defining the lambda: compilation fails because the captured local is no longer effectively final. Avoid blocking loops in callbacks: the scheduler must continue running.

Sources: [Oracle lambda expressions](https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html), [WPILib command factories](https://docs.wpilib.org/en/stable/docs/software/commandbased/commands.html).
