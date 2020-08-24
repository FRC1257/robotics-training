# Servos

## Overview

**Servomotors**, or servos for short, are useful machines **that provide low-power, repeatable motion.** It functions similarly to a motor, as it drives an axle to induce angular motion. However, the main differences between the two are that a servo is *extremely* low-power compared to a motor, and is also coupled to a sensor with motor position feedback, or in other words, is capable of precise angular and linear position control. Because a servo's power is so weak, though, it is not effective in every situation, and that is why we don't see servos used extensively on our robots.

### Examples

![Hitec HS-322HD Servo](img/hitecservo.jpg ':size=250x250') ![REV Smart Servo & Programmer](img/revsmartservo.png ':size=290x250')

In the left photo is the Hitec HS-322HD Servo, which was provided in the FIRST Kit of Parts in 2008. On 1257, though, we generally use the [REV Smart Servo](https://www.revrobotics.com/rev-41-1097/), pictured in the right. The large square device is called the "Servo Programmer." We can work with the electronics' members and use the programmer to customize the servo's range of motion. 

A special feature that the REV Smart Servo offers is the ability to switch parameter modes, hence the "Smart" in the name. The servo is in position mode by default, and we would command the servo by passing in values ranging from 0.0 to 1.0, with 0.0 and 1.0 corresponding to fully leftward and fully rightward respectively. But, the servo also offers what is called "continuous rotation" mode, where it can function as a motor by spinning continuously either clockwise or counterclockwise.

Find the official REV Smart Servo documentation [here](https://docs.revrobotics.com/15mm/actuators/servos/smart-robot-servo).

## Usage Cases

![Servo Intake Up](img/intakeup.jpg ':size=350x560') ![Servo Intake Down](img/intakedown.jpg ':size=325x560')

For 1257's 2020 robot, we used a polycarbonate clip attached to a servo to hold up the roller intake and keep it in the robot's frame perimeter brefore the match started, as labeled in the left photo. We planned to drive the servo clip up at the beginning of autonomous so that the intake would be left down for the rest of the match, like it is in the right photo. This is just one example of the many applications a servo has to offer. 

You might be thinking that it would've been easier to add a motor to the intake and adjust it mechanically so that it would be rotatable/jointed (allowing us to simply lower the intake manually at the beginning of a match), but we already had numerous motors on the robot. Adding that extra motor would have really strained the current draw on the battery and possibly could have introduced other issues. 

Also, the servo's built-in closed-loop functionality made it trivially easy to program to go to the open and closed positions, and also ensured that the hook for the intake would stay in the desired positions and not slam into other parts of the robot, which is a possibility with a continuous motor. Thus, a servo was the most suitable solution for keeping the intake within frame perimeter. 

## Programming

Fortunately, adding a servo to a robot program is made easy with WPILib's `Servo` class. The implementation and control is similar to that of a motor. 

First, we declare and instantiate our servo using an ID constant:

```java
Servo servo;

servo = new Servo(SERVO_ID);
```

We can then use the `set()` method to actually control the servo: 

```java 
servo.set(1.0) // pass in double to move to full right
servo.set(0.0) // move back to full left
```

When using the continuous rotation mode on the REV Smart Servo, we actually use the same `set()` function, but we can also pass in negative numbers to go backwards. We don't actually set up the continuous rotation mode in code, we have to do this physically with the servo itself.
