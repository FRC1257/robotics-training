# Joystick Features

(Note: this post is mainly based off a paper from [this](https://www.chiefdelphi.com/t/joystick-scaling-deadband/355153) forum post.)

Once again, 1257 generally uses Xbox controllers to interact with a robot. One is pictured below.

![Amazon Basics Controller](img/AmazonBasicsController.jpg ':size=350x300')

The two joysticks on such a controller are almost always in use, whether it be for moving a drivetrain, an arm, or some other mechanism easily controlled with joystick input. However, the joysticks could have mechanical defect, and therefore may return erroneous input.

To counteract this physical issue, or to just increase precision, we can implement a few adjustments in code.

## Scaled Input

To control, say, a drivetrain, we would map a joystick's movement on the controller axis to corresponding motors. Take a look at this graph of **linear** joystick input:

![Linear Input Graph](img/LinearInputDesmos.jpg ':size=400x400')

Here, the x-axis represents joystick position (where it is being read on the controller axis), and the y-axis is the motor output. In the context of a drivetrain motor, this input above would send unadjusted joystick input to the motor. Think of it this way: if a joystick was at the 0.5 position, the output would subsequently be `motor.set(0.5)`.

Controlling a drivetrain well requires a certain level of precision, especially when lining up to a position or performing slight turns. Once again, we generally try to increase precision through manipulating controller input.

In order to make control more precise, especially at the smaller levels of input (0.0-0.4), we can raise joystick input to a certain power (moving from a linear to higher-order function). Lower inputs are achieved for the same joystick movement:

![Scaled Input Graph](img/ScaledInputsDesmos.jpg ':size=400x400')

The blue curve represents **"squared input"** (x<sup>2</sup>), and the green curve represents **"cubed input"** (x<sup>3</sup>). We usually settle with just squared input, as cubing is generally a bit too drastic, but at the end of day, it all depends on the mechanism.

Implementing this in code is pretty simple. When transforming joystick input into mechanism output, we could just use:

```java
Math.pow(input, 2);
```

*However*, for squared inputs, we need to also reconsider the fact that we can have negative joystick input (i.e. reversed direction). As a solution, we can get the sign of the original input using the `signum()` function and add it to the above:

```java
Math.signum(input) * Math.pow(input, 2);
```

This way, the sign is retained for negative input.

More on the Java `signum()` function [here](https://www.tutorialspoint.com/java/lang/math_signum_float.htm).

## Deadbanding

We'll now move into another topic: deadbanding. This is a process that helps us adjust for any defect in the joysticks themselves that affects controller input.

A situation where the joystick is inexact would be when it defaults to an input value *slightly* higher or lower than 0, i.e. when no one touches the joystick but it still sends input. While that miniscule input probably won't move a large mechanism, it can definitely be problematic at times. Thus, implementing deadbanding is a good practice

The general idea is to create what's called a "deadband," or essentially a neutral zone in which we dictate the input to be 0. This helps us avoid that slight "default" input described above.

Here's a *basic* deadband input graph:

![Basic Deadband](img/BasicDeadband.jpg ':size=450x400')

In this case, the deadband lies between -0.4 and 0.4. If the joystick defaults to any value between that range, the input is commanded to be 0.

The way to implement this in code isn't too difficult. If we let get and store joystick input in a variable `input`, we can implement the following concept in appropriate places:

```java
if (abs(input) < deadband) {
    output = 0;
}
```

### Scaled Deadbanding

If you take a look at the basic deadband graph, you'll probably notice how the input jumps drastically up to the corresponding, unadjusted value. While this isn't necessarily *bad*, a substantial amount of precision is lost due to the deadband and that value jump. This can be problematic for sensitive mechanisms like arms and elevators that require very precise movement at times.  

The way to avoid this jump is to *scale* our input outside of the deadband. This would be considered a "better" input system:

![Scaled Deadband](img/ScaledDeadband.jpg ':size=450x400')

Here, the jump from before is completely eliminated, as the input outside of the deadband is scaled down.

Implementing this in code isn't too difficult either, just with some extra math:

```java
if (abs(input) < deadband) {
    output = 0;
}
else {
    output = (1 / (1 - deadband)) * (input + (-Math.signum(input) * deadband));
}
```

More on the Java `signum()` function [here](https://www.tutorialspoint.com/java/lang/math_signum_float.htm).

A mathematical explanation from the [source](https://www.chiefdelphi.com/t/joystick-scaling-deadband/355153) cited above:

> Essentially, it is based off of the point-slope form Y = M(X - X0) + Y0. However, Y0 is not used because we want the value to start at 0. X0 is the deadband adjusted to be positive or negativedepending on whether the joystick is in the positive or negative direction. The slope was based off of the slope formula, where slope = ( Y2 - Y1 ) / ( X2 – X1 ). Y2 is equal to 1 for achieving 100%on the output of the function and X2 is 1 for an input of 100%. Y1 is 0 because X1 is equal to thedeadband, because at the deadband we want the function output to be 0% and at 100% wewant the function output to be 100%.

Scaled deadbanding should generally be used over basic deadbanding for the reasons described above: better precision and overall improved control.
