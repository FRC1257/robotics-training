# Sensors

Sensors are essential for the robot in order to drive and perform tasks within the game. 

**Gyroscope**

The gyroscope is used to determine the angle that the robot is oriented at. For example, if we make the direction where we place the robot at the beginning of the game 0 degrees, the gyroscope would read the angles at which it turns. We could turn right at a 90 degree angle, and the gyroscope would sense the change in orientation. 

It also measures angular rotational velocity, and returns a value expressed in `mV/degree/second.` Additionally, the gyropscope is used to make sure that the robot stays on course, using the angle returned and multiplying by a constant.

**Accelerometer**

An accelerometer measures the robot's velocity (generally not used).

**Ultrasonic Distance Sensor**

This is an important sensor used by the robot. It emits soundwaves that travel forward in a straight line, and then measures how long it takes for the waves to bounce back and be received by the sensor. Using that time value, it calculates how far it is from an object. 

//add picture

A way that we could implement this sensor is for driving, and prevent things such as crashing into walls. For a more hands-on example, the ultrasonic sensor could have been used on the 2018 robot, in terms of regulating the elevator. As we all should know, an elevator moves up and down; in order to prevent it from descending too far and damaging the robots inner body, we could attach an ultrasonic sensor at the bottom of the elevator track and have it periodically return the distance from the bottom to the elevator body. As that distance decreases, the speed of the elevator's descent could be limited/decreased, stopping it from crashing. 

**Encoders**

Arguably the most important sensor, the motor encoder provides information about position, velocity, and direction. Visualize them as a disk and optical laser used together; however many times the beam passes through the holes as the disc (really the wheel) spins is read by the encoder. 

Encoders may produce either incremental or absolute signals. Incremental signals provide a series of "high" and "low" waves, which indicate movement and change in position. On the other hand, absolute encoders use unique "codes" for each rotary position. What this really means is that both positional change and the absolute position of the encoder is indicated. 

Going back to the elevator regulation example from above, we could actually use motor encoders instead of the ultrasonic sensors.
What we could do is take the encoder value returned (what position the elevator is at) and limit the elevator position from reaching certain values. This process is more efficient than that of the ultrasonic sensor, because other objects or forces could make the ultrasonic sensor's values inaccurate. 

Additionally, motor encoders can be used for driving, specifically in the auto period. As programmers, we could use the encoders and pass in a certain value (which would be translated as a distance) for the robot to drive. This would be much more accurate and efficient than setting the robot to drive for a certain amount of time (external forces such as friction could throw it off).
