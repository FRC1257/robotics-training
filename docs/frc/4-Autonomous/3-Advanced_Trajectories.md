# Advanced Trajectories

In the next few sections, we'll learn how to create curved trajectories that the drivetrain can use to smoothly follow. These trajectories run much faster than segmented trajectories since the robot doesn't have to stop after each motion and the paths are much shorter, but they are far more complicated as a result. It is highly recommended that you have a good understanding of velocity PID and how to tune it before moving on to these tutorials.

> [!NOTE]
> As of 2021, our team has never used these trajectories in competition. While the code for them is written,
> they have not been extensively tested due to the COVID-19 pandemic that cut the 2020 and 2021 seasons short.
> As a result, it is highly recommended to test these procedures extensively and update these training documents when comfortable
> with them.
> 
> As a result of this, the drivetrain code is not currently inside of the examples repository for our team, but is instead
> located here: 
>
> https://github.com/Ryan10145/frc-drivetrain
