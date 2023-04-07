# Vision

## Vision Basics

Vision is the practice of analyzing camera feed from the robot to determine the location of targets relative to the robot and move the robot accordingly.

To understand the basics of how vision works, it is highly recommended that you check out this [link](https://www.youtube.com/watch?v=rLwOkAJqImo) to a presentation done by Team 254.

## When is Vision Used?

* It is difficult to quickly align the robot to a target
* The target is easily distinguishable from the environment
* Bright color (game piece) or reflective vision tape (scoring areas)
* A simpler sensor can't be used

## Vision Options

* **Camera + Driver Station** - you send feed from the camera back to the computer controlling the robot, which processes that info and then sends it back to the robot. The processing of the vision feed is fast, but the latency between the robot and the computer (driver station) is very slow. It is also more complicated to set up.
* **Camera + RoboRIO** - you process the vision feed directly on the robot's computer, which is very slow and could potentially lag out your entire robot. However, it is much easier to program than the previous option.
* **External Camera + External CPU** - you add a separate CPU to the robot that does the processing directly. This is fast enough for FRC purposes, but can be complicated to set up.

## External CPUs
* **Raspberry Pi** - a small, cheap, and easy to use computer that can be used to process vision feed. It is very easy to set up, but it is not very powerful and can be slow.
* **Limelight** - a camera that is specifically designed for vision processing. It is very easy to set up, but it is not very powerful and can be slow.
* **Jetson Nano** - a small, cheap, and easy to use computer that can be used to process vision feed. It is very easy to set up, but it is not very powerful and can be slow.

## Vision Processing
* **Limelight** - the Limelight has a built-in vision processing pipeline that can be configured to detect different targets. It is very easy to set up, but it is not very powerful and can be slow.
* **PhotonVision** - 
* **WPILibPi** - 