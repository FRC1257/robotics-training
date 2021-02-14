# Basics

## What a Function is

In programming, a **function**, also known as a **method**, is a block of code that can be defined in a separate place and runs whenever it is called.

## Function Example

Here is an example of a very basic function that simply prints out the following three statements:

```text
--------------------
       Hello!
--------------------
```

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

Let's break this down:

We first define our function by typing: `public static void printHello()`. For now, you can ignore everything except `printHello`, which will be the name of our function.

Then, inside of the following curly brackets, we can put the code that will run whenever this function is called:

```java
    System.out.println("--------------------");
    System.out.println("       Hello!       ")
    System.out.println("--------------------");
```

Then, inside of `main`, we can call the function we have just created with its name: `printHello();`

All of this comes together to produce the output:

```text
--------------------
       Hello!
--------------------
```

## Function Usage

Functions initially may not seem very useful since we could have just typed the code directly into `main`:

```java
public static void main(String[] args) {
    System.out.println("--------------------");
    System.out.println("       Hello!       ");
    System.out.println("--------------------");
}
```

This would produce the same output. However, with functions, we can very easily reuse this code. For instance, we could print the statements many times quickly by using functions.

```java
public static void main(String[] args) {
    printHello();
    printHello();
    printHello();
    printHello();
    printHello();
}

public static void printHello() {
    System.out.println("--------------------");
    System.out.println("       Hello!       ");
    System.out.println("--------------------");
}
```

On the other hand, if we didn't use functions, the code would be the following, which is not only unnecessarily repeating code, but also hard to read.

```java
public static void main(String[] args) {
    System.out.println("--------------------");
    System.out.println("       Hello!       ");
    System.out.println("--------------------");
    System.out.println("--------------------");
    System.out.println("       Hello!       ");
    System.out.println("--------------------");
    System.out.println("--------------------");
    System.out.println("       Hello!       ");
    System.out.println("--------------------");
    System.out.println("--------------------");
    System.out.println("       Hello!       ");
    System.out.println("--------------------");
    System.out.println("--------------------");
    System.out.println("       Hello!       ");
    System.out.println("--------------------");
}
```

As we increase the usage of this function, the benefits increase as well. Additionally, say we wanted to update the `printHello()` function by changing `Hello!` to `Hello World!`. If we had used the function, we would only have to change one line to make this change. Then, the change would be reflected across all 5 of the print statements. However, if we did not use the function, we would have to change 5 lines, leading to a lot more work.
