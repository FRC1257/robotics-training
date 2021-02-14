# Functions with Return Types

When we have a function, we have the option of whether or not to return a value back to whatever called that function. Up until now, we have always specificed the return type of our functions as `void` when we create the function, which means that we are choosing not to return anything.

However, if we replace `void` something else, we can have the function return something back to the user.

So far, whenever we have created a function, we have put `void` in front of it:

```java
public static void printHello() {

}
```

This means that we are designated that our function is not **returning** anything. When a function returns something, it means that once the function has completed running, it gives a value back to whatever called it.

To make our function `return` something, we must first change `void` to what type of variable our function is returning. For instance, let's say we want to make our function return an `int`. We could write it as:

```java
public static int return5() {

}
```

However, now we need to write the code inside of our function to return this `int` value. We can do this with a `return` statement:

```java
public static int return5() {
    System.out.println("This function is going to return 5");
    return 5;
}
```

Now that we have defined our function and its return value, we can use this return value whenever we call our function. For instance, let's say that we call our function like the following:

```java
public static void main(String[] args) {
    int value = return5();

    System.out.println(value);
}
```

What happens here is that first the `return5()` function is called. This means that "This function is going to return 5" is going to be printed to the console. At the end of the `return5()` function, we get to the line `return 5;`, which ends our function. Once this happens, we go back to where the function was called. We can essentially take what the function returned and in our head, replace `return5()` with it.

```java
public static void main(String[] args) {
    int value = 5;

    System.out.println(value); // this will print "5"
}
```

Here is the complete code for this example:

```java
// This function returns an int
public static int return5() {
    System.out.println("This function is going to return 5");
    return 5;
}

public static void main(String[] args) {
    int value = return5(); // "This function is going to return 5" will be printed to the console

    System.out.println(value); // this will print "5"
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

Functions with return types can be incredibly powerful when combined with arguments and reduce a lot of repeated code, so it is important to make sure you understand them.

## Builtin Functions

One example of a builtin function that we've been using so far is `scanner.nextInt()`. This is a function that returns an `int` back to us that contains the latest integer that the user typed into the console. Another example would be `Math.sqrt(number)`, which takes the square root of the argument that we pass in and returns it back to us.
