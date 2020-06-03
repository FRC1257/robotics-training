# Operators

Programming is all about manipulating values, so it makes sense that it has some basic mathematical operations. Here are some of the arithmetic operators available in Java:

* `+`  Addition
* `-` Subtraction
* `*` Multiplication
* `/` Division
* `%` Modulo (Remainder)

> [!WARNING]
> You have to be careful if you have an `int` like `3` and another one like `4`, `3 / 4` will not return `0.75`. Instead, it will give `0`. This is because on the left, you have an `int`, and on the right, you have an `int`. Therefore, when you do the operation, you will get another `int`, so the `.75` part will be chopped off, nor tounded. If you want the operation to return `0.75`, you would have to do `3.0 / 4`, `3 / 4.0`, or `3.0 / 4.0` to make sure the computer understands we want to work with decimals.

The fifth operator, `%` is an interesting one. It returns the remainder when the first number is divided by the second one. For instance, `3 % 2 = 1`, `4 % 2 = 0`, `10 % 3 = 1`, etc.

## Variables

These operators also work on variables! (Note: code segments may omit the structure around `main` for conciseness, but note that you still need them)

```java
int a = 3;
int b = 4;

int c = a + b; // This is 7
int d = a * b; // This is 12
int e = b - a; // This is 1
double f = ((double) a) / b; // This is 0.75
// Note the cast in order to make sure the first variable is treated as a double
// Also, parantheses are used to make sure the variable is casted before the division takes place
int g = b % a; // This is 1
```

## Shortcuts

When programming, you may find yourself wanting to add a number to a variable. For instance, if you were making a game, if a player picks up a heart, you may want to increase their health. You could type the following:

```java
int health = 2;

//Player picks up a heart
heath = health + 1;
//Health is now 3
```

In this case, we are reassigning the variable health to its current value plus 1. It's a weird concept to grasp, but try to just replace the second `health` with a `2` to see what is happening.

However, programmers are lazy. They want to be able to compact this statement, so they made up a new operator: `health += 1`. In this case, the operator `+=` tells the computer to just increase the value of `health` by `1`. This type of operator exists for all of the other operations:

* `+=`
* `-=`
* `*=`
* `/=`
* `%=`

However, programmers are even lazier. They frequently type the expression `+= 1` and `-= 1`, so they invented another shortcut: `++` and `--`. `health++` means the same thing as `health += 1` and `health = health + 1`; it is just shorter.

## More Operators

There are more operators in Java, including the ternary operators, conditional operators, bitwise oeprators. We will be covering ternary/conditional soon, and bitwise is too advanced for what we are doing. If you do want to learn more: go [here](https://www.geeksforgeeks.org/operators-in-java/).
