# For Loops

Before, we investigated `while` loops, which ran whenever a certain conditional was true. We used the example below as a typical case of a `while` loop.

```java
int counter = 0;

while(counter < 5) {
    System.out.println(counter);
    counter++;
}
```

In this case, we used a `counter` variable to keep track of how many times are loop has run, and then we used that to control our loop and make sure it didn't run an infinite amount of times.

However, this method takes up several lines and isn't very concise. As an alternative, we can use `for` loops, which condenses all of the above logic into just a few lines.

```java
for(int i = 0; i < 5; i++) {
    System.out.println(i);
}
```

We can break down this `for` loop into three parts that are separated by semicolons:
`for(initialize; test; update)`

* **initialize**: This code runs *before* our loop begins. We typically use it to declare a counting variable.
* **test**: This code is our conditional that defines when our loop should continue running. We typically use it to check our counting variable against something.
* **update**: This code runs *after each time our loops run*. We typically use it to increment our counting variable.

Let's take a look at each of these three sections with the example of `for(int i = 0; i < 5; i++)`

* `int i = 0`: This code sets up our counter variable. Note that it is common practice that we typically use `i` in `for` loops.
* `i < 5`: This code defines when our loop should continue running, which is as long as our counter is less than 5. Therefore, the `for` loop will execute 5 times in total.
* `i++`: This code increments our counting variable after each time our `for` loop runs.

Note that the loops we have used so far count from 0 to 4 rather than from 1 to 5. We do this because many things in programming start from `0` rather than `1` such as arrays. However, if we wanted to do the latter instead, we could adjust our `for` loop as follows:

```java
// Will print 1, 2, 3, 4, 5 instead of 0, 1, 2, 3, 4
for(int i = 1; i <= 5; i++) {
    System.out.println(i);
}
```
