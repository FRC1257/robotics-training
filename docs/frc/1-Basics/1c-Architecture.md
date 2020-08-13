# Architecture

Compared to when we were just writing basic Java programs, our code had a very simple structure. We just had the `main()` function and then everything there runs just once. However with robot code, the structure gets more complex.

> [!NOTE]
> Before reading this, make sure you follow the `Setting Up` guide so that you can follow along on your version of the code

## Code Location

When we make a robot project, we have a lot of folders and files that may intimidate you. However, we only have to focus on the files inside of the folder path `java/frc/robot/`. Here we have all of our files, which are organized into folders. Next, we will go over all of the files that are important for us.

## Robot.java

`Robot.java` is one of the files that we'll seldom have to edit. In this file, we have a bunch of things that are happening behind the scenes to put the entire robot together. It grabs parts from files such as `RobotContainer.java` and puts them all together so that the robot knows when to execute certain parts of the code.

For a quick rundown though, we have various functions that are all run when certain parts of the match begin and occur. In `robotInit()`, the components of the robot are all set up as a part of `RobotContainer`. Then, in `robotPeriodic()`, we periodically (every 20 ms) call `CommandScheduler.getInstance.run()`, which is a part of WPILib, to take all of our scheduled actions and actually send them to the various components of the robot. We also tell our `RobotContainer` output diagnostic data and update testing functionality.

`autonomousInit()` and `teleopInit()` handle setting up and cancelling all of our actions during autonomous. Finally `testInit()` deals with setting up our testing interface.

Again, don't worry if you don't 100% get what is going on here since it is mostly behind-the-scenes stuff that will barely ever be changed.

## Main.java

`Main.java` is a file that will **never** be edited. This is because it is a file that is super behind-the-scenes and just serves to initialize our `Robot.java` file and send it to the Robot system.

## Constants.java

`Constants.java` is a file that will be frequently edited. When we make our robot code, we will many times have "magical numbers" that we just throw in. For instance, we might test our intake and discover that 60% is a good speed to set it to. Instead of just throwing this in our robot code where it could easily get lost, we put it in `Constants.java`. `Constants.java` serves as the main hub for every constant we could possible put in our robot. For an example, see this file in our 2020 Robot Code: [`Constants.java`](https://github.com/FRC1257/2020-Robot/blob/master/src/main/java/frc/robot/Constants.java).

We structure this file with [inner static classes](https://www.geeksforgeeks.org/static-class-in-java/). An example would be `ElectricalLayout`, where we store all IDs/port numbers for robot hardware. Using static classes allows us to reference constants through something like `Constants.ElectricalLayout.CONTROLLER_DRIVER_ID` and put a lot more organization into our program.

However, it can be tedious sometimes to write out something like, say, `Constants.Autonomous` every time we call a constant from the `Autonomous` static class. It also wastes a lot of screen space. Instead, at the top of the file we want to use that autonomous constant in, we put the following line:

```java
import static frc.robot.Constants.Autonomous.*
```

This allows us to just type something like `DRIVE_DIST` instead of the entire `Constants.Autonomous.DRIVE_DIST`.

> [!NOTE]
> All constants in this file need the code `public static` in front of the variable to make it usable.

## /subsystems

When we start programming, this folder will hold all of the subsystems, or major mechanisms, that make up our robot. At the moment, we just have one file in here: `SnailSubsystem.java`. This file is something that all of our subsystems must extend since it allows the subsystem to be registered within RobotContainer and makes sure that all of its appropriate functions are called at the correct time.

## /commands

This folder doesn't contain anything at the moment, but when we start programming, it will hold all of the "commands," or actions, that all of the subsystems can use.

## /util

This folder contains some utility classes that are used by other sections of our robot code. In the template, we only have stuff related to controllers that we use inside of `RobotContainer`. To summarize though, the `SnailController` is a subclass of the WPILib provided `XboxController` class. We use this because we need to add some extra features to the controller that make our lives way easier. Some of these include an easier way to bind controller inputs, getting the triggers, applying deadbands, and inverting the y-axis of both of the joysticks.

## RobotContainer.java

This is the biggest file in the template and probably the most important. This file can be thought of as almost a map or blueprint of how the entire robot is put together. This file contains all the different components of the robot and brings them all together into a coherent system.

Our template has a lot of components missing that are supposed to be filled in. To see a fully completed version of `RobotContainer`, please see our version in the 2020 robot: [`RobotContainer.java`](https://github.com/FRC1257/2020-Robot/blob/master/src/main/java/frc/robot/RobotContainer.java).

First of all, in the constructor for `RobotContainer`, we create all of our controllers (we always use 2) that we use for controlling the robot. Later, we will define how to bind buttons on our controllers to actions of our robot. The primary function of our constructor is to call a bunch of other functions which we discuss below.

We create all of the subsystems that compose our robot in `configureSubsystems()`. Again, see our 2020 code for an example of how this works. Next, we register each of our subsystems in the `subsystems` ArrayList. This allows all of our subsystems to have their functions called at the right time so they actually work in our robot. Finally, we have some extra stuff in our constructor that handle counting and actually calling the other functions inside of `RobotContainer`.

Next, we have `configureButtonBindings()`, where we define the mapping between our buttons and the actions that we want our robot to perform. For instance, we might define a link between the A button on our operator controller and the intake ejecting.

Finally, we have `configureAutoChoosers()` and `getAutoCommand()`. These functions are not needed for the basics that we are going over for now, but we will get more into depth on these when we go over autonomous.

We also have some functions at the button that handle behind the scenes work. Once we register all of our subsystems inside of the `subsystems` ArrayList, these functions will take care of everything so we don't have to worry that much.
