# Console Input	

In our first program, we printed some text to the console. However, our programs have been pretty dull so far with no user interaction. The program always runs the same, no matter what happens. Here, we will discuss how we can get some user input from the console. The console is the screen on the right of repl.it.

 ## Scanner	

`Scanner` is a file included with Java when you install it that we can use in our programs. It enables the program to read input from the user, whether it is through files, the console, or other mediums. In this case, we will be discussing how to use it with the console.

 ## Import Statements	

For our program to use `Scanner`, we must write something called an import statement at the top of our file: `import java.util.Scanner`. This line tells the computer that when running this program, it should grab the `Scanner` file from the `java.util.` folder.. Without it, the program would not know what the `Scanner` file is, and we would not be able to use it.

* `import` tells the program that we want to import something	
* `java.util.` tells the program where the file that we want to import is	
* `Scanner` is the name of the file that we want to import

## Using Scanner

Now that we have imported `Scanner`, we can now use it to grab user input. See the below code:

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);	

        System.out.print("Type in an Integer: ");	
        int testInt = scanner.nextInt();
        System.out.println("Here is your integer: " + testInt);

        System.out.print("Type a String: ");	
        String testString = scanner.next();	
        System.out.println("Here is your string: " + testString);
    }
}
```

In the first line, we have `Scanner scanner = new Scanner(System.in);`. We will learn more in the future of how this specifically works, but for now, you can just copy and paste it.

To actually take in console input, you use commands like `scanner.nextInt()`. This will look at the console and interpret the next message entered into it as an integer. `scanner.next()` acts the same way, except it gives you back a `String` instead.

After you run the program, you might notice that the program freezes after printing in "Type in an Integer: ". This is because it is waiting for your user input. You must type in a number and press enter. Then, the program will continue!

## Other Types You Might Want

 - `int`: `scanner.nextInt()`
 - `double`: `scanner.nextDouble()`
 - `boolean`: `scanner.nextBoolean()`
 - `String` (word): `scanner.next()`
 - `String` (line): `scanner.nextLine()`
