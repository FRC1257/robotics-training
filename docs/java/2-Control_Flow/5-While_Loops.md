# While Loops

Right now, we can make a program that has some decision-making, but is still linear. One of the primary tools that programmers have to deal with this is loops. This allows us to repeat code and run it constantly. However, having a program run forever with no control over when it stops is very bad. Therefore, we have to have some conditional to determine when the loop will stop. For instance, when the user quits the application, we might tell the program to stop the loop that updates buttons/graphics. Also, when a loop has run a certain amount of times, we might want the program to stop looping.

To write this in code, we use something called a **`while`** loop. This allows us to run code repeatedly while a conditional is true. An example is shown below:

```java
int number = 0;

while(number < 5) {
    System.out.println(number);
    number++;
}
```

Just like an if statement, we put the conditional inside the braces, and as long as that conditional is true, the code inside will be run. Note that it is a very common mistake to write loops that will never end. For instance, the following code will run forever.

```java
int number = 0;

while(number < 5) {
    System.out.println(number);
}
```

On the other hand, the original code we had:

```java
int number = 0;

while(number < 5) {
    System.out.println(number);
    number++;
}
```

will not run forever. This is because as the number grows larger within the while loop, the number will eventually reach the value 5. As a result, the loop will break, causing the program to terminate. On the other hand, the other while loop will have the number stay constant. The conditional will never become true, since the crucial line of `number++;` is missing.

Learning to write good while loops and being able to find when you have created an infinite one is a valuable skill to have as a programmer that comes with practice. Most of the time, you will know when your program has an infinite loop when it does not end within a few seconds. In that case, you can abort and investigate the loops to see what went wrong.

## Robotics Programming

We generally try to avoid using while loops in robot code as if a while loop ever gets stuck, it can actually block our code and prevent it from continuing, halting all functionality. This has happened to us before and is a pain to debug, so we generally try to avoid using while loops. However, the idea of a while loop is still important to have as a programmer, which is why we teach it.
