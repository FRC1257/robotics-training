# Your first weeks on the programming team

You do not need a robot to begin. Work through a short project, explain it to another student, then use the simulator to test behavior.

## Learn Java

1. Read [variables and operators](../java/1-Basics/README.md). Write a program that computes a total score from an array. Run three known cases.
2. Read [control flow](../java/2-Control_Flow/README.md). Add a threshold and explain both branches. Use a loop instead of duplicating lines.
3. Read [functions](../java/3-Functions/README.md). Separate calculation from printing. What input produces each output?
4. Read [objects](../java/4-Objects/README.md). Model a mechanism's state with private fields and public methods. Explain the class versus one instance.
5. Practice [lambdas](../java/3-Functions/5-Lambdas.md). Explain why a supplier reads later instead of capturing one reading now.
6. Complete [textbook practice](../java/Textbook_Practice.md), adapted and corrected from the supplied team textbook.

**Ready to continue:** run a Java program, interpret a compiler error, write a method with a return value, and explain a constructor. Bring the smallest failing example to a mentor.

## Program a simulated mechanism

Start with [the architecture](../frc/1-Basics/4b-Architecture.md) and [first subsystem](../frc/1-Basics/5-First_Subsystem.md). Use the starter's exact versions. Make the intake run, stop on release, stop on interruption, and remain stopped when disabled. Run its tests. Change one behavior and predict which test should fail. Practice [Git](../git/How_To_Git.md) by making that change on a branch and requesting review.

**Ready to continue:** identify subsystem, command, binding, scheduler, requested output, and measured input. Explain why two conflicting commands cannot both own the same requirement.

## Measure and control

1. Trace [zeroing and units](../frc/2-Sensors_And_Shuffleboard/8-Zeroing_Sensors.md). Put units on every conversion.
2. Read [PID](../frc/3-Closed_Loop_Control/2-Basics_of_PID.md) and use [the lab](../labs/pid.html ':ignore'). Compare feedback alone with gravity compensation.
3. Use [motion profiles](../labs/motion.html ':ignore'). Describe what the reference limits and what the controller must still accomplish.
4. Complete [the drivetrain project](../frc/1-Basics/Modern_Drivetrain_Project.md), then follow [vision setup](../vision/PhotonVision/Setup.md).
5. Diagnose [a real log](../robots/2024-log.md). Separate observations from proposed causes.

For each project save the source revision, command you ran, result, one change, and one unanswered question. A reading checkmark records progress; a demonstration establishes understanding. Ask someone to reproduce your result from your instructions.
