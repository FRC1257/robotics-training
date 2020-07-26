# Motion Profiling

## Limits of PID

While PID is definitely really powerful, it definitely lacks some traits and leaves much to be desired when thinking about the ideal control method. First of all, PID is very prone to overshooting. While this could be solved with an increase to the `kD` term, too much increasing will lead to a slow response. It is difficult to find the precise parameters that will give us both a smooth response that doesn't overshoot and moves quickly. Additionally, PID accelerates very quickly at the beginning as the initial error is very large. This can lead to system instability that could damage our system or make it lose its grip on game pieces. Again, increasing the `kD` term can help us balance this out, but this also leads to a slower convergence to the final goal. Finding the perfect combination of PID parameters can be extremely difficult and maybe even nonexistent. Fortunately, we have another option: **motion profiling**.

## Motion Profiling



### Generating Trapezoidal Profile



## Using WPILib TrapezoidProfile



## Using SPARK MAX Smart Motion



## Determining Velocity / Acceleration


## Limits of Motion Profiling

While motion profiling is incredibly powerful and can lead to really smooth and good-looking results, it too has its issues. The most prevalent issue is that motion profiling can't deal with disruptances very well as the profile follows a predetermined motion. If something such as a collision or mechanical issue moves the mechanism during its profile, the control loop will not be able to account for this in real time. Including the `kP` term with our motion profile helps us account for this, but it'll frequently have a small value so it can't do much to majorly correct the subsystem from it's deviation. 

## Sources

If you want more information, I would strongly recommend reading / watching the sources below, which were used to help write this article.

* https://blog.wesleyac.com/posts/intro-to-control-part-five-feedforward-motion-profiling
* https://docs.wpilib.org/en/stable/docs/software/advanced-control/controllers/trapezoidal-profiles.html
