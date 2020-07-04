# Feedforward

So far, we've been using `feedback` control, where our system looks at the current error and after seeing how behind the system is, it will apply outputs to correct that error. However this system is very reactionary and doesn't incorporate what the system already knows about its surroundings. For instance, if you're trying to make a system go to a specific velocity with your controller, you can use `motor.set(value)`, which can actually get you very close to the desired speed value after some empirical testing. Additionally, if we have an elevator subsystem, we know that gravity will apply a force downwards on our system, and this is information we can incorporate into model by applying a counteracting upwards force to improve our system. This idea of incorporating knowledge into controlling our system without sensors is known as `feedforward` control.

There are two primary types of feedforward, which were actually discussed in the previous two examples. The first uses information about the intended result, or desired output of the system. For instance, if we want to reach a target velocity, we could potentially scale that from the maximum velocity of our system, and then apply that as a percentage output to the system, which would be feedforward control.

As a basic code example, we could do the following, where we scale `desiredSpeed` to be between `0` and `1`, and then pass it to our motor.

```java
double maxSpeed = 5000; // in rpm
double desiredSpeed = 4000; // in rpm
double kFF = 1 / maxSpeed;

motor.set(desiredSpeed * kFF);
```

The other type of feedforward control takes into accounts the dynamics, or movement, of the system. We could calculate this mathematically thrugh physics, or empirically through testing, but we could do something such as counteract the effects of gravity on a system. For instance, gravity will always pull an elevator down, but we could use feedforward to counteract this by putting a constant force going up. This would prevent the elevator from naturally falling down, as well as going faster downwards than upwards.

As a basic code example, we could do the following, where we apply a constant motor output upwards to counteract gravity.

```java
double feedforward = 0.1; // counteract gravity
double input = controller.getLeftY();

motor.set(input + feedForward);
```

## Combining with Feedback Control

However, feedforward control is rarely enough to completely make a system responsive. In fact, it works best when feedforward control is used in conjunction with feedback control. For instance, if we wanted to control the velocity of our system, we could use feedforward control as the main driving force to get our system to the desired speed, and then use feedback control to correct any errors or fluctuations in that speed.

Additionally, we could use feedback control to run PID on something like an elevator subsystem that will drive our position to a desired setpoint. To counteract the effects of gravity on the system, we use feedforward to make our motor apply an upward force. This would actually help linearize the model of our system (don't worry if you don't know what this means, it just means that it will make it simpler and nicer to control), as well as remove the need for separate PID gains going up and down.

## Different Kinds of Feedforward

When looking at online documentation, there are a lot of different terms for feedforward. Generally however, feedforward refers to any type of control that is done without looking at sensor values. However when you see something like a `kFF` term, or feedforward term, similar to something like a `kP` term in PID control, this refers to the first type of feedforward mentioned where the motor output is based on the desired output. When this term is used, it multiplies the desired output by the constant `kFF` term and adds it to the motor output along with other terms such as the `kP` and `kD` terms. You would generally **never** use this for something like positional PID, and would only use it for velocity PID.

The second type of feedforward that we mentioned, which is based off of the dynamics of the system and is used to counteract forces on it, is known generally as `arbitrary feedforward`. When you see something like this, this value is just added directly to the motor output and has no relationship with the desired setpoint.

To summarize:

* feedforward (`kFF`) adds the term `setpoint * kFF` to the output
* arbitrary feedforward adds the term `arbFF` to the output

## Sources

If you want more information, I would strongly recommend reading / watching the sources below, which were used to help write this article.

* https://docs.wpilib.org/en/stable/docs/software/advanced-control/controllers/feedforward.html
* https://blog.wesleyac.com/posts/intro-to-control-part-five-feedforward-motion-profiling
