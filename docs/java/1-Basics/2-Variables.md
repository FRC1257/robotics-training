# Variables

## What They Are

In programming, variables are containers to store data in our program. Every variable in Java has a type, which specifies what kind of data it can store (i.e. numbers, text, characters).

## Creating our First Variable

Inside of our `main` block in our code, we can put the following line to make a variable: `int variable = 0;`

Your program should now look something like this:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world! We're learning about variables!");

        int myFirstVariable = 0;
    }
}
```

Let's break down exactly what this does:

* First, we must put the type of the variable: `int`
  * In this case, `int` stands for integer, so the variable can be any whole number
* Next, we put the variable name: `myFirstVariable`
  * This is used to access the variable later when we want to access or modify the data
  * Ideally, good variable names should describe what the data its storing means such as (`numberOfLives` or `robotSpeed`)
* Finally, we must give the variable a value to store with `= 0`

## Using our Variable

Once we've created our variable, we can both modify and access the variable again.

For instance, we can reassign our variable to another value `myFirstVariable = 5;`Since we have already declared the type of `myFirstVariable` and we are simply modifying the contents, we do not need to put `int` again.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world! We're learning about variables!");

        int myFirstVariable = 0;
        myFirstVariable = 5;
    }
}
```

On the other hand, we can access the value in this variable and print it to the user with `System.out.println`.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world! We're learning about variables!");

        int myFirstVariable = 0;
        myFirstVariable = 5;
        System.out.println(myFirstVariable);
    }
}
```

## Variables Example

```java
public class Main {
    public static void main(String[] args) {
        int a = 5;
        System.out.println(a); // prints 5
        a = 3;
        System.out.println(a); // prints 3

        int b = 6;
        System.out.println(b); // prints 6
        System.out.println(a + b); // prints 9

        b = a + 5;
        System.out.println(b); // prints 8

        b = b + 1;
    }
}
```

The above example modifies and accesses variables a few times, so you should walk through the code to make sure you understand what each line does. The most tricky example is probably when we do `b = b + 1;`. What this does is that it takes the value of `b`, adds `1` to it, and then puts this value back in `b`. As a result, this entire line of code just adds `1` to the value stored in `b`.

## Variable Types

In Java, there are multiple primitive data types that come with the language. In the future, we will discuss how to make our own data types and use other custom ones, but here are built in ones:

* `boolean` - true/false (true, false)
* `char` - character ('a', 'b', ')', '/')
* `byte` - smallest integer (10, 13, 100, -13)
* `short` - small integer (1000, -1301, 13910, -10000)
* `int` - medium-sized integer (1390193, 13910391, -131939, 1390139)
* `long` - large integer (1839183918L, 148184914918L, -138918391839L, 1849819482L)
* `float` - small decimal (3.242f, 4.3213f, -5.91238f)
* `double` - large decimal (4.2382983298, -1.23213213, -100.31938898)
  
Note that we have 4 different types for integers and 2 different types of decimals. As we go up and down, we make tradeoffs of amount of significant figures in the number with how much memory it takes up. For robot programming, we will primarily use `boolean`, `int`, and `double`.

## Strings

So far, we have only discussed `char`, which supports a single character. To declare a block of text, we can use a `String`. For example, we can type `String text = "My text here";`.

> [!NOTE]
> In order to make the computer recognize "My text here", we must surround it with quotes. Otherwise, the computer may interpret it as programming keywords or variable names.

Similar to how we can add numbers, we can also add strings, also called concatenation. We can use the `+` symbol to add strings: `String message = "Hello" + " " + "World!"`.

## Bonus: Casting

Let's take a look at the following code, where we try to store a `double` inside of an `int` variable.

```java
public class Main {
    public static void main(String[] args) {
        int c = 4.1;
    }
}
```

An error rises because on the left, we have declared a variable of type `int`. However, we have tried to set it equal to a decimal, which is represented by the `double` type, which does not fit inside of an `int`. The same would happen even if we had put `4.0` instead of `4.1`, as the type would still be a `double` as there is a decimal point.

To resolve this, we must do something called **casting**. We can cast the `double` value to an `int` value, removing the decimal place. We put the type that we want to cast to inside of the parentheses and put it in front of the value we want to cast.

```java
public class Main {
    public static void main(String[] args) {
        int c = (int) 4.1;
    }
}
```

> [!NOTE]
> Sometimes the computer automatically casts some values, and sometimes cannot cast values. For instance, the computer will automatically cast an `int` to a `double` in order to calculate the operation `4.1 + 3`. In this case, the computer automatically casts `3` to `3.0`. However, it will not automatically cast `7.1` to `7` because this results in a lost of information past the decimal point, which the computer will refuse to do. Additionally, the computer will not cast between two data types that don't make sense. For instance, it cannot cast between a `String` and a `int`, because there is no `int` that can properly represent the string `"cat"`.
