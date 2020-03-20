# For Loops

Before, we investigated while loops, which ran whenever a certain conditional was true. Note that we used the example of

```java
int number = 0;

while(number < 5) {
	System.out.println(number);
	number++;
}
```

Note that this program ran exactly 4 times, when `number` was 0, 1, 2, 3, and 4. When the number finally reached 5, the program stopped. This type of construct for running code 4 times is very common. For instance, when we want to do a move 100 times, rather than type out the lines 100 times, we might want to put it in a loop. By changing the number from 5 to 100, we can do this, and just put our updating code between the `{` and the `number++;`

However, this is a lot of code just to run this update code, and it’s a bit messy. As a result, programmers have invented something known as the **``for``** loop. This is a bit weird to learn at first, but it’s incredibly valuable for programmers to learn. The syntax is below

```java
for(int i = 0; i < 5; i++) {
    System.out.println(i);
}
```

The beginning `int i = 0` looks like it is defining a variable. And it is! It’s analogous to the `number` variable we had with the while loop. It just creates a variable and sets it to a value. It is very common for programmers to use the dummy variable `i`, but you can name it what you want.

The next part is after a semicolon `; i < 10`. In this section, we put our conditional. The code inside the for loop is run as long as this conditional is run. Just like while loops, we have to be careful to avoid infinite loops.

Finally, after another semicolon, we put the last part, `; i++`. In this section, we do the incrementing of the variable. This allows us to count up and avoid infinite loops. Also, note that there is no semicolon after `i++`. This is important, as including another semicolon will create an error.

Note that the variable `i` is not actually accessible outside of the for loop. It is limited to the scope of the for loop. If you want to use that number somewhere else, you will have to store it differently.

```java
for(int i = 0; i < 10; i++) {
    System.out.println(i);
}
// This will not work, we cannot access i anymore
System.out.println(i);

// Create the variable outside of the loop, rather than inside
int i = 0;
// Note that we no longer put “int” in front of “i”, since the variable is already created
for(i = 0; i < 10; i++) {
    System.out.println(i);
}
// This will work, we can access i
System.out.println(i);
```

You may notice that we use `0` and `<` in our `for` loops. This means that when we put to count 5 times, we won’t count 1, 2, 3, 4, 5, but rather 0, 1, 2, 3, 4. For counting/outputting programs, you can replace the `0` with a `1` and the `<` with a `<=`.

```java
for(int i = 1; i <= 5; i++) {
    System.out.println(i);
}
```

## Robotics Programming

We generally try to avoid using `for` loops in robot code as if a `for` loop ever gets stuck, it can actually block our code and prevent it from continuing, halting all functionality. However, the idea of a `for` loop is still important to have as a programmer, which is why we teach it. 
