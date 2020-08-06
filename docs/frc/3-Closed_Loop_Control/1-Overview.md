# Overview of Closed Loop Control

Up until now, we have been using pretty much entirely `open loop control`, which is when the value that we sent to our actuators is determined solely by the input from something like a controller and does not use sensor feedback. For what we've dealt with so far, where we wanted the user to be able to control the mechanism's speed via a joystick or a button press, this has worked fine. However, if we wanted to do something such as move our mechanism to a setpoint, this becomes more difficult. For instance, in the 2019 game, we had 2 different setpoints for our arm that we used for scoring the cargo balls: one for the cargo ship goal height and one for the lowest rocket goal height.

One might try to solve this problem of precise control by using timing. For instance, if we wanted to drive forward 10 feet, we could just time how long our robot takes to go 10 feet when we apply 70% power forward and then use that timing to allow our drivetrain to go at that speed.

However, this solution generally does not work for a variety of different reasons. First of all, there are unpredictable factors that can cause the exact velocity of our wheels to not be exactly the same even if we apply the same power. Chain slipping, friction, foreign obstructions, slop, etc. can all affect the system. Additionally, any obstacles or disturbances in the system can affect it. Most importantly, if we have no sensors on our system, we have no way of knowing our starting position, which makes it difficult to go to absolute positions.

## Closed Loop Control

In closed loop control, we add sensor feedback to make our control over our system MUCH better. We have a variety of different techniques that can use these sensors to get our desired behavior from the system, as long as our sensors are actually measuring that behavior. For instance, we can use sensors and closed loop control to bring our mechanism to a certain position, or to make our mechanism move at a specified velocity.

## Common Types of Closed Loop Control

### Bang Bang Control

Bang bang control is the simplest type of closed loop controller. We simply check if our sensor reading is less than the desired value, and if it is, then we apply a motor output that will bring us towards the desired value. If the sensor reading is greater than the desired value, then we apply the reverse output. This is generally unstable and not recommended since the mechanism can bounce aggressively between the two sides of the setpoint.

### PID Control on Position/Velocity

We will go over this in the next few tutorials. We use these most often.

## Vocabulary

- *Setpoint / Reference*: the desired state of our mechanism
- *Error*: Setpoint - Actual, or how far off you are from your setpoint
- *Steady-State Error*: the error of the system after it has reached equilibrium (stopped moving)
- *Response*: behavior of a system after enabling closed loop control
- *Settling Time*: the time it takes for a system to settle to equilibrium
- *Controller*: the model or equations that control how data is interpreted and converted into outputs for actuators

I've tried to put the most important ones above but here are some more: [Controls Glossary](https://docs.wpilib.org/en/latest/docs/software/advanced-controls/introduction/controls-glossary.html)
