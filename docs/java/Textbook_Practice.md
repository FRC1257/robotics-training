# Java practice: predict, run, explain

**Prerequisites:** Java basics, control flow and classes. **Time:** 45–60 minutes. These exercises adapt the sequence in the supplied *1257 Parallel Universe Programming 2026–2027*, pages 6–7 and 11; their code and answers below were written for this course.

1. Define an integer player level and a boolean `hasKey`. Print `"open"` only when the level is at least 3 and the player has the key. Test `(3, true)`, `(2, true)`, `(3, false)`: expected open, closed, closed.
2. Store three names in `String[] names = {"Ari", "Bo", "Cy"};` and print each using an enhanced for loop. Expected: each name once, in order. Then use `ArrayList<Integer>` for a changing list of levels. Java generic type arguments are reference types: use `Integer`, not `int`.
3. Define an abstract `Mechanism` with abstract `String describe()`, then subclasses `Intake` and `Arm` returning distinct descriptions. Put both in a `Mechanism[]`, iterate and call `describe()`. Expected: the implementation chosen depends on the actual object. This practices polymorphism without implying a physical robot implementation.

Compile each complete program with `javac FileName.java`, run with `java FileName`, and compare output. If compilation fails, check the public class and filename match, punctuation, and generic types. Ask a mentor to review code and results; the supplied textbook's examples are reference material and should be checked against Java documentation rather than copied uncritically. [Oracle classes](https://docs.oracle.com/javase/tutorial/java/javaOO/classes.html).
