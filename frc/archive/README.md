# FRC Programming

***If you haven't gone through the Java tutorials yet, go through those first.***

TODO: 
- adapt training code to 2020 framework (after release of 2020 WPILib)

## Libraries

To program robots, we use a combination of Java and WPILib. Essentially, there is a lot of code that goes into programming robots, most of which is incredibly complicated and time-consuming. As a result, to help access things like motors, time things like the different robot periods, and manage complicated procedures like PID, we use already written code. All of this code is compiled into something called a library called WPILib.

## WPILib

WPILib contains a lot of classes that help with managing motors, sensors, and sync your robot. They also give different structures for maintaining the flow of the robot program.

[Java Documentation](http://first.wpi.edu/FRC/roborio/beta/docs/java/)

## IDE

Up until this point, we have been using repl.it. However, to use robot code, we program in Visual Studio Code, which cannot be downloaded on Chromebooks. As a result, it is greatly appreciated if you all bring in your own computers. We can probably also form groups and some of you will have to program together. If you bring in your computer and ask me, I can help you set it up. You can also follow [this](http://docs.wpilib.org/en/latest/docs/getting-started/getting-started-frc-control-system/wpilib-setup.html) guide.

It is highly suggested to, if you can, practice robot programming on a real computer. This way, you can see your errors and actually practice building your programs and getting comfortable with the program structure.

## Import Statements

Many times in robot code snippets, I will omit import statements because I either forgot them or I want to save space. You can edit them into the tutorials if you want, but just note that you may have to use your IDE and auto import some stuff.

## Examples

One of the best ways to learn robot programming is to try stuff out and look at a **ton** of examples. Note that if you look at other teams' code, they will do things differently from us, but the general idea and logic behind their code is really good to learn from. Here are a few links to get you started:

- [FRC 1257 2019 Robot - Command](https://github.com/FRC1257/2019-Robot-Command)
- [FRC 1257 2018 Robot - Command (Untested)](https://github.com/Ryan10145/2018-Robot-Command)
- [FRC 340 2018 Robot - Command](https://github.com/Greater-Rochester-Robotics/PowerUp2018-340)
- [FRC 1923 2019 Robot - Command](https://github.com/Team1923/Destination_Deep_Space_2019)
- [FRC 1923 2018 Robot - Command](https://github.com/Team1923/Power_Up_2018)

Here are some more advanced examples that use some custom infrastructure:

- [FRC 2590 2018 Robot - Custom Command](https://github.com/Team2590/FRC2590-2018-PostIRI)
- [FRC 254 2018 Robot - Command](https://github.com/Team254/FRC-2018-Public)
