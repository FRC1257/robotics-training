# Overloading

## What Overloading Is

Another programming concept is **overloading**, which means that we can define multiple functions with the same name but different arguments. The best way to see this is through an example that we should be very similar with: `System.out.println`.

## Example of Overloading

We discussed that `System.out.println` can be used to output text to appear on the screen. However, you may have noticed that we can pass in all types of variables such as `String`, `double`, `int`, or even `boolean`. However, we always use the same spelling: `System.out.println`. The way this works is that in Java, there are multiple definitions of `System.out.println`, each with different arguments:

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

This way, we can define multiple implementations of the same function dependent on the input. Although the function names are the same, Java can tell the functions apart by the different types of arguments. Then, it doesn't matter if the argument passed in isn't quite a `String`, as long as the implementation for that argument type is defined.

## Robotics Programming

We don't use overloading too much in our robotics programs, so don't worry too much if you don't understand it. It's mostly that if you read library documentation and other people's code, you might see it present. Just make sure you know it exists and that you can use any of the implementations given to you.
