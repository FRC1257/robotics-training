# Console Input	

 In our first program, we dealt with console output, where we printed out some text of our choosing. Now, we will learn how to enable the user to enter in some text.	

 ## Scanner	

 Scanner is a file included with Java that we can use in our programs. It enables the program to read input from the user, whether it is through files, the console, or other objects. In this case, we will be discussing how to use it with the console.	

 ## Import Statements	

 In order for our program to use Scanner, we must write something called an import statement at the top of our file: `import java.util.Scanner`. This statement essentially enables our program to use other files. Without it, the program would not know what the Scanner file is, and we would not be able to use it.	

* `import` tells the program that we want to import something	
* `java.util.` tells the program where the file that we want to import is	
* `Scanner` is the name of the file that we want to import

## Using Scanner

Now that we have imported `Scanner`, we must now find a way to use it. See the below code:

```java
public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);	

    System.out.print("Type in an Integer: ");	
    int testInt = scanner.nextInt();
    System.out.println("Here is your integer: " + testInt);

    System.out.print("Type a String: ");	
    String testString = scanner.next();	
    System.out.println("Here is your string: " + testString);
}
```

In the first line, we have `Scanner scanner = new Scanner(System.in);`. We will learn more in the future of how this specifically works, but for now, you can just copy and paste it.

To actually take in console input, you use `scanner.nextInt();` for `int`s and `scanner.next()` for `String`s.

## Other Types You Might Want

 - `int`: `scanner.nextInt()`
 - `double`: `scanner.nextDouble()`
 - `boolean`: `scanner.nextBoolean()`
 - `String` (word): `scanner.next()`
 - `String` (line): `scanner.nextLine()`
