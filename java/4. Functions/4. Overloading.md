# Overloading

## What Overloading Is

Overloading is just a quick topic that deals with increased ease of coding. With the feature called **overloading**, we can define multiple functions with the same name. However, we can give them different arguments so that the program can differentiate them. The best way to see this is through an example that we should be very similar with: 'Systme.out.println`

## Example of Overloading

We discussed that `System.out.println` takes in a `String`, and then performs a few actions that causes the text to appear on the screen. However, some of you may have noticed that we don't just have to pass `Strings` in, we can also pass in `doubles`, `ints`, or even `booleans`. However, we always use the same spelling: `System.out.println`. The way this works is that in Java, there are multiple definitions of `System.out.println`, each with different arguments:

```java

public static void println(String x) {
    // Do stuff specific to String
}

public static void println(int x) {
    // Do stuff specific to int
}

public static void println(double x) {
    // Do stuff specific to double
}

public static void println(boolean x) {
    // Do stuff specific to boolean
}

```

This way, we can define multiple implementations of the same function dependent on the input. Then, it doesn't matter if the argument isn't quite a `String`, as long as the implementation for that argument type is defined.

## Robotics Programming

We don't use overloading too much in our robotics programs, so don't worry too much if you don't understand it. It's mostly that if you read library documentation and other people's code, you might see it present. Just make sure you know it exists and that you can use any of the implementations given to you.
