# Runnable Java exercises

Requires JDK 17 or newer. From the repository root run:

```sh
mkdir -p /tmp/robotics-training-classes
javac -d /tmp/robotics-training-classes examples/PidDemo.java
java -cp /tmp/robotics-training-classes PidDemo
```

Expected: `integral = 0.6 m*s; derivative contribution = -0.2; checks passed`. This demonstrates arithmetic only; it is not a robot-ready control loop. Robot APIs require the separately installed version-matched WPILib and project vendordeps.
