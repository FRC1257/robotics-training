# Logical Operators

There are three logical operators, `&&`, `||`, and `!`. To type the `|` character, hold shift and press the key above Enter/Return. If this doesn’t work, ask around and see if you can find anyone who knows where the character is or just look at your keyboard until you see a straight bar.

> [!WARNING]
> When you're typing `&&` or `||` sure you type 2 of them, as typing only one of each character does something entirely different. If you want to learn more, you can research something called bitwise operations, but they are complex and unnecessary for robot programming.

The `&&` operator means "and", and the `||` operator means "or". They are used to combine two separate conditionals to create more complex conditionals.

The "and" operator `&&` will evaluate to true if both conditionals on the side of it are true.

```java
if(true && true) {
    System.out.println("This will print");
}

if(false && true) {
    System.out.println("This will not print");
}

if(true && false) {
    System.out.println("This will not print");
}

if(false && false) {
    System.out.println("This will not print");
}
```

The "or" (`||`) operator will evaluate to true if either one of the conditionals on the side of it are true.

```java
if(true || true) {
    System.out.println("This will print");
}
if(false || true) {
    System.out.println("This will print");
}
if(true || false) {
    System.out.println("This will print");
}
if(false || false) {
    System.out.println("This will not print");
}
```

The final operator is "not" (`!`). Unlike the other two operators, it acts on only 1 conditional, rather than 2. It reverses the conditional in front of it, making `true` into `false` and `false` into `true`.

```java
if(!false) {
    System.out.println("This will print");
}
if(!true) {
    System.out.println("This will not print");
}
```
