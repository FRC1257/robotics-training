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

## Limelight

Fortunately, there are prebuilt options to set up the last option very easily such as the Limelight, which is a Raspberry Pi, camera, and lighting system all packaged into one system. It does all vision processing onboard and can be configured with a tool to customize the vision tracking. It then sends the target data to our robot, which can then use this data to move accordingly.

The way the Limelight works is that it uses its configuration to identify which objects in its image is most likely to be the desired target. It then sends this information to the RoboRIO where our main code is running.

For information about how to install the Limelight software and access the dashboard, visit the [official Limelight documentation](https://docs.limelightvision.io/en/latest/) 

### Updating Limelight

* The computer will not detect the limelight with the usb software if you do not follow these steps!
  * First from a turned off state, turn on the robot with the computer connected to the robot through microusb.
    * If this does not work then try to power on the robot, connect the usb, and then proceed the following steps.
  * As soon as the limelight powers on, your computer should detect the limelight and the green light should briefly flash before turning off
  * After this, the limelight could be detected and actually turned on.
* Once the limelight is reimaged and updated, all of the personalized settings are reset and need to be changed again. The team number of the limelight has to be changed again or else the program will not be able to communicate to the limelight.

### Tuning Limelight Image

Upon opening the Limelight software, we can create various pipelines for different use cases. For instance, we can create one pipeline that does nothing to the feed and then use the Limelight as basically a super fancy camera for driving. We could create another pipeline that locks on to reflective tape so we can align to scoring areas. We could create another pipeline that locks on to bright orange game pieces. In each game, the pipelines we use can change immensely, making it important to update them each year. Check out the Limelight documentation for how to create different pipelines in the vision software.

Here are some general tips on how to tune Limelight piplines:
* When tracking onto reflective tape, make sure the LEDs are enabled
  * Reduce exposure, brightness, white balance, focus, and other settings to make the image as black as possible and so only the reflective tape appears
* When tracking onto bright game pieces instead, you can turn off the LEDs
  * Keep the image mostly looking the same (don't overexpose the image to make it entirely black), and just use colored blob detection features to track the game piece
  * As long as you are not overexposing, Hue is the most important value for vision and should be tuned first.

### Receiving Target Information

To receive data from the Limelight, we use something called `Network Tables`. The way Network Tables works is very similar to SmartDashboard / Shuffleboard.

> [!NOTE]
> Behind the scenes, SmartDashboard / Shuffleboard actually use Network Tables to communicate data with the driver station computer!

There are many values in the Network Tables that the Limelight will constantly populate with the information about where the target is. The full list of values we can use is located [here](https://docs.limelightvision.io/en/latest/networktables_api.html), which also explains how we can access it with our Java code (the value 0 is for the backup value that will be returned in case the Network Tables entry does not exist).

```java
NetworkTableInstance.getDefault().getTable("limelight").getEntry("<variable_name>").getDouble(0);
```

### Communicating With Limelight

While we can use Network Tables to retrieve data from the Limelight, we can also use it to send some data such as which pipeline we would like to be using. You can view the full data we can send [here](https://docs.limelightvision.io/en/latest/networktables_api.html), but typically the only one we set is the `pipeline` data since this will allow us to switch between various pipelines.

We can do this with just a single line of code:
```java
NetworkTableInstance.getDefault().getTable("limelight").getEntry("pipeline").setNumber(<pipeline value>);
```

### Using Limelight Target Information

TODO

### Limelight Utility Class

In previous years, we've abstracted much of this information into a utility class called `Limelight` inside of our `/util` folder. You can check out previous years' iterations of this [here](https://github.com/FRC1257/2020-Robot/blob/master/src/main/java/frc/robot/util/Limelight.java). Basically, rather than having to constantly type out the network tables calls and risk messing them up somewhere in our code, we just make a few functions that can do this for us. We could also customize this class by adding extra functions to modify which pipelines we are on.
