# Basics of PID

> [!WARNING]
> Some calculus is mentioned in this documentation, but don't worry if you haven't taken calculus. We will explain everything you need to know

PID control, or **P**roportional-**I**ntegral-**D**erivative control, is a method of controlling a system to achieve a desired state. Here, we will only be going over how PID applies to position, but we will go over how we can control velocity later.

## Positional PID

One of the most common applications of PID is to try to get a certain mechanism into a certain exact position with a reasonable amount of error. For instance, we might want to make our elevator rise to an exact height of 60 inches off the ground. To do this with PID, we first need a sensor to measure the quantity we want to control. In this case, we would have to somehow measure the height of our elevator. We could do this with a distance sensor at the bottom, or we could use an encoder attached to the elevator motor alongside some math to see what the position of elevator is.

After this, we measure something known as **error**, which is defined as `error = setpoint - current`. For instance, if the current height of our elevator is 40 inches off the ground, the error would be `error = 60 - 40 = 20`. You can think of one of the purposes of PID control as driving the error towards 0.

The main idea of PID control is how we turn that error term into a motor output that we can use to drive that error to 0. There are three components of PID control, each of which can be used independently of one another, and which produce the best results when used all together.

> [!NOTE]
> Here, we are assuming that a positive motor output will increase our sensor reading. So when we apply a positive motor output, the elevator will rise up. This is important to note and if it this is not the case, we have to invert our motor controller.

> [!TIP]
> When writing constants, we will frequently use kP to represent the P constant for PID. This is a notation known as Hungarian notation and involves simply putting the letter "k" before the constant name. This is pretty common, so we use it as well.

## P term

When we are just using the **P**roportional term of our PID controller, we apply a motor output that is **proportional** to our error. The way this work is that we essentially apply an output that is equal to `-error * kP` where `kP` is the P constant for our PID controller. For instance, we might have something like the following:

```java
// set these up once
double kP = 0.01;

// loop this
double error = setpoint - encoder.getPosition();
motor.set(kP * error)
```

The idea behind this is that if we are far away from our desired state, we want to apply a larger motor output to get us there faster. However as we close in on the desired setpoint and our error decreases, we want to decrease out output so we can accurately hone in on that desired value.

### Effects of P

One important concept to understand is how different `kP` values will affect the response of the system. We can summarize this in the table below:

| kP | Oscillations | Speed |
| :-: | :-: | :-: |
| ↑↑ (increase) | ↑↑ (increase) | ↑↑ (increase) |
| ↓↓ (decrease) | ↓↓ (decrease) | ↓↓ (decrease) |

If we graph our sensor value compared to the setpoint over time, we can create some really informative graphs (image from [MATLAB and Simulink Control Tutorials](http://ctms.engin.umich.edu/CTMS/index.php?example=MotorPosition&section=ControlPID))

![PID Graphs for differing kP](img/graphs_p.png)

## D term

We're going to skip the I term for now and cover the **D**erivative term.

> [!TIP]
> You can think of a derivative as the "speed of the error" or, more formally, the rate of change of the error. Essentially, we're looking at how fast the error is decreasing.

The purpose of the derivative term is to slow down the motor output of our controller so that it does not approach the setpoint too fast. This helps prevent the oscillations that were present in the `kP` graphs shown above. The way it works is that we take the derivative of the error term (or we approximate it), we multiply it by a constant, and then we subtract it from what we obtain from the P term.

```java
// set these up once
double kD = 0.01;
double prevError = 0.0;

// loop this
double error = setpoint - encoder.getPosition();
double dError = (error - prevError) / (currentTime - prevTime);

prevTime = currentTime;
prevError = error;
motor.set(kP * error - kD * dError);
```

The idea behind this is that if we are going too fast and we might overshoot, our derivative will become higher and then we will more off, which will decrease our motor output. Note that this may even turn out motor output negative in an effort to slow down our mechanism more dramatically.

### Effects of kD

One important concept to understand is how different `kD` values will affect the response of the system. We can summarize this in the table below:

| kD | Oscillations | Speed | Overshoot |
| :-: | :-: | :-: | :-: |
| ↑↑ (increase) | ↓↓ (decrease) | ↓↓ (decrease) | ↓↓ (decrease) |
| ↓↓ (decrease) | ↑↑ (increase) | ↑↑ (increase) | ↑↑ (increase) |

One important thing to notice is that while increasing `kP` increases the speed of our system, it overall decreases the stability. On the other hand, increasing `kD` decreases the speed of our system, but decreases stability. Finding the perfect balance between the two requires a good amount of experience and judging of what our subsystem needs.

## I term

> [!TIP]
> You can think of integral as the "sum of the error," or the error accumulated over time.

The purpose of the **I**ntegral term is to get rid of steady state error, or when the value trying to be controlled settles on a value not equal to the setpoint. For example, sometimes the thing we are trying to control doesn't quite reach where we want it to be or might even overshoot, and then just stops moving due to friction opposing the actuator effort. However, the way the integral term works is that this error will be accumulated over time with the integral term, eventually overcoming the frictional force and allowing the actuator to go to the desired setpoint. The way it works is that we accumulate the error over time and then add it to our motor output.

> [!WARNING]
> There are **many** things that can go wrong with using an I term. The integral term can oversaturate and also the I term adds a lot of non-linear complexity to tuning PID. In FRC, it is very rare that we will even need the I term for our systems, so we will most of the time not include it.

```java
// set these up once
double kI = 0.01;
double prevError = 0.0;
double errorSum = 0.0;

// loop this
double error = setpoint - encoder.getPosition();
errorSum += (error - prevError) * (currentTime - prevTime);

prevTime = currentTime;
prevError = error;
motor.set(kP * error - kD * dError + kI * errorSum);
```

### Effects of kI

One important concept to understand is how different `kI` values will affect the response of the system. We can summarize this in the table below:

| kI | Stability | Steady State Error |
| :-: | :-: | :-: |
| ↑↑ (increase) | ↓↓ (decrease) | ↓↓ (decrease) |
| ↓↓ (decrease) | ↑↑ (increase) | ↑↑ (increase) |

One important thing to notice is that increasing `kI` decreases the steady state error, it increases the speed and instability of the actuator. This happens because even while the actuator is in its normal movement, the integral term is still accumulating and actutator output.

## Types of Controllers

Note that we have discussed 3 different aspects of PID, but sometimes we don't want to use all three. For instance, the I term is frequently unwieldy for FRC situations and we simply don't need it to effectively control our subsystems. As a result, we frequently just use PD controllers without the I component. There are various other controllers such as just P and the full-fledged PID, but PD is probably the most common for us.

When we are writing simple P controllers, they are generally so simple that we can write them ourselves. However when we bring in other terms, it becomes much easier to just use either motor controller builtin PID or WPILib's `PIDController`.

## Example

The following video shows a really good hardware demo of the effect of different PID controllers. Some of the stuff isn't 100% applicable such as the refresh rate, but the overall content is still super good.

<iframe width="560" height="315" src="https://www.youtube.com/embed/fusr9eTceEo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Tuning PID

One of the most critical parts about a PID controller is learning how to tune it depending on what kind of response you get. For our team, we use almost solely PD controllers, so we will go over our general procedure below:

1. Start with a very low `kP` value and gradually increase it until the actuator at least gets to the desired position. Make sure you increase it **gradually** to reduce the risk of growing an out of control system and doing damage. It is much better to have a slow, dissapointing system than a crazy frantic system that could injure someone.
2. Increase `kP` more until the system continually oscillates around the setpoint, and it settles at the setpoint. It is **ok** if it has some violent oscillations as long as they are **consistent** and are about the desired setpoint.
3. Increase the `kD` term until the oscillations slow down and eventually stop.
4. Marginally adjust `kP` and `kD` to either add speed or damping respectively.
