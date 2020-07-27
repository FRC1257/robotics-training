# Motion Profiling

## Limits of PID

While PID is definitely really powerful, it definitely lacks some traits and leaves much to be desired when thinking about the ideal control method. First of all, PID is very prone to overshooting. While this could be solved with an increase to the `kD` term, too much increasing will lead to a slow response. It is difficult to find the precise parameters that will give us both a smooth response that doesn't overshoot and moves quickly. Additionally, PID accelerates very quickly at the beginning as the initial error is very large. This can lead to system instability that could damage our system or make it lose its grip on game pieces. Again, increasing the `kD` term can help us balance this out, but this also leads to a slower convergence to the final goal. Finding the perfect combination of PID parameters can be extremely difficult and maybe even nonexistent. Fortunately, we have another option: **motion profiling**.

## Motion Profiling

Motion profiling is essentially a method of using the physical constraints of your system (maximum velocity and maximum acceleration) and generating a profile, or plan, of the exact movement of the system to accomplish a certain task. For instance, if we wanted to go forward 10 feet and we knew our maximum velocity and acceleration, we could generate an exact profile that tells us where we should be and what speed we should be at for every time step in our path. For example, we could have a profile like this, which tells us the exact velocity we need to be moving at each time step to accomplish a smooth motion. (Credit to [Linear Motion Tips](https://www.linearmotiontips.com/how-to-calculate-velocity/))

![Trapezoid Velocity Motion Profile](./img/trapezoidal-profile.jpg)

Once we generate this motion profile, which in this case is a **trapezoidal motion profile**, we can follow it exactly and guarantee that we will reach our target goal. For each target distance we want to move, we will have to generate a new motion profile that will get us there. However, we need to somehow be able to follow this velocity graph over time to follow this motion profile. Fortunately, we just did a whole section on this, so we are well equipped to tackle motion profiling! Now, we just need to figure out how to generate the motion profile.

Some advantages of this motion profile are that a) we can make the system obey a certain maximum velocity and acceleration, which will be parameters we pass in once we generate the motion profile, and b) we can know exactly how long the movement will take. Due to condition (a), we can also increase the stability of our mechanism easily by just adjusting the parameters such as the max velocity and acceleration.

### Generating Trapezoidal Profile

There are various types of motion profiles, but the most basic one that we will be using is a trapezoidal motion profile. The trapezoidal motion profile consists of 3 parts, accelerating up to our maximum velocity at our designated maximum accceleration, then cruising at the maximum velocity, and finally deccelerating from our maximum velocity back to 0 at the negative of our designated maximum acceleration. If you look at the diagram above, these are represented by the `t_a`, `t_c`, and `t_d` present on the x-axis.

Sometimes, the distance we need to go is so short that we don't have time to go to a cruising velocity. We can instead use a triangular motion profile instead, which is just where `t_c = 0`, or we spend 0 time cruising. Instead, halfway through our motion, we go straight from accelerating to deccelerating.

We don't actually have to worry about generating these profiles alone, since WPILib provides the `TrapezoidProfile` class to handle all of these calculations for us. However, I'm going to take a dive into deriving these physics below. Feel free to skip it if you're not interested.

### Physics of Generating Trapezoidal Profiles

TODO

## Using WPILib TrapezoidProfile



## Using SPARK MAX Smart Motion



## Determining Velocity / Acceleration


## Limits of Motion Profiling

While motion profiling is incredibly powerful and can lead to really smooth and good-looking results, it too has its issues. The most prevalent issue is that motion profiling can't deal with disruptances very well as the profile follows a predetermined motion. If something such as a collision or mechanical issue moves the mechanism during its profile, the control loop will not be able to account for this in real time. Including the `kP` term with our motion profile helps us account for this, but it'll frequently have a small value so it can't do much to majorly correct the subsystem from it's deviation. 

## Sources

If you want more information, I would strongly recommend reading / watching the sources below, which were used to help write this article.

* https://blog.wesleyac.com/posts/intro-to-control-part-five-feedforward-motion-profiling
* https://docs.wpilib.org/en/stable/docs/software/advanced-control/controllers/trapezoidal-profiles.html
