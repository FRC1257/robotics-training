# Robot Code & Better Practices

Programming is a means to an end.

We can't fix everything in code, but we can make lives easier.

Example: [254 in 2014](https://www.youtube.com/watch?v=aFZy8iibMD0)
 - Constant intaking to retain game pieces
 - Pathing to dominate a game.

## WPILib

**Features:**
 - Base software for FRC programs
 - Built around robot controller/peripherals
 - Writes a lot of stuff for us

**Issues:**
 - More people than WPI make hardware
 - Other vendors give us code in the form of vendor libraries
 - Common vendor libraries:
   - Phoenix
   - Spark Max
   - NavX

## Gradle

 - Build system
 - Compiles code w/ dependencies
 - Copies the code to the robot and starts it
-  Replaces the super old/janky system called Ant

## Object Oriented Programming

### Objects
 - Everything has a type
   - chair, car, desk, computer
 - Each type has attributes
   - manufacturer, maker, location, brand
 - WPILib uses object to represent discrete things
 - Used to compartamentalizate code
 - Avoids tens of thousands of lines of unmaintainable code

### Logical Segmentation
 - Code is broken up into manageable chunks
 - Called "subsystems"
 - Each subsytem can have a state, or be 'stateless'
   - Intakes
   - Arms
   - Elevators
   - Anything remotely complicated (see 254 in 2018)
   - Example: [2590 in 2018](https://github.com/Team2590/FRC2590-2018-PostIRI/blob/master/src/org/usfirst/frc/team2590/subsystems/Intake.java)
     - Multiuse subsystems with many moving parts that need to be interrelated.
 - Subsystems are singletons
   - Can only create one version of something
   - Useful to avoid breaking control flow
   - Avoid having two instances of our code controlling the same hardware
     -  Can lead to very bad bugs
   -  WPILib `Subsystem`s are automatically Singletons

## Collision Avoidance

Using code to make sure subsystems don't collide with each other.

[971 in 2016](https://www.youtube.com/watch?v=CMX4ynSQsyI)

Used code to make sure the arm didn't hit their intake or climber while moving other subsystems. If their robot was e-stopped, physics took over and crushed their roboRIO.

## Iterative/Timed Robot

 - Iterative - Runs loop when given a packet from the DS
 - Timed - Runs at 50 Hz (more consistent and should always be used)

Just a ton of loops. Organization is your responsibility and you have to define your own structure.

You still can follow "guidelines" to get effective layout without reinventing the wheel.

Top team use Iterative, because it was the only option available when they wrote their robot framework and wanted further functionality that didn't yet exist in WPILib Command as it was still very new.

## Command-Based

Build on top of Timed/Iterative Robot
WPILib's way of
 - Expressing tasks in order
 - Running them at regular intervals via Scheduler

Parallel and Sequential Commands - Running commands in a specific order

 - [340 in 2018](https://github.com/Greater-Rochester-Robotics/PowerUp2018-340)
 - [254 in 2017](https://github.com/Team254/FRC-2017-Public) (Not WPILib command-based, but similar)

## Git

- Version control system
- Branches for keeping track of multiple versions of the code
  - Use merging and PRs to combine branches
- Package changes in form of commits, and then push them to online
  - Provide meaningful commit messages
- Use .gitignore to ignore files that you don't wantss
- `git blame` to find out who wrote a line of code

## Documentation

 - *Useful* comments
   - Other members should be able to read comments and in English get an idea of how it works
 - Use descriptive variable names and comments
 - Reuse code year over year as needed
   - Copy code from previous years

Reusable Code: [Falcon Library](https://github.com/5190GreenHopeRobotics/FalconLibrary)

## Writing Code

 - Only import as needed
   - Don't pollute the namespace
 - Keep vendor libraries up to date
 - Keep firmware up to date
 - Be meticulous about the above two
   - Can cost us competitions if we are not careful

## Deploy & Run

 - roboRIO is very slow
   - 256 MB of RAM
   - Monitor CAN and ethernet bandwidth utilization
    - High CAN usage can result in super bad behavior.
    - Fixable by changing status frame intervals (advanced!)
   - Offload tasks off of roboRIO if possible
   - Keep high-bandwith tasks on robot network
 - Work with build and electronics to get a headstart on code for parts not in yet
 - Stay away from for/while loops

## Misc

 - See how other teams did it first and if we can do it better
 - Factory reset and reprogram motor controllers on reboot
   - If motor controller reboots and robot doesn't, this can cause huge issues
 - Burn flash command
   - Stores the settings on the actual controller, use this
 - Set brake/coast as needed
   - Intake: brake
   - Flywheel: coast
   - Drivetrain w/ NEOs: Mix and match
 - **Read the documentation**
