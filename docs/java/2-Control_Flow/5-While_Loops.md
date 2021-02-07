# While Loops

So far, we have learned how to make our programs make decisions depending on the values of variables through `if` statements. The next important thing to learn are loops, which allow us to repeatedly execute code.

The first type of loop we'll learn about is the **`while`** loop. This allows us to run code repeatedly while a conditional is true. An example is shown below (do NOT run the program below as it will crash repl.it)

```java
while(true) {
    System.out.println("This will print an infinite amount of times");
}
```

The `while` loop is very similar to an `if` statement except that as long as the conditional is true, the `while` loop will continue to execute the code inside of it over and over again. Every time the code inside of the while loop is run, the program will check the conditional inside of the `while` loop and see if it should continue running.

In this case, since the conditional inside of the `while` loop is just `true`, this will continue running infinitely and never stop, which will crash repl.it.

Let's take a look at a more useful `while` loop that does not run an infinite amount of times.

```java
int counter = 0;

while(counter < 5) {
    System.out.println(counter);
    counter++;
}
```

What happens here is that we make use of a `int` variable to keep track of how many times our loop has run. `counter` initially starts at `0` and every time the code inside of the loop runs, `counter` will increase by `1`. By setting up the `while` loop so that it will only continue running while `counter` is less than 5, we can limit how many times our loop runs.

Learning to write good while loops and being able to find when you have created an infinite one is a valuable skill to have as a programmer that comes with practice. Most of the time, you will know when your program has an infinite loop when it does not end within a few seconds. In that case, you can abort and investigate the loops to see what went wrong.
