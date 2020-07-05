# Overview

## Conceptual Aspect

As mentioned before, autonomous is a 15-second period in the beginning of a match where robots can move independent of driver control to score and prepare for teleop.

**MAIN IDEA: To time-efficiently and consistently score as much as possible.**

Our scoring tasks will vary year to year, whether it be shooting or placing a game piece. However, the bulk of the work for us as programmers in auto is *pathing*, namely planning drivetrain trajectories and movement. We'll see more of this in the next few sections.

## Programming Aspect

A broad description of what we do: we organize the commands and subsystems already written out such that they form an autonomous *routine*. Since we generally are trying to accomplish a difficult task independent of driver control, we usually need to augment our robot capability. This might mean adding closed-loop control to various subsystems, or in other words, just being able to *control our robot better.* Having a well-tuned robot makes everything a lot easier, especially for autonomous.

Auto routines will be programmed in the form of commands, and therefore should go in an /auto folder under /commands.

## Examples

Here are a few examples of really riveting, top-tier autonomous robot performances.

<iframe width="560" height="315" src="https://www.youtube.com/embed/aFZy8iibMD0?start=20" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Team 254 (The Cheesy Poofs) had a very consistent autonomous in 2014 that allowed them to score the maximum amount of game pieces. While their s-curve trajectory looks simple for today, it was revolutionary for a robot in 2014. The complexity also lies in their ability to hold the three balls and shoot them both quickly and reliably.

<iframe width="560" height="315" src="https://www.youtube.com/embed/pfhBCb6bXpE?start=4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

254 went undefeated in the 2018 season, and the capability shown here is partly why. Autonomous was the main focal point of the 2018 game (Power Up), and paying deep attention to it clearly paid well for the team. 254 achieved their three/four-cube autos very frequently, which gave them a head start over the opponents in nearly every match played.

It's honestly a prime example for robot control as well -- the sleekness of their robot's mechanism movement and their fluid trajectory following are amazing.

<iframe width="560" height="315" src="https://www.youtube.com/embed/5bxq2N02pJM?start=14" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Here's another great example of a robot (from Team 836, The RoboBees) in autonomous. A few things:

- While they went for a more complex drivetrain (not the common tank drive), they definitely use it to its full potential; moving sideways made intaking a lot easier for this robot.
- They were able to make *moving shots*. Pretty difficult, and requires very precise control.
- This robot has vision targeting, which allows for their shooter to be well-alligned with the target.

---

Something that should be noted here is the distinction of complexity in auto. Although these are just three examples taken from three different seasons, it should be clear that robot functionality in autonomous has expanded very much in the past few years.

While 1257 generally has not reached such a "high" level of functionality for autonomous in the past, we are striving towards it. In the next sections, you will learn how we manage our drivetrain trajectories for the autonomous period.
