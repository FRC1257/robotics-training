# Scope

In Java, scope means that variable are only accessible inside the area in which they are created. To see this in action, let's take a look at some examples.

```java
public static void main(String[] args) {
    int availableInMain = 0; // this is available everywhere inside of main

    if(true) {
        int availableInIf = 0; // this is only available inside of the if statement

        System.out.println(availableInMain); // we have access
    }

    System.out.println(availableInIf); // we do NOT have access
}
```

As you can see, any variable we create inside of the curly brackets of the `if` statement will **not** be available outside of the `if` statement. After the `if` statement's curly brackets end, then that variable will actually be destroyed. This works the same way as in `if`, `else`, `while`, `for`, or `switch`.

## For Loops

This also applies to any variables we make inside of the `for` loop initialize phase. For instance, the `i` variable we make in our `for` loop is **not** available outside of the `for` loop.

```java
for(int i = 0; i < 5; i++) {
    System.out.println(i);
}
System.out.println(i); // we do NOT have access anymore
```
