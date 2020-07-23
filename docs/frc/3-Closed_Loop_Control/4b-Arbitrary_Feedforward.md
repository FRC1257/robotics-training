# Arbitrary Feedforward

So far, we've discussed how feedforward can be applied to velocity PID, where the setpoint is multiplied by a certain constant to achieve a specific velocity. The next form of feedforward that we will discuss is arbitrary feedforward, which takes into account our understanding of the system that we are trying to control and accounting for the forces present in it. We will go over two primary examples: elevators and arms. As you will see, the common theme of feedforward in both of these subsystems is to remove the effects of gravity on the subsystem.

## Elevator

The purpose of an elevator subsystem is to move a load vertically. However, one challenge that comes with this when compared to something like a wheel is that there is always gravity on the system pulling it down. This has the effect of making the elevator go down faster than it goes up, since when going up, gravity works against it. When going down, gravity assists it. This can make controlling the elevator manually difficult as it will behave differently when going in different directions. This can also complicate PID tuning since the same motor output would have different effects going up and down. While this could be solved by having different PID gains for going up and down, this is still undesirable and can lead to complications.

Fortunately, we can solve this with arbitrary feedforward, where we apply a feedforward output to counteract the effects of gravity. We can accomplish this by adding a small constant to all of our motor inputs, which will counteract the effects of gravity on our system. We'll go into how we might determine that constant in a moment, but the code would look something like this:

```java
// in Constants.java
double ELEVATOR_FEEDFORWARD = 0.05;

// in Elevator.java
public void update() {
    case MANUAL:
        motor.set(speed + ELEVATOR_FEEDFORWARD);
    break;
    case WPILIB_PID:
        double output = pidController.calculate(encoder.getPosition()) + ELEVATOR_FEEDFORWARD;
        if(output > ELEVATOR_PID_MAX_OUTPUT) output = ELEVATOR_PID_MAX_OUTPUT;
        if(output < -ELEVATOR_PID_MAX_OUTPUT) output = -ELEVATOR_PID_MAX_OUTPUT;

        primaryMotor.set(output);)
    break;
    case SPARK_MAX_PID:
        elevatorPID.setReference(setpoint, ControlType.kPosition,
            0, CANPIDController.ArbFFUnits.kPercentOut, ELEVATOR_FEEDFORWARD);
    break;
}
```

The one part of this that might seem a bit strange is how we do this with the SPARK MAX PID. The SPARK MAX PID actually allows us to pass in an arbitrary feedforward value when calling `setReference()`. The first two parameters are our desired setpoint and the control loop type, which you should be familiar with from our position PID section.

The next section is something new, and that's the PID slot we are using. Essentially, the SPARK MAX allows you to load several different PID gains onto the controller and switch between them quickly using this PID slot. Since we only have one set of gains, we will just use the default PID slot of 0.

Finally, we have the actual sections that pertain to the arbitrary feedforward, which are the units and the actual value. There are two units we could pass, percentage output (which we are doing here) and voltage. We won't concern ourselves with voltage here, but we will cover that again when we go over characterization. Finally, we have the value that we want to pass in, which is just our `ELEVATOR_FEDFORWARD` constant.

## Determining Elevator Feedforward

We can determine our elevator feedforward value by testing it empirically. We first need to raise our elevator to a medium height, and due to the effects of gravity, it should start to slide downwards. Then, we need to apply a very small output to the motor until it stops sliding downwards. Once we find the minimum output where it will stop sliding downwards, we can write down this value. Then, we need to find the maximum output where it will stop sliding downwards, but will not go upwards. Write down this output as well, and then take the average of the two to get a good approximation of what the elevator feedforward value should be. 

For those wondering, the reason why we want to take the average of the two is that the minimum output required would still take into account the static frictional force on the elevator going up, while the maximum output would also take into account the static frictional force going down. To cancel the two out, we can average the two outputs together.

## Arm

The arm is very similar to the elevator, but one caveat is that the arm is a rotating mechanism, not a linear mechanism. For those who have taken physics, I've included an explanation below. If you haven't, feel free to skip this next paragraph.

The motor at the bottom of an arm is applying a torque, or rotational force, to rotate the arm. However, gravity is applying a torque to the systemat the center of mass of the arm. Since the torque applied to a system also depends on the angle the force makes with the system, the amount of torque the gravity applies will depend on what angle the arm is at. As a result, the value of the arbitrary feedforward we apply will vary depending on the angle of the arm. If we consider the angle the arm makes with the ground, the torque applied by gravity will actually be proportional to the cosine of that angle.

Therefore, for an arm, we need to multiply our feedforward constant by the cosine of the angle of the arm with respect to the ground. As a result, we need a method to calculate the angle of the arm. Fortunately, this is rather simple using encoders. The SPARK MAX in particular gives us our encoder values in revolutions, so we simply need to multiply by `360` to determine the angle of the arm. We could do this by setting the scaling on our encoder appropriately. This does assume that the encoder will be giving a reading of `0` when our arm is parallel to the ground. If the arm starts horizontal, we can just zero our encoder position at the beginning of the match, but if it is vertical, we can just set it to 90 degrees at the beginning of the match.

Then, it's as simple as the following, where we can use the builtin Java `Math` library to apply the `cos` function.

```java
// in Constants.java
double ARM_FEEDFORWARD = 0.05;

// in Arm.java
public Arm() {
    // set up motor and PID and create encoder

    // this does assume that there is no reduction via a gearbox or chain between our motor and the actual arm
    // this is extremely unlikely to ever happen on our robot, but it was excluded here for simplicity
    encoder.setPositionConversionFactor(360);
}

public void update() {
    case MANUAL:
        primaryMotor.set(speed + ARM_FEEDFORWARD * Math.cos(encoder.getPosition()));
    break;
    case WPILIB_PID:
        double output = pidController.calculate(encoder.getPosition()) + ARM_FEEDFORWARD * Math.cos(encoder.getPosition());
        if(output > ARM_PID_MAX_OUTPUT) output = ARM_PID_MAX_OUTPUT;
        if(output < -ARM_PID_MAX_OUTPUT) output = -ARM_PID_MAX_OUTPUT;

        primaryMotor.set(output);)
    break;
    case SPARK_MAX_PID:
        armPID.setReference(setpoint, ControlType.kPosition,
            0, CANPIDController.ArbFFUnits.kPercentOut, ARM_FEEDFORWARD * Math.cos(encoder.getPosition()));

        // check our error and update the state if we finish
        if(Math.abs(encoder.getPosition() - setpoint) < ARM_PID_TOLERANCE) {
            state = State.MANUAL;
        }
    break;
}
```

Determining the arm feedforward constant can be done with the same process as the elevator.

Now that we know how arbitrary feedforward works, we can make some of our systems much better in terms of control! We can apply to this to manual control, position PID, and velocity PID to make them all easier to control.
