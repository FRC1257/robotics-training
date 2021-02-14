# Formatting Guide

This is FRC 1257's general guide for code formatting. We use this set of formatting to maintain readability and consistency within our code. If you see any code that does not follow this formatting guide, feel free to conform it to these practices. Note: most of this is based off of the Google Style Guide found [here](https://google.github.io/styleguide/javaguide.html#s4.7-grouping-parentheses) but it's modified for our team's use.

## Java

### Naming

- All class/file names should have all words with the first letter capitalized and no spaces/underscores in between the words
  - `Main.java`, `Robot.java`, `RobotMap.java`, `CargoIntakeArm.java`
- All variable names should have the first letter lowercase, and then all following words should have the first letter capitalized. There should be no spaces/underscores in between the words.
  - `armPosition`, `distance`, `robotEnabled`, `percentComplete`
- All constant names should be all uppercase, with underscores in between each word.
  - `CARGO_INTAKE_ARM_ID`, `DRIVE_FRONT_LEFT_ID`, `TURN_SPEED`

### Spacing

- Put spaces around each operator such as `+`, `-`, `*`, or `/`
  - Do not put spaces around round parentheses like `()`
- Put a space between `)` and `{`

```java
if(a + b < 4) {
    // Do stuff
}
```

- Do not put a space between `if/for/while` and `(`
- Put single blank lines where appropriate to block out certain bits of code
  - For instance, you can put blank lines between different portions of the code to signify that they perform different functions
  - Do not put more than one blank line
- Put a single blank line after the beginning of each class
  
```java
public class Main {

    int i = 0;
    // more stuff
}
```

### Miscellaneous

- If a class is a Singleton, put `public static CLASS instance = null` at the top. Put `getInstance()` at the bottom.

- All comments for class/function definitions should be block comments
  - These are comments that explain what a function/class does
- There should be a block comment for each state enum that explains what each state is
- Comments for variables and explaining what a bit of code does can be in single line comments
- Formatting for block comments:

```java
/**
 * Text goes here
 * New line
 */
```

- All files should be formatted with 4 spaces for tabs

## FRC Code Structure

- All general constants/IDs should be placed in RobotMap.java
- All raw controller inputs should be handled in OI.java
- All specific subsystem constants should belong at the top of that subsystem's file
- All subsystems should extend `SnailSubsystem`
- All subsystems should use a state machine to handle all behavior
  - Public functions should never change motor/solenoid outputs directly, but should rather change the state/internal variables of the subsystem
    - Exception is for the `update()` method
  - Only the `update()` function should be able to change motor/solenoid outputs. The `update()` function should look at the current state of the subsystem and make these changes.
- All member variables in a subsystem should be private
  - Use getters/setters to update them

## Git

All commit messages should adhere to the following guidelines:

- Describes the changes accurately
  - Do not put `Fix Bugs`, put a bit more detail into what was fixed
- Focuses just on the change
  - We want to be able to quickly look through and identify what each commit does
  - Don't put unnecessary information or comments about random things  
- Avoid grammar/spelling mistakes
  - They happen, but make a conscious effort to avoid them
  - Capitalize the first word of the message
- Don't put periods at the end of the commit message
- Put everything in the imperative mood
  - Use `fix`, not `fixes` or `fixed`

