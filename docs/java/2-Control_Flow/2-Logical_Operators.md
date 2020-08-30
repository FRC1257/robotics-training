# Logical Operators

There are three logical operators, `&&`, `||`, and `!`. You may be thinking, "how do I type that straight pipe character?" On most keyboards, you type it by holding shift and hitting the key above Enter/Return. If this doesn’t work, ask around and see if you can find anyone who knows where the character is or just look at your keyboard until you see a straight bar.

The `&&` operator means "and", and the `||’=` operator means "or". Make sure you type 2 of them, typing only one of each character does something entirely different. If you want to learn more, you can research something called Bitwise operations, but they are complex and unnecessary for robot programming.

Back to logical operators, they are commonly used for if statements and booleans. With the And operator `&&`, it only returns true if both sides of the conditional are true. This is a bit hard to explain with words, so below is an example.

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

Similarly, OR operators will return true if either one of their conditionals are true. Below is an example:

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

The final operator is Not (`!`). Unlike the other two operators, it acts on only 1 conditional, rather than 2. It reverses a conditional, making true into false and false into true. Note that this is included in the aforementioned operator `!=`, and was also mentioned when we discussed using booleans in if statements. `if(!boolVar)`.

```java
if(!false) {
    System.out.println("This will print");
}
if(!true) {
    System.out.println("This will not print");
}
```
