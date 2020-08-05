# Functions with Return Types

When we have a function, we have the option of whether or not to return a value back to whatever called that function. Up until now, we have always specificed the return type of our functions as `void`, or that we are choosing not to return anything.

However, if we replace `void` something else, we can have the function return something back to the user.

```java
// This function returns an int
public static int return5() {
    return 5;
}

public static void main(String[] args) {
    System.out.println(return5()); // prints 5
}
```

In this case, `return5()` will return the value of `5` back to whatever called it. In this case, it will be returned back to `main()` and will be substituted into the `println()` statement, which prints it out to the console.

You can think of it as simply taking whatever the function returns and directly replacing the original function call with that value.

```java
public static void main(String[] args) {
    System.out.println(5); // prints 5
}
```

This function we have included is not that great, since it just returns a static constant. However, let's spice things up a bit by implementing a function that squares a number.

```java
public static int square(int number) {
    return number * number;
}

public static void main(String[] args) {
    System.out.println(square(5)); // prints 25
}
```

This function takes in an argument, squares it, and then substitutes this number back into the program. For instance, you can once again think of the program finally evaluating as:

```java
public static void main(String[] args) {
    System.out.println(25); // prints 25
}
```

Functions with return types can be incredibly powerful and reduce a lot of repeated code, so it is important to make sure you understand them.
