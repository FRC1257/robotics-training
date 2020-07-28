# Motion Profiling

## Limits of PID

While PID is definitely really powerful, it definitely lacks some traits and leaves much to be desired when thinking about the ideal control method. First of all, PID is very prone to overshooting. While this could be solved with an increase to the `kD` term, too much increasing will lead to a slow response. It is difficult to find the precise parameters that will give us both a smooth response that doesn't overshoot and moves quickly.

Additionally, PID accelerates very quickly at the beginning as the initial error is very large. This can lead to system instability that could damage our system or make it lose its grip on game pieces. Again, increasing the `kD` term can help us balance this out, but this also leads to a slower convergence to the final goal. Finding the perfect combination of PID parameters can be extremely difficult and maybe even nonexistent. 

The final problem is that PID is dependent on our robot's battery voltage. If our battery is not fully charged due to bad batteries or an accident, then the PID outputs will not be as strong and could mess up our tuning. Fortunately, we have another option: **motion profiling**.

## Motion Profiling

Motion profiling is essentially a method of using the physical constraints of your system (maximum velocity and maximum acceleration) and generating a profile, or plan, of the exact movement of the system to accomplish a certain task. For instance, if we wanted to go forward 10 feet and we knew our maximum velocity and acceleration, we could generate an exact profile that tells us where we should be and what speed we should be at for every time step in our path. For example, we could have a profile like this, which tells us the exact velocity we need to be moving at each time step to accomplish a smooth motion. (Credit to [Linear Motion Tips](https://www.linearmotiontips.com/how-to-calculate-velocity/))

![Trapezoid Velocity Motion Profile](./img/trapezoidal-profile.jpg)

Once we generate this motion profile, which in this case is a **trapezoidal motion profile**, we can follow it exactly and guarantee that we will reach our target goal. For each target distance we want to move, we will have to generate a new motion profile that will get us there. However, we need to somehow be able to follow this velocity graph over time to follow this motion profile. Fortunately, we just did a whole section on this, so we are well equipped to tackle motion profiling! Now, we just need to figure out how to generate the motion profile.

Some advantages of this motion profile are that a) we can make the system obey a certain maximum velocity and acceleration, which will be parameters we pass in once we generate the motion profile, and b) we can know exactly how long the movement will take. Due to condition (a), we can also increase the stability of our mechanism easily by just adjusting the parameters such as the max velocity and acceleration.

### Generating Trapezoidal Profile

There are various types of motion profiles, but the most basic one that we will be using is a trapezoidal motion profile. The trapezoidal motion profile consists of 3 parts, accelerating up to our maximum velocity at our designated maximum accceleration, then cruising at the maximum velocity, and finally deccelerating from our maximum velocity back to 0 at the negative of our designated maximum acceleration. If you look at the diagram above, these are represented by the $t_a$, $t_c$, and $t_d$ present on the x-axis.

Sometimes, the distance we need to go is so short that we don't have time to go to a cruising velocity. We can instead use a triangular motion profile instead, which is just where $t_c = 0$, or we spend no time cruising. Instead, halfway through our motion, we go straight from accelerating to deccelerating.

We don't actually have to worry about generating these profiles alone, since WPILib provides the `TrapezoidProfile` class to handle all of these calculations for us. However, I'm going to take a dive into deriving these physics below. Feel free to skip it if you're not interested.

### Physics of Generating Trapezoidal Profiles

We are given the following constants when trying to generate a trapezoidal motion profile, acceleration $a$, max velocity $v_{max}$, and distance $d$. To create the motion profile, we have to use the kinematic equations, which are listed below.

$$v = v_0 + at$$
$$\Delta x = \left(\frac{v + v_0}{2}\right)t$$
$$\Delta x = v_0 t + \frac{1}{2}at^2$$
$$v^2 = v_0^2 + 2a \Delta x$$

First of all, we have to determine if we are going to be using a triangular profile or a trapezoidal profile. This means that we need to determine whether or not we will even be able to accelerate to the maximum velocity and then deccelerate to a stop before going the distance $d$. To do so, we can use the kinematic equations to determine the distance required to accelerate to the velocity $v_{max}$ from the initial velocity $v_0 = 0$.

$$v_{max}^2 = 0^2 + 2ax \rightarrow x = \frac{v_{max}^2}{2a}$$

Now we have two cases: either $x \leq \frac{d}{2}$ or $x > \frac{d}{2}$. For the first case, this means that when accelerating to the max speed and then deccelerating, we will actually go **farther** than our desired distance, which is bad. This means that we should **not** go all of the way to our max speed, but instead go to some intermediate speed. This is known as a triangular profile, and can be done by determining the length of time we need to spend accelerating to go halfway to our destination. Then, the same time will be spent deccelerating.

$$\frac{d}{2} = 0 * t + \frac{1}{2}at_a^2 \rightarrow t_a = t_d = \sqrt{d / a}$$

Now, we know how long this triangular profile will last during each segment, and we just need to know what the desired velocity is during each time $t$. For the first half of our motion when $0 \leq t \leq t_a$, we have that $$v = at$$

For the second half of our motion when $t_a \lt t \leq t_a + t_d$, we have that $$v = at_a - a(t - t_a) = 2at_a - at$$.

This concludes the triangular profile, and now we can go onto the trapezoidal profile. For the trapezoidal profile, we know that we can safely accelerate to our maximum velocity, cruise at that velocity for some time, and then deccelerate. To calculate how long it will take to accelerate and deccelerate, we can use the kinematic equations again.

$$v_max = 0 + at_a \rightarrow t_a = t_d = \frac{v_max}{a}$$

We also need to calculate the distance that we travelled during this time, which can be done with the following equation:

$$v_max^2 = 0^2 + 2ax \rightarrow x = \frac{v_max^2}{2a}$$

We then know that we will need to cruise at our max velocity for the remainder of the distance, which means that we will need to cruise for the time

$$t_c = \frac{d - 2x}{2}$$

Now, we have all of the time intervals for which we have to do each action. I'm not going to exactly into how to calculate the velocity during each time interval since it's pretty self-explanatory and similar to the triangular motion profile section. With that, we're done with generating our trapezoidal motion profile! Now we just need to implement it in code, for which we have two options: the WPILib builtin version and the SPARK MAX Smart Motion.

## Using WPILib TrapezoidProfile



## Using SPARK MAX Smart Motion



## Determining Velocity / Acceleration

There are several ways to determine the velocity and acceleration used for the system. Generally, however, you do **not** want to use the maximum possible velocity and acceleration the motor can output. This is because it can a) lead to instability, b) easily burn out the battery and c) not be reliable at inconsistent battery voltages. We typically use something a bit less than our maximum possible parameters to ensure a smooth and controlled motion.

To actually determine the maximum possible parameters however, we have a few options. To do all of them, we need to first run our subsystem at maximum speed manually while monitoring the position of it via something like an encoder. To actually read the values from this and determine our parameters, we can do two main things.

The first is to have the encoder output the velocity to Shuffleboard every update loop and to calculate the acceleration between updates to output to Shuffleboard as well. Then we can observe the graphs, and eyeball a good approximation of the maximum parameters. Using code to output the maximum parameters can be problematic due to noise in the reading.

Another way that is more reliable would be to graph the position and velocity to a CSV file on our RoboRIO and then download that file to our computer. We will cover how to create files more in depth later in the advanced sections, but once we do this, we can then plot the data in a program like Google Sheets or Excel and perform a linear regression / quadratic regression to determine the values for our velocity and acceleration.

## Limits of Motion Profiling

While motion profiling is incredibly powerful and can lead to really smooth and good-looking results, it too has its issues. The most prevalent issue is that motion profiling can't deal with disruptances very well as the profile follows a predetermined motion. If something such as a collision or mechanical issue moves the mechanism during its profile, the control loop will not be able to account for this in real time. Including the `kP` term with our motion profile helps us account for this, but it'll frequently have a small value so it can't do much to majorly correct the subsystem from it's deviation. 

## Sources

If you want more information, I would strongly recommend reading / watching the sources below, which were used to help write this article.

* https://blog.wesleyac.com/posts/intro-to-control-part-five-feedforward-motion-profiling
* https://docs.wpilib.org/en/stable/docs/software/advanced-control/controllers/trapezoidal-profiles.html
