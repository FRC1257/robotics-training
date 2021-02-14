# Comments

One of the most critical things about code is readability. Especially when you come back from a break or when multiple people are working on the same project, making sure that your code is readable and can be understood by anyone is critical. This is also important when you're trying to find why there's a problem in your program, which is a process known as **debugging**. One of the most important things that you can do to make your code readable is to add **comments**.

## What Comments Are

Just like the name suggests, comments are pieces of texts that comment on code. They have no effect on how the program runs, but they are essential for maintaining good code. Let's see how to make comments:

```java
public static void main(String[] args) {
    // This is a comment!
}
```

Comments can contain any text, and once you put the symbols `//` in a line, everything after it will become a comment. For instance:

```java
public static void main(String[] args) {
    int testInt = 5; //This makes an integer
}
```

## Multiline Comments

`//` works well for comments that are short, but sometimes you want to put a bit more detail that will take up multiple lines. As a result, we have something called multiline comments:

```java
public static void main(String[] args) {
    /**
     * Everything in between those two symbols is a comment!
     * This is also a comment!
     */
}
```

## Comment Usage

Use comments whenever you have code that's function is not obvious. For instance, you should **not** put comments here:

```java
int testInt = 219309; //This is a number
```

Anyone can tell what this line does; it creates a number variable. In this case, this comment is useless, takes up space, and is not helpful at all. On the other hand, this is a good comment from our robot code:

```java
/**
 * Changes the elevator output depending on the position of the elevator
 * If the elevator is at the bottom, don't move the elevator down
 * If the elevator is approaching a mechanical stop, slow it down
 */
private double capElevatorOutput(double output) {
    double cappedOutput = output;
    if (output < 0 && getEncoder() <= 0)
        cappedOutput = 0;
    else if (output < 0 && getEncoder() <= 5)
        cappedOutput *= Constants.ELEVATOR_SPEED_REDUCTION;
    else if (output > 0 && getEncoder() >= Constants.ELEVATOR_MAX_HEIGHT)
        cappedOutput = 0;
    else if (output > 0 && getEncoder() >= Constants.ELEVATOR_MAX_HEIGHT - 5)
        cappedOutput *= Constants.ELEVATOR_SPEED_REDUCTION;

    return cappedOutput;
}
```

Don't worry about the specifics of that code, this is just a demonstration of how we can explain the purpose of complex code through a comment. Without the comment, it would be much more difficult to analyze and interpret what the code is doing.

## Disclaimer

In these guides, I will frequently be using comments to display basic features. Note that this does not mean that they are good comments that you should put in your code.
