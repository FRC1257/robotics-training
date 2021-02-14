# Functions with Arguments

One of the main powers of functions is that it can take in arguments, or values that are passed into the function whenever it is called. These arguments can be used to change how the function behaves.

## Example

Let's look at our `printHello` function from last time.

```java
public static void main(String[] args) {
    printHello();
}

public static void printHello() {
    System.out.println("--------------------");
    System.out.println("       Hello!       ");
    System.out.println("--------------------");
}
```

Let's say we want to say `Hello!` with the user's name. To do this, we can add an argument to the function that is the user's name. Then, we can enter that name into the function and have the function change depending on what was passed in when the function was called.

To add an argument, we simply add them inside of the parantheses after the name of the function.

`printHello(` + put your arguments here + `)`

To define arguments for our function, we can use a format very similar to declaring variables. Each argument has to have a type and a name, and we put those between the parentheses:

```java
printHello(String name)
```

Once we have our argument created, we can use this argument inside of the function just like any variable:

```java
public static void printHello(String name) {
    System.out.println("--------------------");
    System.out.println("Hello " + name + "!");
    System.out.println("--------------------");
}
```

Once we have added the argument to our function, whenever we call the function, we must pass in our argument in between the parentheses:

```java
public static void main(String[] args) {
    printHello("Bob");
}

public static void printHello(String name) {
    System.out.println("--------------------");
    System.out.println("Hello " + name + "!");
    System.out.println("--------------------");
}
```

This produces the output:

```text
--------------------
Hello Bob!
--------------------
```

## Flexibility

With these functions with arguments, we are offered a greater amount of flexibility with our programs. For instance, we could change the name to be able to greet multiple different people.

```java
public static void main(String[] args) {
    printHello("Apple");
    printHello("Banana");
    printHello("Cherry");
}

public static void printHello(String name) {
    System.out.println("--------------------");
    System.out.println("Hello " + name + "!");
    System.out.println("--------------------");
}
```

## Multiple Arguments

We can also take multiple arguments with our program, where we separate our different arguments with commas.

```java
public static void main(String[] args) {
    printAdded(1, 1);
    printAdded(9, 10);
    printAdded(1231, 47829);
}

public static void printAdded(int num1, int num2) {
    int sum = num1 + num2;
    System.out.println(num1 + " + " + num2 + " = " + sum);
}
```

## System.out.println

We always use `System.out.println("something")` to print out text to the command line. This is an example of a function that is built into Java. `System.out.println` is a function that takes in a `String` argument and then performs a series of actions that results in the text being put on the screen. There are plenty of other functions built into Java that are available for us to use that make our lives much easier.
