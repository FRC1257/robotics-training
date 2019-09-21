# Functions with Arguments

## Importance

One of the main powers of functions is that it can take in arguments. For instance, a function can take in an argument and change how it executes dependent on that argument.

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

Let's say we want to say `Hello!` with the user's name. To do this, we can add an argument to the function that is the user's name. Then, we can enter that name into the function and have the function change dependent on that name.

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

To add an argument, we simply add them inside of the parantheses of the function. In this case, we first put the argument type, in this case a `String`, and then the name of that argument. Then, we can use that argument like a normal variable inside of the function. Then, when we call the function, we can simply add in a value for that argument inside of the parantheses. All of this creates the output:

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

## Another Example

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

We always use `System.out.println("something")` to print out text to the command line. This is an example of a function that is built into Java. `System.out.println` is a function that takes in a `String` argument and then performs a series of actions that results in the text being put on the screen.
