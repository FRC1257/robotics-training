# First Program

## Our First Java Program

All of our Java programs will have a similar basic structure. This structure is explained below. For now, we will be focusing on single file programs. This one in particular will be called `Main.java`. In codeanywhere.com, you can right click the project name and click `Create File` to make a file. Make sure you end it with `.java` to make it a Java program.

```java

public class Main {
    public static void main(String[] args) {

    }
}

```

The above is essentially the template that will make up all of your programs. Essentially, a program is like a list of instructions, and all of these instructions are placed inside of the labeled area below:

![Highlighted Main](HighlightedMain.png ':size=425x120')

Here, we can put commands and logic that will make our program actually do stuff. Don't worry too much about the stuff around it. All of that is just structural stuff that you don't have to be concerned with right now.

The only difference this template might have is if you make the file name something other than `Main.java`. If you do, you will have to change what comes after `public class`. For instance, `Numbers.java` would have `public class Numbers`.

One of the primary commands we can perform is for our program to print something. For instance, a common example is a program that will print the text `"Hello World!"` to the console. The command we can use for this is a bit long, but it's one of the essential commands we will be using.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```

## Running Our Program

Now that we've written our program, we now have to run it. The way you do this is through the terminal. If you closed that tab, right click your project name and press `SSH Terminal`. If you haven't closed it, just switch to that tab.

Once you get to here, enter the following command: `javac [filename]`. For instance, if you called the file `Main.java`, you would type `javac Main.java`.

What this does is that it will compile your program into a machine usable format. If you look to the right, you will see a new file called `Main.class`. Don't try to understand it, it shouldn't make that much sense.

Next, you can actually run this program. Type `java [filename without .java]`. For instance, if you called the file `Main.java`, you would type `java Main`.

You should see the text "Hello World" appear. Congratulations, you've written and run your first program!

Look at the middle bit, where you can see the text `"Hello World!"`. Try switching this message to something different, but make sure you don't remove the quotation marks. Every time you change the original `.java` file, you have to rerun `javac` to compile it, and then `java` to run it.
