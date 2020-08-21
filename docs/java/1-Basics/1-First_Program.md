# First Program

## Our First Java Program

All of our Java programs will have a similar basic structure.. For now, we will be focusing on single file programs. If you go to [repl.it](repl.it) and click the `Start Coding` button in the top right, you will be greeted with a list of programming languages. Select `Java` and then press `Create repl`. You will then be redirected to your programming interface. You should see the following below:

```java

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world!");
    }
}

```

The above is essentially the template that will make up all of your programs. Essentially, a program is like a list of instructions, and all of these instructions are placed inside of the labeled area below:

![Highlighted Main](HighlightedMain.png ':size=425x120')

Here, we can put commands and logic that will make our program actually do stuff. Don't worry too much about the stuff around it. All of that is just structural stuff that you don't have to be concerned with right now.

One of the primary commands we can perform is for our program to print something. For instance, a common example is a program that will print the text `"Hello World!"` to the console, which is the one [repl.it](repl.it) has already filled in for you. You can change the text inside of the `""` to whatever you want to make it print different things.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Put whatever you want here!");
    }
}
```

## Running Our Program

Now that we've written our program, we now have to run it. With [repl.it](repl.it) this is super simple! We just have to press the run button at the top, and after a bit, the program will run! You should be able to see the output "Hello world!" on the right side of the screen.
