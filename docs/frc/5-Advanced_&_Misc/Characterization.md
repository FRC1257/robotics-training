# Characterization

Previously, we discussed how with feedforward, we could make our various systems perform better by using normal feedforward or arbitrary feedforward. However, we only discussed how we could calculate these values empirically. Fortunately, there are tools out there to actually **characterize** our motors and subsystems, allowing us to determines appropriate values to directly solve for these relationships. WPILib fortunately provides us with a suite of tools to allow us to perform these things.

The basic idea is that you have to run a tool that will test the robot and generate the parameters that characterize the system you are working with. Then, you can plug these parameters into various classes in WPILib to generate feedforward controllers. Finally, you can then query these controllers with desired velocity and acceleration values, which will then give you the appropriate motor value to do so.

## Downloading Characterization Suite

First, install Python from [this link](https://www.python.org/downloads/).

Then, open a terminal window and type this in: `pip install frc-characterization`.

## Characterizing a System

To characterize a system, we first have to determine which of the following match it:

* motor
* drive
* arm
* elevator

Once you have the correct one, you have to type into the console `frc-characterization [type] new`. For instance, to open a drivetrain characterization, you could type `frc-characterization drive new`.

Next, you should see an interface with a ton of different options to configure. First, you have to configure the motor type in the top right, which is **very** important to select correctly so that the project even runs. Next, you have to configure the parameters in the center with things such as the motor types, port numbers, inversions, etc. One thing to make sure is that the units are consistent (normally we prefer to use meters and meters per second). Another thing is to make sure all values of `True` and `False` begin with a capital since this is Python code, which requires that. Most of the values are pretty self-explanatory though. The main issue is the `gearing` variable, which will have to vary depending on the gearbox ratio of the system. It's a good idea to ask the build subteam for this value.

After setting everything up, you can press the `Generate Project` and `Deploy Project` button on the left.

Finally, you can run the characterization routine as detailed [here](https://docs.wpilib.org/en/stable/docs/software/wpilib-tools/robot-characterization/characterization-routine.html).

After running the system, we can now analyze the data collected via the characterization tool. We first have to open the Data Analyzer via the button on the left, and then we can load the data file. Then, we have to set up the units at the top and various other parameters.

First of all, if we're just interested in the feedforward side of things, we can just press the Analyze Data button, and we can record the values displayed for `kS`, `kV`, `kA`, and maybe more if you are using specific subsystems. However, we should also pay attention to the $r^2$ value, since that will tell us how good the data we collected actually matches the model generated. If the value is below `0.9`, then the characterization was most likely not correct. You can check [this article](https://docs.wpilib.org/en/stable/docs/software/wpilib-tools/robot-characterization/viewing-diagnostics.html) about viewing diagnostics to figure out what happened.

We can also use this data to generate approximations for good feedback parameters for `PIDControllers`. We have a whole assortment of options, but the most important ones are `Gain Settings Preset`, `Loop Type`, and `Controller Type`. Another important factor to consider are the max acceptable control effort, which is measured in volts. We have to make sure that we obey this value when setting up our controllers. We can convert this to a value between 0 and 1 by dividing by 12.

## Using the Feedforward Values

Now that we have these characterization values, we need to somehow be able to use them. For simple motors / drivetrains, we have the `SimpleMotorFeedforward` class, while for arms we have the `ArmFeedforward` class, and for elevators we have the `ElevatorFeedforward` class. We can construct these classes with the gains we obtained earlier. After we construct them, we can then query them with the desired state of the system. For instance, with the motor feedforward, we could query it with a desired velocity and acceleration to obtain the desired motor value for that. With the arm feedforward, we have to also give it the current position, since that is important in determining the correct value.

Another thing to keep in mind is that the classes return a voltage value, not a percentage. If we assumed our battery was fully charged and we weren't overdrawing, we could simply divide this value by `12` to obtain the percentage. However, this isn't always the case, making it safer to instead use the `setVoltage()` function present in many motors instead to pass in the value.

> [!WARNING]
> The units for these measurements will match what was passed into the characterization tool. We recommend for consistency to use radians for arms, and meters for everything else.

TODO: Add examples

## Sources

If you want more information, I would strongly recommend reading / watching the sources below, which were used to help write this article.

* [WPILib Docs - Robot Characterization](https://docs.wpilib.org/en/stable/docs/software/wpilib-tools/robot-characterization/introduction.html)
